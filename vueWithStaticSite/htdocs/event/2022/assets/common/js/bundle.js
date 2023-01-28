(()=>{"use strict";function t(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}var e=function(){function e(){var t=this;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,e);var n=window.location.href.split("#")[1];n&&setTimeout((function(){t._scrollHandler(n)}),400),this._clickHandler()}var n,o;return n=e,(o=[{key:"_clickHandler",value:function(){var t=this,e=document.querySelectorAll('a[href^="#"]');0!==e.length&&e.forEach((function(e){e.addEventListener("click",(function(n){n.preventDefault(),n.stopPropagation();var o=e.getAttribute("href").replace("#","");t._scrollHandler(o)}))}))}},{key:"_scrollHandler",value:function(t){document.getElementById(t).scrollIntoView({behavior:"smooth"})}}])&&t(n.prototype,o),Object.defineProperty(n,"prototype",{writable:!1}),e}();function n(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}const o=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.init(),this.bindUIElements(),this.setSNS()}var e,o;return e=t,(o=[{key:"init",value:function(){window.app&&window.app.commonData&&window.app.commonData.share?this.data=window.app.commonData.share:this.data=[{text:"",url:"",hash:""}],/iphone|ipad|ipod|android/gi.test(navigator.userAgent)?this.isPC=!1:this.isPC=!0}},{key:"bindUIElements",value:function(){this.line=document.getElementsByClassName("js-share-line"),this.twitter=document.getElementsByClassName("js-share-twitter"),this.facebook=document.getElementsByClassName("js-share-facebook")}},{key:"setSNS",value:function(){var t=Math.floor(Math.random()*this.data.length),e=this.data[t];this.setLine(e),this.setTwitter(e),this.setFB(e)}},{key:"setLine",value:function(t){for(var e=this,n=0;n<this.line.length;n+=1){var o=this.line[n].getAttribute("data-text")||t.text,a=this.line[n].getAttribute("data-url")||t.url,i=encodeURIComponent("".concat(o," ").concat(a));this.line[n].href="http://line.me/R/msg/text/?".concat(i),this.line[n].target="_blank",this.isPC&&this.line[n].addEventListener("click",(function(t){e.onClick(t,"line")}))}}},{key:"setTwitter",value:function(t){for(var e=this,n=0;n<this.twitter.length;n+=1){var o=this.twitter[n].getAttribute("data-text")||t.text,a=this.twitter[n].getAttribute("data-url")||t.url;this.twitter[n].href="http://twitter.com/share?text=".concat(encodeURIComponent(o),"&url=").concat(encodeURIComponent(a)),this.twitter[n].target="_blank",this.isPC&&this.twitter[n].addEventListener("click",(function(t){e.onClick(t,"twitter")}))}}},{key:"setFB",value:function(t){for(var e=this,n=0;n<this.facebook.length;n+=1){var o=this.facebook[n].getAttribute("data-url")||t.url;this.facebook[n].href="https://www.facebook.com/share.php?u=".concat(encodeURIComponent(o)),this.facebook[n].target="_blank",this.isPC&&this.facebook[n].addEventListener("click",(function(t){e.onClick(t,"facebook")}))}}},{key:"onClick",value:function(t,e){var n,o,a,i;if("click"===t.type)switch(e){case"twitter":t.preventDefault(),n=680,o=477,a=Number((window.screen.width-n)/2),i=Number((window.screen.height-o)/2),window.open(t.currentTarget.getAttribute("href"),"share_twitter","width=".concat(n,", height=").concat(o,", left=").concat(a,", top=").concat(i,", menubar=no, toolbar=no, resizable=yes, scrollbars=yes"));break;case"facebook":t.preventDefault(),n=600,o=630,a=Number((window.screen.width-n)/2),i=Number((window.screen.height-o)/2),window.open(t.currentTarget.getAttribute("href"),"share_facebook","width=".concat(n,", height=").concat(o,", left=").concat(a,", top=").concat(i,", menubar=no, toolbar=no, resizable=yes, scrollbars=yes"))}}}])&&n(e.prototype,o),Object.defineProperty(e,"prototype",{writable:!1}),t}();function a(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}const i=function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.config={autoInit:!0,className:"js-YT-video-modal",dataKey:"data-YT-video-id",paramsKey:"data-YT-params",background:"rgba(0,0,0,0.75)",closeButton:{url:"",width:"100%",height:"auto"},loop:!1},this.YTVideoModal()}var e,n;return e=t,(n=[{key:"YTVideoModal",value:function(){var t=this,e=document.body,n=this;window.YTVideoModal=this;var o=document.createElement("div");o.className="js-modal",o.style.opacity=0;var a=document.createElement("div");a.className="js-modal-bg";var i=document.createElement("div");i.className="con";var r=document.createElement("div");r.className="wrapper-btn-close";var s=document.createElement("img");s.className="btn-close",s.src=this.config.closeButton.url;var c=document.createElement("div");c.className="wrapper-video",this.setParams(o.style,{zIndex:1e3,position:"fixed",width:"100%",height:"100%",left:"0px",top:"0px"}),this.setParams(a.style,{position:"absolute",width:"100%",height:"100%",background:this.config.background,left:"0px",top:"0px"}),this.setParams(i.style,{position:"relative",width:"auto",height:"auto",margin:"20px",marginTop:"19px",borderTop:"solid 1px transparent"}),this.setParams(r.style,{cursor:"pointer",position:"absolute",right:"0px",top:"-50px",width:"50px",height:"50px"}),this.setParams(c.style,{position:"absolute",left:"0px",top:"0px",width:"100%",height:"100%"}),r.appendChild(s),i.appendChild(r),i.appendChild(c),o.appendChild(a),o.appendChild(i),o.style.visibility="";var l=function(){i.style.position="absolute",i.style.width="calc(100% - 30px)",i.style.margin=0,i.style.left="50%",i.style.top="50%",i.style.transform="translate(-50%, -50%)",i.style.paddingTop="56.25%";var t=c.getElementsByTagName("iframe")[0];t&&(t.style.width="100%",t.height="100%")};l(),window.addEventListener("resize",l);var d=null,u=function(e){e.preventDefault();var o=e.currentTarget.getAttribute(t.config.dataKey),a=e.currentTarget.getAttribute(t.config.paramsKey);d=e.currentTarget,n.openModal(o,a)},h=function(t){switch(t.type){case"click":n.closeModal(),r.style.opacity=1;break;case"mouseover":r.style.opacity=.6;break;case"mouseout":r.style.opacity=1}};r.style.opacity=1;var p=function(){o.parentNode.removeChild(o),c.innerHTML=""};a.addEventListener("click",h),r.addEventListener("click",h),r.addEventListener("mouseover",h),r.addEventListener("mouseout",h);var f=[];n.add=function(t){f.push(t),t.addEventListener("click",u)};var m=function t(e,n,o){t.to=e,t.vector=n,t.onComplete=o,t.act()};m.opacity=0,m.to=0,m.vector=0,m.requestID=null,m.onComplete=null,m.act=function(){m.requestID=window.requestAnimationFrame(m.act),m.opacity+=m.vector,m.vector<0?m.opacity<=m.to&&(m.opacity=m.to):m.opacity>=m.to&&(m.opacity=m.to),o.style.opacity=m.opacity,m.opacity===m.to&&(window.cancelAnimationFrame(m.requestID),m.onComplete&&m.onComplete())},n.openModal=function(t,n){if(l(),!o.parentNode){e.style.overflow="hidden";var a="";this.config.loop&&(a="&loop=".concat(this.config.loop,"&playlist=").concat(t)),c.innerHTML='<iframe\n        style="z-index: 1010; position: absolute; left: 0px; top: 0px;"\n        width="100%"\n        height="100%"\n        src="//www.youtube.com/embed/'.concat(t,"?autoplay=1&showinfo=1&rel=0&wmode=transparent&iv_load_policy=3").concat(a,"&").concat(n,'"\n        frameborder="0"\n        allowfullscreen\n      ></iframe>'),e.appendChild(o),m(1,.15)}},n.closeModal=function(){if(""!==e.style.overflow){e.style.overflow="",m(0,-.15,p);var t=d.getAttribute("data-onclose");t&&window[t]&&window[t](),d=null}},n.dispose=function(){if(f.length){for(var t=0;t<f.length;t+=1)f[t].removeEventListener("click",u);f=[]}},n.parse=function(){n.dispose();for(var t=document.getElementsByClassName(this.config.className),e=0;e<t.length;e+=1)n.add(t[e])},n.parse()}},{key:"setParams",value:function(t,e,n){var o=t;if(o instanceof Array)for(var a in o)this.setParams(o[a],e);else if(o&&e)for(var i in e)(n||void 0!==o[i])&&(e[i]instanceof Function?o[i]=e[i]:e[i]instanceof Object?this.setParams(o[i],e[i]):o[i]=e[i])}}])&&a(e.prototype,n),Object.defineProperty(e,"prototype",{writable:!1}),t}();new e,window.ShareBtn=new o,window.YoutubeModal=new i})();