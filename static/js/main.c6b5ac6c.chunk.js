(this["webpackJsonpface-recognition-pomodoro"]=this["webpackJsonpface-recognition-pomodoro"]||[]).push([[0],{159:function(e,t,n){"use strict";n.d(t,"b",(function(){return j})),n.d(t,"a",(function(){return b}));var i,a,o,c,s=n(38),r=n(217),l=n.n(r),d=n(39),u=n(3);function j(e){var t=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=Math.floor(e);if(n<60)return"".concat(n,"s");if(n<3600){var i=Math.floor(n/60),a=n-60*i;return t?"".concat(i,"m ").concat(a,"s"):"".concat(i,"m")}var o=Math.floor(n/60),c=o%60,s=Math.floor(o/60);return"".concat(s,"h ").concat(c,"m")}function b(e){var t=e.record,n=e.index,r=n?"Pomodoro #".concat(n):void 0;return Object(u.jsx)(u.Fragment,{children:Object(u.jsx)(l.a,{title:r,children:Object(u.jsxs)("div",{className:Object(d.a)(i||(i=Object(s.a)(["\n          display: flex;\n          justify-content: space-around;\n          align-item: center;\n        "]))),children:[Object(u.jsx)("span",{className:Object(d.a)(a||(a=Object(s.a)(["\n          border-radius: 50%;\n          background: #b0003a;\n          width: 3em;\n          height: 3em;\n          text-align: center;\n          vertical-align: middle;\n          display: inline-block;\n          line-height: 3em;\n          font-size: 1.5em;\n          color: white;\n          font-weight: bold;\n        "]))),children:j(t.timePeriod)}),Object(u.jsx)("div",{className:Object(d.a)(o||(o=Object(s.a)(["\n              display: flex;\n              align-item: center;\n              justify-content: space-around;\n              flex-direction: column;\n            "]))),children:Object(u.jsxs)("p",{className:Object(d.a)(c||(c=Object(s.a)(["\n              font-size: 1.5em;\n              font-weight: bold;\n              margin: 0 0 0 10px;\n            "]))),children:[new Date(t.startTime).toLocaleTimeString().slice(0,5)," - ",new Date(t.endTime).toLocaleTimeString().slice(0,5)]})})]})})})}},171:function(e,t,n){"use strict";var i=n(0),a=n(216),o=n.n(a),c=(n(263),n(264),n(3));t.a=function(e){var t=Object(i.useRef)(null),n=Object(i.useRef)(null),a=e.startTime;return Object(i.useEffect)((function(){null===n.current&&(n.current=new o.a(t.current,new Date(a),{face:"HourCounter",showLabels:!1}),n.current.originalValue=new Date(a),n.current.value=new Date,n.current.start()),(a!==n.current.originalValue.toJSON()||Math.abs(new Date-n.current.value.value)>1e3)&&(n.current.originalValue=new Date(a),n.current.value=new Date)})),Object(c.jsx)("div",{ref:t})}},172:function(e,t,n){"use strict";n.d(t,"a",(function(){return r}));var i,a=n(38),o=n(39),c=n(3),s=Object(o.a)(i||(i=Object(a.a)(["\n  font-size: 20vw;\n  margin: 0 auto;\n  text-align: center;\n  @media (min-width: 700px) {\n    font-size: 140px;\n  }\n  @media (max-width: 350px) {\n    font-size: 75px;\n  }\n"])));function r(e){var t=e.focus?"WORKING":"REST",n=e.className||s;return Object(c.jsx)("p",{className:n,children:t})}},264:function(e,t,n){},429:function(e,t,n){},480:function(e,t,n){"use strict";n.r(t);var i,a,o=n(0),c=n.n(o),s=n(210),r=n.n(s),l=n(38),d=n(5),u=n(4),j=n(113),b=n(39),h=n(501),f=n(211),m=n(50),O=n(13),g=(n(128),n(502)),x=(n(247),n(31)),p=n(43),v=n(212),y=n.n(v),w=n(214),C=n.n(w),S=n(215),T=n.n(S),k=n(69),R=n(35),P=(n(129),n(228)),D=(n(250),n(252),n(3));function I(e){return Object(D.jsxs)(R.a,{use:"body2",tag:"div",className:Object(b.a)(i||(i=Object(l.a)(["text-align: center"]))),children:[e.msg," ",e.status?Object(D.jsx)(C.a,{style:{color:"#1faa00"}}):Object(D.jsx)(T.a,{style:{color:"#a30000"}})]})}function N(e,t,n,i){var a=e?"Camera Ready:":"Camera Supported",o=e?t:e;return Object(D.jsxs)(O.a,{children:[Object(D.jsx)(O.b,{desktop:4,span:2,phone:4,children:Object(D.jsx)(I,{msg:a,status:o})}),Object(D.jsx)(O.b,{desktop:4,span:2,phone:4,children:Object(D.jsx)(I,{msg:"Model loaded:",status:i>1})}),Object(D.jsx)(O.b,{desktop:4,span:2,phone:4,children:Object(D.jsx)(I,{msg:"Face Detected:",status:n})})]})}var F,M=function(e){var t=Object(o.useContext)(k.a),i=Object(o.useRef)(null),c=Object(o.useRef)(null),s=Object(o.useState)(!1),r=Object(d.a)(s,2),u=r[0],h=r[1],f=Object(o.useState)("mediaDevices"in navigator),m=Object(d.a)(f,1)[0],g=Object(o.useState)(!1),v=Object(d.a)(g,2),w=v[0],C=v[1],S=e.onFaceDetectionResult,T=t.faceRecognition.detectionInterval,R=t.faceRecognition.scoreThreshold,I=t.enableDetection,F=Object(o.useState)(!1),M=Object(d.a)(F,2),V=M[0],L=M[1],z=Object(o.useRef)(null),W=Object(o.useRef)(null),q="ImageCapture"in window;Object(o.useEffect)((function(){if(I){var e={modelBasePath:"https://cdn.jsdelivr.net/npm/@vladmandic/human/models/",wasmPath:"/face-recognition-pomodoro/models/",face:{enabled:!0,emotion:{enabled:!1},antispoof:{enabled:!1},liveness:{enabled:!1},mesh:{enabled:!0},attention:{enabled:!1},iris:{enabled:!1},description:{enabled:!1}},body:{enabled:!1},hand:{enabled:!1},object:{enabled:!1},gesture:{enabled:!1},debug:!0};n.e(4).then(n.bind(null,546)).then((function(t){W.current=new t.Human(e),W.current.init(e).then((function(){W.current.load(e),console.log("Human init",W.current)}))}))}}),[]),Object(j.a)((function(){if(I&&!V&&W.current){var e=z.current&&"live"===z.current.readyState&&!z.current.muted&&z.current.enabled;e!==w&&C(e),e&&function(){n.apply(this,arguments)}()}function n(){return(n=Object(p.a)(Object(x.a)().mark((function e(){var n,a,o,s,r;return Object(x.a)().wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,L(!0),n=i.current.video,a=n,!q){e.next=9;break}return o=new ImageCapture(z.current),e.next=8,o.grabFrame();case 8:a=e.sent;case 9:return e.next=11,W.current.detect(a);case 11:s=e.sent,r=s.face.filter((function(e){return e.score>R})).at(-1),S(r),h(r),t.faceRecognition.showFaceRecognitionCanvas&&(W.current.draw.canvas(a,c.current),W.current.draw.all(c.current,s));case 16:return e.prev=16,L(!1),e.finish(16);case 19:case"end":return e.stop()}}),e,null,[[0,,16,19]])})))).apply(this,arguments)}}),1e3*T,!0);var E={width:{ideal:640},height:{ideal:480},facingMode:"user"};I&&!t.faceRecognition.showCameraPreview&&navigator.mediaDevices.getSupportedConstraints&&navigator.mediaDevices.getSupportedConstraints().frameRate&&(E.frameRate={ideal:2});var H=q?"0px":"1px",J=t.faceRecognition.showCameraPreview?"100%":H,U=W.current?Object.keys(W.current.models).filter((function(e){return null!==W.current.models[e]})).length:0,B=.1*m+.4*w+U/2*.5;return Object(D.jsx)(D.Fragment,{children:Object(D.jsxs)(O.a,{children:[Object(D.jsxs)(O.b,{span:12,children:[Object(D.jsx)(P.a,{closed:B>=1,progress:B}),I&&t.faceRecognition.showFaceRecognitionStatus?N(m,w,u,U):Object(D.jsx)(D.Fragment,{})]}),I?Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)("div",{className:Object(b.a)(a||(a=Object(l.a)(["\n              height: ",";\n              width: ",";\n              overflow: hidden;\n            "])),J,J),children:Object(D.jsx)(y.a,{audio:!1,ref:i,screenshotFormat:"image/jpeg",videoConstraints:E,onUserMedia:function(e){console.log("New media stream",e),z.current=e.getVideoTracks()[0]},onUserMediaError:function(e){return console.log(e)}})})}):Object(D.jsx)(D.Fragment,{}),I&&W&&t.faceRecognition.showFaceRecognitionCanvas?Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)("canvas",{width:"640px",height:"480px",ref:c})}):Object(D.jsx)(D.Fragment,{})]})})},V=n(171),L=n(172),z=n(159),W=c.a.lazy((function(){return Promise.all([n.e(3),n.e(7)]).then(n.bind(null,549))})),q=c.a.lazy((function(){return n.e(8).then(n.bind(null,548))})),E=c.a.lazy((function(){return Promise.all([n.e(5),n.e(9)]).then(n.bind(null,545))}));var H=function(e){var t=Object(o.useContext)(k.a),n=t.alertStudySeconds,i=t.alertRestSeconds,a=t.history.maxLocalStorageTimeSlot,c=Object(o.useState)(""),s=Object(d.a)(c,2),r=s[0],x=s[1],p=Object(o.useState)(!1),v=Object(d.a)(p,2),y=v[0],w=v[1],C=Object(o.useState)(!1),S=Object(d.a)(C,2),T=S[0],R=S[1];function P(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0],t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;console.log(new Date,"Added new session: detected:",e,"startTime",t);var n=t||(new Date).toJSON(),i=Math.floor((new Date-new Date(n))/1e3);return{startTime:n,endTime:(new Date).toJSON(),detected:e,timePeriod:i}}var I=Object(h.a)("mergedTimeTable",{defaultValue:[P(!0)],serializer:function(e){return JSON.stringify(e)},deserializer:function(e){return JSON.parse(e).slice(0-a)}}),N=Object(d.a)(I,2),H=N[0],J=N[1],U=H.at(-1),B=Object(o.useState)({}),A=Object(d.a)(B,2),Y=A[0],G=A[1],_=Object(f.a)("./sounds/dingbell.aac"),K=Object(d.a)(_,1)[0],Q=t.tempMissingSeconds,X=Object(o.useState)(!1),Z=Object(d.a)(X,2),$=Z[0],ee=Z[1];function te(e,n){if(!(Y[e]&&new Date-Y[e].lastSendTime<1e3*Y[e].nextSendInterval)){K(),$&&"granted"===Notification.permission&&new Notification(e,{icon:n,badge:n}),w(!0),x(e);var i=Y[e]?Y[e].nextSendInterval*t.notificationIntervalMultiplier:t.notificationIntervalSeconds;Y[e]={lastSendTime:new Date,nextSendInterval:i},G(Y)}}return Object(o.useEffect)((function(){var e="Notification"in window&&"serviceWorker"in navigator&&"PushManager"in window;ee(e),e?t.enableNotification&&Notification.requestPermission():console.log("This browser does not support desktop notification")}),[t.enableNotification]),Object(j.a)((function(){var e=(new Date-new Date(U.startTime))/1e3;if(U.detected&&e>n){R(!0),document.title=t.restNotificationText;te(t.restNotificationText,"https://chenditc.github.io/face-recognition-pomodoro/images/relax.png")}else if(!U.detected&&e>i){R(!0),document.title=t.focusNotificationText;te(t.focusNotificationText,"https://chenditc.github.io/face-recognition-pomodoro/images/focus.png")}else document.title=Object(z.b)(e,!0),R(!1),e>t.tempMissingSeconds&&Object.keys(Y).length>0&&G({})}),500,!0),Object(D.jsxs)(D.Fragment,{children:[t.enablePlayer?Object(D.jsx)(o.Suspense,{fallback:Object(D.jsx)("div",{children:"Loading..."}),children:Object(D.jsx)(W,{focus:U.detected,overTime:T,startTime:U.startTime})}):Object(D.jsx)(D.Fragment,{}),Object(D.jsxs)("div",{className:Object(b.a)(F||(F=Object(l.a)(["\n      margin: 0 15px;\n      max-width: 700px;\n      min-width: 350px;\n      @media (min-width: 730px) {\n        margin: 0 auto;\n      }\n      "]))),children:[Object(D.jsx)(g.a,{open:y,onClose:function(){return w(!1)},message:r,dismissesOnAction:!0,action:Object(D.jsx)(g.b,{label:"Dismiss",onClick:function(){return console.log("Dismiss notification")}})}),Object(D.jsxs)(O.a,{children:[Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(L.a,{focus:U.detected})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(V.a,{startTime:U.startTime})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(M,{onFaceDetectionResult:function(e){var n=Object(m.a)(H,(function(n){var i=void 0!==e;if(n.at(-1).detected!==i&&n.at(-1).timePeriod<Q&&n.pop(),0!==n.length)if(n.at(-1).detected===i){if(i&&n.at(-1).detected&&new Date-new Date(n.at(-1).endTime)>1e3*t.tempMissingSeconds)return n.push(P(!1,n.at(-1).endTime)),void n.push(P(!0,(new Date).toJSON()));n.at(-1).endTime=(new Date).toJSON(),n.at(-1).timePeriod=(new Date-new Date(n.at(-1).startTime))/1e3}else n.push(P(i,n.at(-1).endTime));else n.push(P(i))}));J(n)}})}),t.history.showPomodoroHistory?Object(D.jsxs)(O.b,{span:12,children:[Object(D.jsx)("h3",{children:"Pomodoro History"}),Object(D.jsxs)(o.Suspense,{fallback:Object(D.jsx)("div",{children:"Loading..."}),children:[Object(D.jsx)(E,{mergedTimeTable:H}),Object(D.jsx)(q,{mergedTimeTable:H,onDeleteRestSession:function(e){J(H.reduce((function(t,n){var i=t.slice();if(n.startTime===e||t.at(-1)&&t.at(-1).endTime===n.startTime&&t.at(-1).detected===n.detected){var a=Object(u.a)(Object(u.a)({},i.at(-1)),{},{endTime:n.endTime,timePeriod:(new Date(t.at(-1).endTime)-new Date(t.at(-1).startTime))/1e3});return i.pop(),i.push(a),i}return i.push(n),i}),[]))}})]})]}):Object(D.jsx)(D.Fragment,{})]})]})]})},J=(n(404),n(48)),U=n(229),B=(n(405),n(408),n(76),n(503)),A=(n(194),n(47)),Y=(n(413),n(88)),G=(n(421),n(65)),_=(n(232),n(499)),K=(n(426),n(429),n(221));var Q=function(e){var t=Object(o.useRef)(null),n=Object(K.a)(e.pomoConfigs),i=Object(d.a)(n,2),a=i[0],c=i[1],s=Object(o.useState)(!0),r=Object(d.a)(s,2),l=r[0],u=r[1];return Object(D.jsx)(D.Fragment,{children:Object(D.jsxs)(B.a,{style:{zIndex:15},open:e.open,preventOutsideDismiss:!0,onOpen:function(t){c(e.pomoConfigs)},onClose:function(t){"confirm"===t.target.action&&e.setPomoConfigs(a),e.onClose()},children:[Object(D.jsx)(B.e,{children:"Configuration"}),Object(D.jsx)(B.d,{children:Object(D.jsx)("form",{ref:t,onChange:function(){var e=t.current&&t.current.reportValidity();console.log(e),e!==l&&u(e)},children:Object(D.jsxs)(O.a,{children:[Object(D.jsx)(O.b,{span:12,children:Object(D.jsxs)(O.c,{children:[Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(R.a,{use:"subtitle2",children:"Pomodoro Config"})}),Object(D.jsx)(O.b,{span:4,children:Object(D.jsx)(A.a,{required:!0,label:"Focus Time",type:"number",suffix:"minutes",pattern:"[0-9]*",min:1,defaultValue:e.pomoConfigs.alertStudySeconds/60,onChange:function(e){e.target.validity.valid?c((function(t){t.alertStudySeconds=60*parseInt(e.target.value)})):e.target.reportValidity()}})}),Object(D.jsx)(O.b,{span:4,children:Object(D.jsx)(A.a,{required:!0,label:"Rest Time",type:"number",suffix:"minutes",pattern:"[0-9]*",min:1,defaultValue:e.pomoConfigs.alertRestSeconds/60,onChange:function(e){e.target.reportValidity()&&c((function(t){t.alertRestSeconds=60*parseInt(e.target.value)}))}})}),Object(D.jsx)(O.b,{span:4,children:Object(D.jsx)(G.a,{content:"If the rest time or focus time is less than this, it will not be counted as a separted time slot.",children:Object(D.jsx)(A.a,{required:!0,label:"Max allowed missing time",type:"number",suffix:"seconds",pattern:"[0-9]*",min:0,defaultValue:e.pomoConfigs.tempMissingSeconds,onChange:function(e){e.target.reportValidity()&&c((function(t){t.tempMissingSeconds=parseInt(e.target.value)}))}})})})]})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(_.a,{})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(R.a,{use:"subtitle2",children:"Background Video Config"})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(G.a,{content:"Enter a Youtube video url. Leave empty to not play anything.",children:Object(D.jsx)(A.a,{style:{width:"100%"},label:"Youtube Url",type:"text",defaultValue:e.pomoConfigs.playerUrl,onChange:function(e){c((function(t){t.playerUrl=e.target.value}))}})})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(_.a,{})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsxs)(O.c,{children:[Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(R.a,{use:"subtitle2",children:"Face Recognition Config"})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(G.a,{content:"Every n seconds we detect user face, shorter interval might increase CPU usage, longer interval might make pomodoro less sensitive.",children:Object(D.jsx)(A.a,{required:!0,label:"Face Detection Interval",type:"number",pattern:"[0-9]*",suffix:"seconds",min:2,defaultValue:e.pomoConfigs.faceRecognition.detectionInterval,onChange:function(e){if(e.target.reportValidity()){var t=parseInt(e.target.value);c((function(e){e.faceRecognition.detectionInterval=t}))}}})})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(Y.a,{defaultChecked:e.pomoConfigs.faceRecognition.showFaceRecognitionStatus,onChange:function(e){c((function(t){t.faceRecognition.showFaceRecognitionStatus=e.target.checked}))},label:"Show Face Recognition Status"})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(Y.a,{defaultChecked:e.pomoConfigs.faceRecognition.showCameraPreview,onChange:function(e){c((function(t){t.faceRecognition.showCameraPreview=e.target.checked}))},label:"Show Live Camera Preview"})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(Y.a,{defaultChecked:e.pomoConfigs.faceRecognition.showFaceRecognitionCanvas,onChange:function(e){c((function(t){t.faceRecognition.showFaceRecognitionCanvas=e.target.checked}))},label:"Show Face Detection Result"})})]})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(_.a,{})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsxs)(O.c,{children:[Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(R.a,{use:"subtitle2",children:"Notification Config"})}),Object(D.jsx)(O.b,{span:4,children:Object(D.jsx)(A.a,{required:!0,label:"Notification Interval Time",type:"number",suffix:"seconds",pattern:"[0-9]*",defaultValue:e.pomoConfigs.notificationIntervalSeconds,onChange:function(e){e.target.reportValidity()&&c((function(t){t.notificationIntervalSeconds=parseInt(e.target.value)}))}})}),Object(D.jsx)(O.b,{span:4,children:Object(D.jsx)(G.a,{content:"Everytime a notification is send, its wait time will multiply previous interval, so that the sending interval is longer and longer. If you don't want this behavior, change it to 1.",children:Object(D.jsx)(A.a,{required:!0,label:"Notification Interval Multiplier",suffix:"times",pattern:"[0-9\\.]*",min:1,type:"number",step:"0.1",defaultValue:e.pomoConfigs.notificationIntervalMultiplier,onChange:function(e){if(e.target.reportValidity()){var t=parseFloat(e.target.value);c((function(e){e.notificationIntervalMultiplier=t}))}}})})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(G.a,{content:"This message will be displayed to let you know it's time to start Pomodoro session.",children:Object(D.jsx)(A.a,{style:{width:"100%"},required:!0,label:"Focus Notification Message",minLength:1,defaultValue:e.pomoConfigs.focusNotificationText,onChange:function(e){e.target.reportValidity()&&c((function(t){t.focusNotificationText=e.target.value}))}})})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(G.a,{content:"This message will be displayed to let you know it's time to take a break.",children:Object(D.jsx)(A.a,{style:{width:"100%"},required:!0,label:"Rest Notification Message",minLength:1,defaultValue:e.pomoConfigs.restNotificationText,onChange:function(e){e.target.reportValidity()&&c((function(t){t.restNotificationText=e.target.value}))}})})})]})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(_.a,{})}),Object(D.jsx)(O.b,{span:12,children:Object(D.jsxs)(O.c,{children:[Object(D.jsx)(O.b,{span:12,children:Object(D.jsx)(R.a,{use:"subtitle2",children:"Pomodoro History Config"})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(G.a,{content:"Increasing this might degrade performance.",children:Object(D.jsx)(A.a,{required:!0,label:"Max pomodoro history entries kepted",type:"number",resizeable:!0,pattern:"[0-9]*",suffix:"entries",min:1,defaultValue:e.pomoConfigs.history.maxLocalStorageTimeSlot,onChange:function(e){e.target.reportValidity()&&c((function(t){t.history.maxLocalStorageTimeSlot=parseInt(e.target.value)}))}})})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(Y.a,{defaultChecked:e.pomoConfigs.history.showPomodoroHistory,onChange:function(e){c((function(t){t.history.showPomodoroHistory=e.target.checked}))},label:"Show Pomodoro History"})}),Object(D.jsx)(O.b,{children:Object(D.jsx)(Y.a,{defaultChecked:e.pomoConfigs.history.onlyShowToday,onChange:function(e){c((function(t){t.history.onlyShowToday=e.target.checked}))},label:"Only Show Today's History"})})]})})]})})}),Object(D.jsxs)(B.b,{children:[Object(D.jsx)(B.c,{action:"close",children:"Cancel"}),Object(D.jsx)(B.c,{action:"confirm",disabled:!l,isDefaultAction:!0,children:"Confirm"})]})]})})},X=n(57),Z=(n(474),n(500));var $,ee=function(e){return Object(D.jsx)(D.Fragment,{children:Object(D.jsxs)(B.a,{style:{zIndex:15},open:e.open,onClose:function(t){e.onClose()},children:[Object(D.jsx)(B.e,{children:"Intro to Face Recognition Pomodoro"}),Object(D.jsxs)(B.d,{children:[Object(D.jsx)("div",{style:{padding:"10px"}}),Object(D.jsx)(X.a,{children:Object(D.jsx)(X.b,{children:Object(D.jsxs)("div",{style:{padding:"0 1rem 1rem 1rem"},children:[Object(D.jsx)(R.a,{use:"headline6",tag:"h2",children:"What is this?"}),Object(D.jsx)(R.a,{use:"body1",tag:"div",theme:"textSecondaryOnBackground",children:Object(D.jsx)(Z.a,{children:"\nThis is a **Pomodoro Clock**. It's special because:\n\n- It can automatically help you start **a focus session** when the camera detected your face.\n- It can automatically start **a rest session** When the camera no longer detect your face \n\nWe will need two permission from you:\n- Permission to **send notification**, so that you will get reminded when session timed out.\n- Permission to **access your camera**.\n\nPlease click allow button around the browser's url.\n"})})]})})}),Object(D.jsx)("div",{style:{padding:"10px"}}),Object(D.jsx)(X.a,{children:Object(D.jsx)(X.b,{children:Object(D.jsxs)("div",{style:{padding:"0 1rem 1rem 1rem"},children:[Object(D.jsx)(R.a,{use:"headline6",tag:"h2",children:"What if I left my camera but don't want to stop the Pomodoro session?"}),Object(D.jsx)(R.a,{use:"body1",tag:"div",theme:"textSecondaryOnBackground",children:Object(D.jsx)(Z.a,{children:"If the time of stepping away is less than **Max Allowed Missing Time** in the settings, the Pomodoro session will continue the session when you are back."})})]})})}),Object(D.jsx)("div",{style:{padding:"10px"}}),Object(D.jsx)(X.a,{children:Object(D.jsx)(X.b,{children:Object(D.jsxs)("div",{style:{padding:"0 1rem 1rem 1rem"},children:[Object(D.jsx)(R.a,{use:"headline6",tag:"h2",children:"Why this intro always popup on start?"}),Object(D.jsx)(R.a,{use:"body1",tag:"div",theme:"textSecondaryOnBackground",children:"There must be at least one user interaction to make notification works, so I take this opportunity to intro the tool."})]})})}),Object(D.jsx)("div",{style:{padding:"10px"}}),Object(D.jsx)(X.a,{children:Object(D.jsx)(X.b,{children:Object(D.jsxs)("div",{style:{padding:"0 1rem 1rem 1rem"},children:[Object(D.jsx)(R.a,{use:"headline6",tag:"h2",children:"Will this slow down my computer or phone?"}),Object(D.jsx)(R.a,{use:"body1",tag:"div",theme:"textSecondaryOnBackground",children:"Usually not, it leverage GPU to detect your face and just takes a few milliseconds."})]})})})]}),Object(D.jsx)(B.b,{children:Object(D.jsx)(B.c,{action:"confirm",isDefaultAction:!0,children:"Ok, let's continue."})})]})})};var te=function(){var e=Object(h.a)("pomoConfig",{defaultValue:k.b}),t=Object(d.a)(e,2),n=t[0],i=t[1],a=Object(o.useState)(!1),c=Object(d.a)(a,2),s=c[0],r=c[1],u=Object(o.useState)(!0),j=Object(d.a)(u,2),f=j[0],O=j[1],g=n.enablePlayer?"volume_off":"music_video";return Object(D.jsx)(D.Fragment,{children:Object(D.jsxs)(U.a,{options:{primary:"#bf360c",secondary:"#616161"},children:[Object(D.jsx)(J.a,{style:{zIndex:15},children:Object(D.jsxs)(J.d,{children:[Object(D.jsx)(J.e,{alignStart:!0,children:Object(D.jsx)(J.b,{icon:"help",onClick:function(){return O(!0)}})}),Object(D.jsx)(J.e,{className:Object(b.a)($||($=Object(l.a)(["justify-content: center"]))),children:Object(D.jsx)(J.f,{children:"Face Recognition Pomodoro"})}),Object(D.jsxs)(J.e,{alignEnd:!0,children:[Object(D.jsx)(J.b,{icon:g,onClick:function(){i(Object(m.c)((function(e){e.enablePlayer=!e.enablePlayer})))}}),Object(D.jsx)(J.b,{icon:"settings",onClick:function(){return r(!0)}})]})]})}),Object(D.jsx)(J.c,{}),Object(D.jsx)(ee,{open:f,onClose:function(){O(!1),i(Object(m.c)((function(e){e.enableDetection=!0,e.enableNotification=!0})))}}),Object(D.jsx)(Q,{open:s,onClose:function(){return r(!1)},pomoConfigs:n,setPomoConfigs:i}),Object(D.jsx)(k.a.Provider,{value:n,children:Object(D.jsx)(H,{})})]})})},ne=function(e){e&&e instanceof Function&&n.e(11).then(n.bind(null,547)).then((function(t){var n=t.getCLS,i=t.getFID,a=t.getFCP,o=t.getLCP,c=t.getTTFB;n(e),i(e),a(e),o(e),c(e)}))};r.a.createRoot(document.getElementById("root")).render(Object(D.jsx)(te,{})),ne(console.log),"serviceWorker"in navigator&&navigator.serviceWorker.register("./sw.js").then((function(e){console.log("SW registration succeeded with scope:",e.scope)})).catch((function(e){console.log("SW registration failed with error:",e)}))},69:function(e,t,n){"use strict";n.d(t,"b",(function(){return a})),n.d(t,"a",(function(){return o}));var i=n(0),a={alertStudySeconds:1500,alertRestSeconds:300,enableNotification:!1,notificationIntervalSeconds:60,notificationIntervalMultiplier:1,tempMissingSeconds:60,history:{maxLocalStorageTimeSlot:100,showPomodoroHistory:!0,onlyShowToday:!0},faceRecognition:{detectionInterval:5,scoreThreshold:.95,showFaceRecognitionStatus:!1,showFaceRecognitionCanvas:!1,showCameraPreview:!1},enableDetection:!1,enablePlayer:!1,playerUrl:"https://www.youtube.com/watch?v=q4YyeEM9jsc",focusNotificationText:"Time to focus!",restNotificationText:"Let's take a break."},o=n.n(i).a.createContext(a)}},[[480,1,2]]]);
//# sourceMappingURL=main.c6b5ac6c.chunk.js.map