(this["webpackJsonparuco-scan"]=this["webpackJsonparuco-scan"]||[]).push([[0],{13:function(e,a,t){},17:function(e,a,t){},18:function(e,a,t){"use strict";t.r(a);var n=t(0),r=t.n(n),c=t(6),i=t.n(c),o=(t(13),t(1)),l=t(7),s=t(3),u=t.n(s);t(17);var d=function(){var e=Object(n.useRef)(null),a=Object(n.useRef)(null),t=Object(n.useRef)(null),c=Object(n.useRef)(null),i=Object(n.useState)(null),s=Object(o.a)(i,2),d=s[0],m=s[1],h=Object(n.useState)(!1),f=Object(o.a)(h,2),w=f[0],v=f[1],g=Object(n.useState)(40),b=Object(o.a)(g,2),E=b[0],p=b[1],y=Object(n.useState)(null),O=Object(o.a)(y,2),j=O[0],M=O[1],k=Object(n.useState)(!1),x=Object(o.a)(k,2),A=x[0],N=x[1],C=Object(n.useState)(!1),D=Object(o.a)(C,2),U=D[0],R=D[1],S=function(e){e&&e.getTracks().forEach((function(e){return e.stop()}))},I=function(){var e=c.current;void 0===window.navigator.mediaDevices&&(window.navigator.mediaDevices={}),void 0===window.navigator.mediaDevices.getUserMedia&&(window.navigator.mediaDevices.getUserMedia=function(e){var a=window.navigator.webkitGetUserMedia||window.navigator.mozGetUserMedia;return a?new Promise((function(t,n){a.call(window.navigator,e,t,n)})):Promise.reject(new Error("getUserMedia is not implemented in this browser"))}),window.navigator.mediaDevices.getUserMedia({video:!0}).then((function(a){"srcObject"in e?e.srcObject=a:e.src=window.URL.createObjectURL(a),m(a)}))};return Object(n.useEffect)((function(){var e=a.current;e.width=e.offsetWidth,e.height=e.offsetHeight,t.current.width=e.width,t.current.height=e.height,I()}),[]),Object(n.useEffect)((function(){if(d){var e=new l.AR.Detector,n=function(){if(d){var n=a.current,i=c.current;if(i&&i.readyState===i.HAVE_ENOUGH_DATA){var o=n.getContext("2d");o.drawImage(i,0,0,n.width,n.height);var l=o.getImageData(0,0,n.width,n.height);console.log(E);for(var s=0;s<l.data.length;s+=4){var u=(l.data[s]+l.data[s+1]+l.data[s+2])/3;l.data[s]=u<E?0:U?u:l.data[s],l.data[s+1]=u<E?0:U?u:l.data[s+1],l.data[s+2]=u<E?0:U?u:l.data[s+2]}t.current.getContext("2d").putImageData(l,0,0,0,0,n.width,n.height);var m=e.detect(l);if(function(e){var a={};e.forEach((function(e){a[e.id]=e}));var t=4===Object.keys(a).length;if(t){var n=a[0].corners[0].y>a[2].corners[3].y,r=Math.abs(a[1].corners[1].y-a[0].corners[0].y),c=Math.abs(a[3].corners[2].y-a[2].corners[3].y);if(n||r>25||c>25)return!1}return t}(m)){var h=function(e){var a={};e.forEach((function(e){a[e.id]=e}));var t=Math.min(a[0].corners[0].x,a[2].corners[3].x),n=Math.max(a[1].corners[1].x,a[3].corners[2].x),r=Math.min(a[0].corners[0].y,a[1].corners[1].y);return{x:t,y:r,width:n-t,height:Math.max(a[2].corners[3].y,a[3].corners[2].y)-r}}(m);o.drawImage(o.canvas,h.x,h.y,h.width,h.height,0,0,n.width,n.height),S(d),v(!0)}else r()}else r()}},r=function(){null!==j&&window.cancelAnimationFrame(j),M(window.requestAnimationFrame(n))};r()}return function(){S(d)}}),[d,U,E]),r.a.createElement("div",{className:"scan-edit",ref:e},r.a.createElement("div",{className:"scan-overlay"}),r.a.createElement("div",{className:"scan-header"},"Align a section of your Mathletics Paper with the area below"),r.a.createElement("video",{className:"hidden",autoPlay:!0,playsInline:!0,ref:c}),r.a.createElement("div",{className:"camera-area"},r.a.createElement("canvas",{className:u()({"has-capture":w,hidden:A}),ref:a}),r.a.createElement("canvas",{className:u()({hidden:!A}),ref:t})),w&&r.a.createElement("button",{className:"btn-retake",onClick:function(){v(!1),I()}},"Rescan work"),r.a.createElement("div",{className:"scan-footer"},r.a.createElement("label",null,r.a.createElement("span",null,"Tolerance: "),r.a.createElement("input",{type:"text",onChange:function(e){var a=e.target.value;S(d),m(null),window.cancelAnimationFrame(j),p(parseInt(a,10)),I()}})),r.a.createElement("label",{onClick:function(){N(!1)}},r.a.createElement("input",{type:"radio",name:"canvas"}),r.a.createElement("span",null,"Original")),r.a.createElement("label",{onClick:function(){N(!0)}},r.a.createElement("input",{type:"radio",name:"canvas"}),r.a.createElement("span",null,"Mirror")),r.a.createElement("label",{onClick:function(){S(d),m(null),window.cancelAnimationFrame(j),R(!1),I()}},r.a.createElement("input",{type:"radio",name:"color"}),r.a.createElement("span",null,"Color")),r.a.createElement("label",{onClick:function(){S(d),m(null),window.cancelAnimationFrame(j),R(!0),I()}},r.a.createElement("input",{type:"radio",name:"color"}),r.a.createElement("span",null,"Mono"))))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));i.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(d,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))},8:function(e,a,t){e.exports=t(18)}},[[8,1,2]]]);
//# sourceMappingURL=main.846ccb90.chunk.js.map