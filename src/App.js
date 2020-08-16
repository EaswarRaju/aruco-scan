import React, { useEffect, useRef, useState } from 'react';
import { AR } from 'js-aruco';
import classNames from 'classnames';
import './App.scss';

function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mirrorRef = useRef(null);
  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [hasCapture, setHasCapture] = useState(false);
  const [tolerance, setTolerance] = useState(40);
  const [animationFrame, setAnimationFrame] = useState(null);
  const [showMirror, setShowMirror] = useState(false);
  const [showGreyScaled, setShowGreyScaled] = useState(false);

  const TOP_LEFT = 0;
  const TOP_RIGHT = 1;
  const BOTTOM_LEFT = 2;
  const BOTTOM_RIGHT = 3;

  const isAllMarkersDetected = (detectedMarkers) => {
    const markers = {};
    detectedMarkers.forEach((marker) => { markers[marker.id] = marker; });
    const allMarkersDetected = Object.keys(markers).length === 4;
    if (allMarkersDetected) {
      const ORIENTATION_OFFSET = 25;
      const isFlipped = markers[TOP_LEFT].corners[0].y > markers[BOTTOM_LEFT].corners[3].y;
      const alignDiffTop = Math.abs(markers[TOP_RIGHT].corners[1].y - markers[TOP_LEFT].corners[0].y);
      const alignDiffBottom = Math.abs(markers[BOTTOM_RIGHT].corners[2].y - markers[BOTTOM_LEFT].corners[3].y);
      if (isFlipped || alignDiffTop > ORIENTATION_OFFSET || alignDiffBottom > ORIENTATION_OFFSET) {
        return false;
      }
    }
    return allMarkersDetected;
  };

  const getCorners = (markers) => {
    const markerPositions = {};

    markers.forEach((marker) => { markerPositions[marker.id] = marker; });

    const startPointX = Math.min(
      markerPositions[TOP_LEFT].corners[0].x,
      markerPositions[BOTTOM_LEFT].corners[3].x
    );

    const endPointX = Math.max(
      markerPositions[TOP_RIGHT].corners[1].x,
      markerPositions[BOTTOM_RIGHT].corners[2].x
    );

    const startPointY = Math.min(
      markerPositions[TOP_LEFT].corners[0].y,
      markerPositions[TOP_RIGHT].corners[1].y
    );

    const endPointY = Math.max(
      markerPositions[BOTTOM_LEFT].corners[3].y,
      markerPositions[BOTTOM_RIGHT].corners[2].y
    );

    return {
      x: startPointX,
      y: startPointY,
      width: endPointX - startPointX,
      height: endPointY - startPointY
    };
  };

  const stopCamera = (stream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startCamera = () => {
    const video = videoRef.current;

    if (window.navigator.mediaDevices === undefined) {
      window.navigator.mediaDevices = {};
    }

    if (window.navigator.mediaDevices.getUserMedia === undefined) {
      window.navigator.mediaDevices.getUserMedia = (constraints) => {
        const getUserMedia = window.navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
        if (!getUserMedia) {
          return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
        }

        return new Promise((resolve, reject) => {
          getUserMedia.call(window.navigator, constraints, resolve, reject);
        });
      };
    }

    window.navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if ('srcObject' in video) {
          video.srcObject = stream;
        } else {
          video.src = window.URL.createObjectURL(stream);
        }
        setMediaStream(stream);
      });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    mirrorRef.current.width = canvas.width;
    mirrorRef.current.height = canvas.height;

    startCamera();
  }, []);

  const stopCapture = () => {
    if (animationFrame !== null){
      window.cancelAnimationFrame(animationFrame);
    }
  };

  useEffect(() => {
    if (mediaStream) {
      const detector = new AR.Detector();
      const tick = () => {
        if (mediaStream) {
          {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
              const context = canvas.getContext('2d');
              context.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    
              console.log(tolerance);
    
              for (let i = 0; i < imageData.data.length; i += 4) {
                const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
    
                imageData.data[i] = avg < tolerance ? 0 : (showGreyScaled ? avg : imageData.data[i]);
                imageData.data[i + 1] = avg < tolerance ? 0 : (showGreyScaled ? avg : imageData.data[i + 1]);
                imageData.data[i + 2] = avg < tolerance ? 0 : (showGreyScaled ? avg : imageData.data[i + 2]);
              }
    
              const mirrorContext = mirrorRef.current.getContext('2d');
              mirrorContext.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
    
              const markers = detector.detect(imageData);
    
              if (isAllMarkersDetected(markers)) {
                const corners = getCorners(markers);
                context.drawImage(
                  context.canvas,
                  corners.x,
                  corners.y,
                  corners.width,
                  corners.height,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                stopCamera(mediaStream);
                setHasCapture(true);
              } else {
                startCapture();
              }
            } else {
              startCapture();
            }
          };
        }
      }
      const startCapture = () => {
        stopCapture();
        setAnimationFrame(window.requestAnimationFrame(tick));
      };
      startCapture();
    }

    return () => {
      stopCamera(mediaStream);
    };
  }, [mediaStream, showGreyScaled, tolerance]); // eslint-disable-line
  
  return (
    <div className="scan-edit" ref={containerRef}>
      <div className="scan-overlay" />
      <div className="scan-header">
        Align a section of your Mathletics Paper with the area below
      </div>
      <video className="hidden" autoPlay playsInline ref={videoRef} />
      <div className="camera-area">
        <canvas
          className={classNames({
            'has-capture': hasCapture,
            hidden: showMirror
          })}
          ref={canvasRef}
        />
        <canvas className={classNames({hidden: !showMirror})} ref={mirrorRef} />
      </div>
      {hasCapture &&
        <button
          className="btn-retake"
          onClick={() => {
            setHasCapture(false);
            startCamera();
          }}
        >
          Rescan work
        </button>
      }
      <div className="scan-footer">
        <label>
          <span>Tolerance: </span>
          <input type="text" onChange={({ target: { value } }) => {
            stopCamera(mediaStream);
            setMediaStream(null);
            window.cancelAnimationFrame(animationFrame);
            setTolerance(parseInt(value, 10));
            startCamera();
          }} />
        </label>
        <label onClick={() => {
          setShowMirror(false);
        }}>
          <input type="radio" name="canvas" />
          <span>Original</span>
        </label>
        <label onClick={() => {
          setShowMirror(true);
        }}>
          <input type="radio" name="canvas" />
          <span>Mirror</span>
        </label>
        <label onClick={() => {
          stopCamera(mediaStream);
          setMediaStream(null);
          window.cancelAnimationFrame(animationFrame);
          setShowGreyScaled(false);
          startCamera();
        }}>
          <input type="radio" name="color" />
          <span>Color</span>
        </label>
        <label onClick={() => {
          stopCamera(mediaStream);
          setMediaStream(null);
          window.cancelAnimationFrame(animationFrame);
          setShowGreyScaled(true);
          startCamera();
        }}>
          <input type="radio" name="color" />
          <span>Mono</span>
        </label>
      </div>
    </div>
  );
}

export default App;
