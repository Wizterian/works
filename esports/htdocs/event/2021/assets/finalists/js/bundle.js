!function(t){var e={};function n(a){if(e[a])return e[a].exports;var i=e[a]={i:a,l:!1,exports:{}};return t[a].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,a){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:a})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var a=Object.create(null);if(n.r(a),Object.defineProperty(a,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(a,i,function(e){return t[e]}.bind(null,i));return a},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=6)}([function(t,e,n){"use strict";n.d(e,"a",(function(){return a}));var a=function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),window.requestAnimationFrame=window.requestAnimationFrame||window.webkitRequestAnimationFrame||function(t){return setTimeout(t,1e3/60)},window.cancelAnimationFrame=window.cancelAnimationFrame||window.webkitCancelAnimationFrame||function(t){clearTimeout(t)}}},function(t,e,n){"use strict";n.d(e,"a",(function(){return a}));var a=function t(e){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),"complete"===document.readyState?setTimeout((function(){new e}),1):document.addEventListener("DOMContentLoaded",(function(){new e}))}},function(t,e,n){"use strict";function a(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}n.d(e,"a",(function(){return i}));var i=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.config={autoInit:!0,className:"js-YT-video-modal",dataKey:"data-YT-video-id",paramsKey:"data-YT-params",background:"rgba(0,0,0,0.75)",closeButton:{url:"/event/2021/assets/common/img/close_btn.png",width:"24px",height:"auto"},loop:!1},this.YTVideoModal()}var e,n,i;return e=t,(n=[{key:"YTVideoModal",value:function(){var t=this,e=document.body.parentNode,n=document.body,a=this;window.YTVideoModal=this;var i=document.createElement("div");i.className="js-modal",i.style.opacity=0;var o=document.createElement("div");o.className="js-modal-bg";var r=document.createElement("div");r.className="con";var s=document.createElement("div");s.className="wrapper-btn-close";var c=document.createElement("img");c.className="btn-close",c.src=this.config.closeButton.url;var l=document.createElement("div");l.className="wrapper-video";var u={x:0,y:0,w:640,h:360,scale:0,ratio:0};this.setParams(i.style,{zIndex:1e3,position:"fixed",width:"100%",height:"100%",left:"0px",top:"0px"}),this.setParams(o.style,{position:"absolute",width:"100%",height:"100%",background:this.config.background,left:"0px",top:"0px"}),this.setParams(r.style,{position:"relative",width:"auto",height:"auto",margin:"20px",marginTop:"19px",borderTop:"solid 1px transparent"}),this.setParams(s.style,{cursor:"pointer",position:"relative",textAlign:"right",right:"0px",top:"0px"}),this.setParams(c.style,{position:"relative",display:"inline-block",width:this.config.closeButton.width,height:this.config.closeButton.height,right:"0px",top:"0px",marginBottom:"20px"}),this.setParams(l.style,{position:"relative",left:"0px",top:"0px",width:"100%",height:"100%"}),s.appendChild(c),r.appendChild(s),r.appendChild(l),i.appendChild(o),i.appendChild(r),i.style.visibility="";var d=function(){var t=e.offsetWidth,n=e.offsetHeight;u.scale=Math.max(640/(t-40),360/(n-40-80)),u.w=640/u.scale,u.h=360/u.scale,u.x=(t-40-u.w)/2,u.y=(n-40-80-u.h)/2,r.style.width="".concat(u.w,"px"),r.style.height="".concat(u.h,"px"),r.style.left="".concat(u.x,"px"),r.style.top="".concat(u.y,"px");var a=l.getElementsByTagName("iframe")[0];a&&(a.width=u.w,a.height=u.h)};d(),window.addEventListener("resize",d);var f=null,p=function(e){e.preventDefault();var n=e.currentTarget.getAttribute(t.config.dataKey),i=e.currentTarget.getAttribute(t.config.paramsKey);f=e.currentTarget,a.openModal(n,i)},m=function(t){switch(t.type){case"click":a.closeModal(),c.style.opacity=1;break;case"mouseover":c.style.opacity=.6;break;case"mouseout":c.style.opacity=1}};c.style.opacity=1;var h=function(){i.parentNode.removeChild(i),l.innerHTML=""};o.addEventListener("click",m),c.addEventListener("click",m),c.addEventListener("mouseover",m),c.addEventListener("mouseout",m);var v=[];a.add=function(t){v.push(t),t.addEventListener("click",p)};var g=function t(e,n,a){t.to=e,t.vector=n,t.onComplete=a,t.act()};g.opacity=0,g.to=0,g.vector=0,g.requestID=null,g.onComplete=null,g.act=function(){g.requestID=window.requestAnimationFrame(g.act),g.opacity+=g.vector,g.vector<0?g.opacity<=g.to&&(g.opacity=g.to):g.opacity>=g.to&&(g.opacity=g.to),i.style.opacity=g.opacity,g.opacity===g.to&&(window.cancelAnimationFrame(g.requestID),g.onComplete&&g.onComplete())},a.openModal=function(t,e){if(d(),!i.parentNode){n.style.overflow="hidden";var a="";this.config.loop&&(a="&loop=".concat(this.config.loop,"&playlist=").concat(t)),l.innerHTML='<iframe\n        style="z-index: 1010; position: relative; left: 0px; top: 0px;"\n        width="'.concat(u.w,'"\n        height="').concat(u.h,'"\n        src="//www.youtube.com/embed/').concat(t,"?autoplay=1&showinfo=1&rel=0&wmode=transparent&mute=1&playsinline=1&iv_load_policy=3").concat(a,"&").concat(e,'"\n        frameborder="0"\n        allowfullscreen\n      ></iframe>'),n.appendChild(i),g(1,.15)}},a.closeModal=function(){if(""!==n.style.overflow){n.style.overflow="",g(0,-.15,h);var t=f.getAttribute("data-onclose");t&&window[t]&&window[t](),f=null}},a.dispose=function(){if(v.length){for(var t=0;t<v.length;t+=1)v[t].removeEventListener("click",p);v=[]}},a.parse=function(){a.dispose();for(var t=document.getElementsByClassName(this.config.className),e=0;e<t.length;e+=1)a.add(t[e])},a.parse()}},{key:"setParams",value:function(t,e,n){var a=t;if(a instanceof Array)for(var i in a)this.setParams(a[i],e);else if(a&&e)for(var o in e)(n||void 0!==a[o])&&(e[o]instanceof Function?a[o]=e[o]:e[o]instanceof Object?this.setParams(a[o],e[o]):a[o]=e[o])}}])&&a(e.prototype,n),i&&a(e,i),t}()},,,,function(t,e,n){"use strict";n.r(e);var a=n(0),i=n(1),o=n(2);function r(t,e){for(var n=0;n<e.length;n++){var a=e[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}var s=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t);var e=document.querySelector(".page-finalists").getAttribute("id");this.teamID=e?document.querySelector(".page-finalists").getAttribute("id").replace(/#/g,""):"",this.vueInit(this.myDir,this.teamID)}var e,n,a;return e=t,(n=[{key:"vueInit",value:function(t,e){Vue.createApp({data:function(){return{tables:null,areaNameTitle:"",block:"",finalTier:""}},methods:{getTrackingEvent:function(t){window.Tracking.onClick(t)},getStageThumb:function(t){var e="/event/2021/assets/finalists/img/stage/";return t.includes("1")?e+="stage_red.png":t.includes("2")?e+="stage_blue.png":t.includes("3")?e+="stage_green.png":t.includes("4")?e+="stage_light.png":t.includes("5")&&(e+="stage_dark.png"),e},getCharThumb:function(t){return"/event/2021/assets/finalists/img/char/".concat(t)},getEventName:function(t){var e="";return"regionals"===t?e+="".concat(this.areaNameTitle," ").concat(this.block," WINNER"):"finals"===t&&(e+="FINAL ".concat(this.finalTier)),e},getRoundName:function(t){var e="";return"ta"===t?e="TIME ATTACK":"best8"===t?e="BEST 8":"semi"===t?e="SEMI FINAL":"final"===t&&(e="FINAL"),e},putWinLoseColor:function(t){var e=t;return t.includes("WIN")?e=t.replace(/WIN/g,'<span class="win">WIN</span>'):t.includes("LOSE")&&(e=t.replace(/LOSE/g,'<span class="lose">LOSE</span>')),e}},mounted:function(){var t=this;axios.get("/event/2021/assets/finalists/teamdata/".concat(e,"/json/results.json")).then((function(e){return t.tables=e.data}));var n=document.querySelector(".js-areaTitle");this.areaNameTitle=n?n.textContent:"";var a=document.querySelector("#finalistresults");this.block=a.dataset.block,this.finalTier=a.dataset.finaltier},updated:function(){new o.a}}).mount("#finalistresults"),Vue.createApp({data:function(){return{profiles:null}},methods:{getMemberThumb:function(t){return"/event/2021/assets/finalists/teamdata/".concat(e,"/img/member0").concat(t+1,".png")}},mounted:function(){var t=this;axios.get("/event/2021/assets/finalists/teamdata/".concat(e,"/json/profile.json")).then((function(e){return t.profiles=e.data}))}}).mount("#memberInfo"),Vue.createApp({data:function(){return{finalists:null}},methods:{getMyPageURL:function(t){return"/event/2021/finalists/".concat(t,".html")},getTeamThumbURL:function(t){return"/event/2021/assets/finalists/teamdata/".concat(t,"/img/team.png")}},mounted:function(){var t=this;axios.get("/event/2021/assets/finalists/teamdata/finalists.json").then((function(e){return t.finalists=e.data}))}}).mount("#finalistsIndex")}}])&&r(e.prototype,n),a&&r(e,a),t}();var c=function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),new s};var l=function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),new c};new a.a,new i.a(l)}]);