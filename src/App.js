import React, { useEffect, useRef, useState } from 'react';
import { AR } from 'js-aruco';
import classNames from 'classnames';
import './App.scss';

function App() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);
  const [hasCapture, setHasCapture] = useState(false);
  const [animationFrame, setAnimationFrame] = useState(null);

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

  const getMarkers = () => {
    const detector = new AR.Detector();
    const MAX_TOLERANCE = 80;
    const TOLERANCE_INTERVAL = 5;

    const dataSets = [];
    let index = 0;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    for (let tolerance = 0; tolerance <= MAX_TOLERANCE; tolerance += TOLERANCE_INTERVAL) {
      dataSets[index] = context.getImageData(0, 0, canvas.width, canvas.height);
      index++;
    }

    for (let i = 0; i < dataSets[0].data.length; i += 4) {
      index = 0;
      for (let tolerance = 0; tolerance <= MAX_TOLERANCE; tolerance += TOLERANCE_INTERVAL) {
        const avg = (dataSets[index].data[i] + dataSets[index].data[i + 1] + dataSets[index].data[i + 2]) / 3;

        dataSets[index].data[i] = avg < tolerance ? 0 : dataSets[index].data[i];
        dataSets[index].data[i + 1] = avg < tolerance ? 0 : dataSets[index].data[i + 1];
        dataSets[index].data[i + 2] = avg < tolerance ? 0 : dataSets[index].data[i + 2];
        index++;
      }
    }

    index = 0;

    for (let tolerance = 0; tolerance <= MAX_TOLERANCE; tolerance += TOLERANCE_INTERVAL) {
      const markers = detector.detect(dataSets[index]);

      index++;

      if (isAllMarkersDetected(markers)) {
        return markers;
      }
    }
    return false
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

    startCamera();
  }, []);

  const stopCapture = () => {
    if (animationFrame !== null){
      window.cancelAnimationFrame(animationFrame);
    }
  };

  useEffect(() => {
    if (mediaStream) {
      const tick = () => {
        if (mediaStream) {
          {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
              const context = canvas.getContext('2d');
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              const markers = getMarkers();
    
              if (markers) {
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
  }, [mediaStream]);
  
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
            'has-capture': hasCapture
          })}
          ref={canvasRef}
        />
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
        <button onClick={() => {
          stopCapture();
          stopCamera(mediaStream);
        }}>Stop</button>
      </div>
    </div>
  );
}

export default App;
