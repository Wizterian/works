(self.webpackChunk=self.webpackChunk||[]).push([[712],{244:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>i});var r=n(81),a=n.n(r),o=n(645),s=n.n(o)()(a());s.push([e.id,".post p[data-v-26a0ac58],.post ul[data-v-26a0ac58]{margin-bottom:20px}.post ul[data-v-26a0ac58]{display:flex;justify-content:space-between;align-items:center}",""]);const i=s},645:e=>{"use strict";e.exports=function(e){var t=[];return t.toString=function(){return this.map((function(t){var n="",r=void 0!==t[5];return t[4]&&(n+="@supports (".concat(t[4],") {")),t[2]&&(n+="@media ".concat(t[2]," {")),r&&(n+="@layer".concat(t[5].length>0?" ".concat(t[5]):""," {")),n+=e(t),r&&(n+="}"),t[2]&&(n+="}"),t[4]&&(n+="}"),n})).join("")},t.i=function(e,n,r,a,o){"string"==typeof e&&(e=[[null,e,void 0]]);var s={};if(r)for(var i=0;i<this.length;i++){var u=this[i][0];null!=u&&(s[u]=!0)}for(var l=0;l<e.length;l++){var c=[].concat(e[l]);r&&s[c[0]]||(void 0!==o&&(void 0===c[5]||(c[1]="@layer".concat(c[5].length>0?" ".concat(c[5]):""," {").concat(c[1],"}")),c[5]=o),n&&(c[2]?(c[1]="@media ".concat(c[2]," {").concat(c[1],"}"),c[2]=n):c[2]=n),a&&(c[4]?(c[1]="@supports (".concat(c[4],") {").concat(c[1],"}"),c[4]=a):c[4]="".concat(a)),t.push(c))}},t}},81:e=>{"use strict";e.exports=function(e){return e[1]}},665:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>y});var r=n(252),a=n(577),o=function(e){return(0,r.dD)("data-v-26a0ac58"),e=e(),(0,r.Cn)(),e},s=o((function(){return(0,r._)("h1",null,"News",-1)})),i={key:0,class:"post"},u=["innerHTML"],l=(0,r.Uk)("前へ"),c=(0,r.Uk)("一覧へ"),d=(0,r.Uk)("次へ"),p={key:1},f=[o((function(){return(0,r._)("p",null,"該当の記事がありませんでした。",-1)}))],v=n(262),h=n(201),m=n(59);const g={__name:"NewsDetail",setup:function(e,t){(0,t.expose)();var n=(0,h.tv)(),a=(0,h.yj)(),o=m.posts,s=o.length,i=(0,v.iH)(null),u=(0,v.iH)(null),l=(0,v.iH)(null),c=function(){var e=parseInt(a.query.date);o.forEach((function(t,n){if(t.date===e){i.value=t;var r="News | ".concat(i.value.title);document.title=r,document.querySelector('meta[property="og:title"]').setAttribute("content",r),s>=2&&(u.value=o[n-1]?o[n-1].date:null,l.value=o[n+1]?o[n+1].date:null)}}))};c(),(0,r.Xn)((function(){return c()}));var d={router:n,route:a,posts:o,postsLength:s,myPost:i,prevDate:u,nextDate:l,getPostData:c,onBeforeUpdate:r.Xn,ref:v.iH,useRoute:h.yj,useRouter:h.tv,newsPosts:m};return Object.defineProperty(d,"__isScriptSetup",{enumerable:!1,value:!0}),d}};n(599);const y=(0,n(744).Z)(g,[["render",function(e,t,n,o,v,h){var m=(0,r.up)("router-link");return(0,r.wg)(),(0,r.iD)(r.HY,null,[s,o.myPost?((0,r.wg)(),(0,r.iD)("div",i,[(0,r._)("h2",null,(0,a.zw)(o.myPost.title),1),(0,r._)("p",{innerHTML:o.myPost.body},null,8,u),(0,r._)("ul",null,[(0,r._)("li",null,[o.prevDate?((0,r.wg)(),(0,r.j4)(m,{key:0,to:{name:"NewsDetail",query:{date:o.prevDate}}},{default:(0,r.w5)((function(){return[l]})),_:1},8,["to"])):(0,r.kq)("v-if",!0)]),(0,r._)("li",null,[(0,r.Wm)(m,{to:{name:"NewsIndex"}},{default:(0,r.w5)((function(){return[c]})),_:1})]),(0,r._)("li",null,[o.nextDate?((0,r.wg)(),(0,r.j4)(m,{key:0,to:{name:"NewsDetail",query:{date:o.nextDate}}},{default:(0,r.w5)((function(){return[d]})),_:1},8,["to"])):(0,r.kq)("v-if",!0)])])])):((0,r.wg)(),(0,r.iD)("div",p,f))],64)}],["__scopeId","data-v-26a0ac58"]])},599:(e,t,n)=>{var r=n(244);r.__esModule&&(r=r.default),"string"==typeof r&&(r=[[e.id,r,""]]),r.locals&&(e.exports=r.locals),(0,n(346).Z)("b3e1faa8",r,!1,{})},346:(e,t,n)=>{"use strict";function r(e,t){for(var n=[],r={},a=0;a<t.length;a++){var o=t[a],s=o[0],i={id:e+":"+a,css:o[1],media:o[2],sourceMap:o[3]};r[s]?r[s].parts.push(i):n.push(r[s]={id:s,parts:[i]})}return n}n.d(t,{Z:()=>v});var a="undefined"!=typeof document;if("undefined"!=typeof DEBUG&&DEBUG&&!a)throw new Error("vue-style-loader cannot be used in a non-browser environment. Use { target: 'node' } in your Webpack config to indicate a server-rendering environment.");var o={},s=a&&(document.head||document.getElementsByTagName("head")[0]),i=null,u=0,l=!1,c=function(){},d=null,p="data-vue-ssr-id",f="undefined"!=typeof navigator&&/msie [6-9]\b/.test(navigator.userAgent.toLowerCase());function v(e,t,n,a){l=n,d=a||{};var s=r(e,t);return h(s),function(t){for(var n=[],a=0;a<s.length;a++){var i=s[a];(u=o[i.id]).refs--,n.push(u)}for(t?h(s=r(e,t)):s=[],a=0;a<n.length;a++){var u;if(0===(u=n[a]).refs){for(var l=0;l<u.parts.length;l++)u.parts[l]();delete o[u.id]}}}}function h(e){for(var t=0;t<e.length;t++){var n=e[t],r=o[n.id];if(r){r.refs++;for(var a=0;a<r.parts.length;a++)r.parts[a](n.parts[a]);for(;a<n.parts.length;a++)r.parts.push(g(n.parts[a]));r.parts.length>n.parts.length&&(r.parts.length=n.parts.length)}else{var s=[];for(a=0;a<n.parts.length;a++)s.push(g(n.parts[a]));o[n.id]={id:n.id,refs:1,parts:s}}}}function m(){var e=document.createElement("style");return e.type="text/css",s.appendChild(e),e}function g(e){var t,n,r=document.querySelector("style["+p+'~="'+e.id+'"]');if(r){if(l)return c;r.parentNode.removeChild(r)}if(f){var a=u++;r=i||(i=m()),t=b.bind(null,r,a,!1),n=b.bind(null,r,a,!0)}else r=m(),t=_.bind(null,r),n=function(){r.parentNode.removeChild(r)};return t(e),function(r){if(r){if(r.css===e.css&&r.media===e.media&&r.sourceMap===e.sourceMap)return;t(e=r)}else n()}}var y,w=(y=[],function(e,t){return y[e]=t,y.filter(Boolean).join("\n")});function b(e,t,n,r){var a=n?"":r.css;if(e.styleSheet)e.styleSheet.cssText=w(t,a);else{var o=document.createTextNode(a),s=e.childNodes;s[t]&&e.removeChild(s[t]),s.length?e.insertBefore(o,s[t]):e.appendChild(o)}}function _(e,t){var n=t.css,r=t.media,a=t.sourceMap;if(r&&e.setAttribute("media",r),d.ssrId&&e.setAttribute(p,t.id),a&&(n+="\n/*# sourceURL="+a.sources[0]+" */",n+="\n/*# sourceMappingURL=data:application/json;base64,"+btoa(unescape(encodeURIComponent(JSON.stringify(a))))+" */"),e.styleSheet)e.styleSheet.cssText=n;else{for(;e.firstChild;)e.removeChild(e.firstChild);e.appendChild(document.createTextNode(n))}}}}]);