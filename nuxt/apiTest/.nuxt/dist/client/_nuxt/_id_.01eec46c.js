import{s as j,r as P,t as C,x as M,y as z,z as E,u as v,A as H,B as U,C as F,D as R,E as T,G as N,H as I,a as L,I as K,o as $}from"./entry.d6f568ef.js";const W=()=>null;function G(...n){var f,B,x,S,m,w,_;const s=typeof n[n.length-1]=="string"?n.pop():void 0;typeof n[0]!="string"&&n.unshift(s);let[r,e,t={}]=n;if(typeof r!="string")throw new TypeError("[nuxt] [asyncData] key must be a string.");if(typeof e!="function")throw new TypeError("[nuxt] [asyncData] handler must be a function.");t.server=(f=t.server)!=null?f:!0,t.default=(B=t.default)!=null?B:W,t.lazy=(x=t.lazy)!=null?x:!1,t.immediate=(S=t.immediate)!=null?S:!0;const a=j(),o=()=>a.isHydrating?a.payload.data[r]:a.static.data[r],u=()=>o()!==void 0;a._asyncData[r]||(a._asyncData[r]={data:P((_=(w=o())!=null?w:(m=t.default)==null?void 0:m.call(t))!=null?_:null),pending:P(!u()),error:P(a.payload._errors[r]?C(a.payload._errors[r]):null)});const i={...a._asyncData[r]};i.refresh=i.execute=(l={})=>{if(a._asyncDataPromises[r]){if(l.dedupe===!1)return a._asyncDataPromises[r];a._asyncDataPromises[r].cancelled=!0}if(l._initial&&u())return o();i.pending.value=!0;const d=new Promise((c,g)=>{try{c(e(a))}catch(D){g(D)}}).then(c=>{if(d.cancelled)return a._asyncDataPromises[r];t.transform&&(c=t.transform(c)),t.pick&&(c=J(c,t.pick)),i.data.value=c,i.error.value=null}).catch(c=>{var g,D;if(d.cancelled)return a._asyncDataPromises[r];i.error.value=c,i.data.value=v((D=(g=t.default)==null?void 0:g.call(t))!=null?D:null)}).finally(()=>{d.cancelled||(i.pending.value=!1,a.payload.data[r]=i.data.value,i.error.value&&(a.payload._errors[r]=C(i.error.value)),delete a._asyncDataPromises[r])});return a._asyncDataPromises[r]=d,a._asyncDataPromises[r]};const h=()=>i.refresh({_initial:!0}),p=t.server!==!1&&a.payload.serverRendered;{const l=H();if(l&&!l._nuxtOnBeforeMountCbs){l._nuxtOnBeforeMountCbs=[];const c=l._nuxtOnBeforeMountCbs;l&&(M(()=>{c.forEach(g=>{g()}),c.splice(0,c.length)}),z(()=>c.splice(0,c.length)))}p&&a.isHydrating&&u()?i.pending.value=!1:l&&(a.payload.serverRendered&&a.isHydrating||t.lazy)&&t.immediate?l._nuxtOnBeforeMountCbs.push(h):t.immediate&&h(),t.watch&&E(t.watch,()=>i.refresh());const d=a.hook("app:data:refresh",c=>{if(!c||c.includes(r))return i.refresh()});l&&z(d)}const y=Promise.resolve(a._asyncDataPromises[r]).then(()=>i);return Object.assign(y,i),y}function J(n,s){const r={};for(const e of s)r[e]=n[e];return r}const V={ignoreUnknown:!1,respectType:!1,respectFunctionNames:!1,respectFunctionProperties:!1,unorderedObjects:!0,unorderedArrays:!1,unorderedSets:!1};function Q(n,s={}){s={...V,...s};const r=A(s);return r.dispatch(n),r.toString()}function A(n){const s=[];let r=[];const e=t=>{s.push(t)};return{toString(){return s.join("")},getContext(){return r},dispatch(t){return n.replacer&&(t=n.replacer(t)),this["_"+(t===null?"null":typeof t)](t)},_object(t){const a=/\[object (.*)]/i,o=Object.prototype.toString.call(t),u=a.exec(o),i=u?u[1].toLowerCase():"unknown:["+o.toLowerCase()+"]";let h=null;if((h=r.indexOf(t))>=0)return this.dispatch("[CIRCULAR:"+h+"]");if(r.push(t),typeof Buffer<"u"&&Buffer.isBuffer&&Buffer.isBuffer(t))return e("buffer:"),e(t.toString("utf8"));if(i!=="object"&&i!=="function"&&i!=="asyncfunction")if(this["_"+i])this["_"+i](t);else{if(n.ignoreUnknown)return e("["+i+"]");throw new Error('Unknown object type "'+i+'"')}else{let p=Object.keys(t);n.unorderedObjects&&(p=p.sort()),n.respectType!==!1&&!O(t)&&p.splice(0,0,"prototype","__proto__","letructor"),n.excludeKeys&&(p=p.filter(function(y){return!n.excludeKeys(y)})),e("object:"+p.length+":");for(const y of p)this.dispatch(y),e(":"),n.excludeValues||this.dispatch(t[y]),e(",")}},_array(t,a){if(a=typeof a<"u"?a:n.unorderedArrays!==!1,e("array:"+t.length+":"),!a||t.length<=1){for(const i of t)this.dispatch(i);return}const o=[],u=t.map(i=>{const h=A(n);return h.dispatch(i),o.push(h.getContext()),h.toString()});return r=[...r,...o],u.sort(),this._array(u,!1)},_date(t){return e("date:"+t.toJSON())},_symbol(t){return e("symbol:"+t.toString())},_error(t){return e("error:"+t.toString())},_boolean(t){return e("bool:"+t.toString())},_string(t){e("string:"+t.length+":"),e(t.toString())},_function(t){e("fn:"),O(t)?this.dispatch("[native]"):this.dispatch(t.toString()),n.respectFunctionNames!==!1&&this.dispatch("function-name:"+String(t.name)),n.respectFunctionProperties&&this._object(t)},_number(t){return e("number:"+t.toString())},_xml(t){return e("xml:"+t.toString())},_null(){return e("Null")},_undefined(){return e("Undefined")},_regexp(t){return e("regex:"+t.toString())},_uint8array(t){return e("uint8array:"),this.dispatch(Array.prototype.slice.call(t))},_uint8clampedarray(t){return e("uint8clampedarray:"),this.dispatch(Array.prototype.slice.call(t))},_int8array(t){return e("int8array:"),this.dispatch(Array.prototype.slice.call(t))},_uint16array(t){return e("uint16array:"),this.dispatch(Array.prototype.slice.call(t))},_int16array(t){return e("int16array:"),this.dispatch(Array.prototype.slice.call(t))},_uint32array(t){return e("uint32array:"),this.dispatch(Array.prototype.slice.call(t))},_int32array(t){return e("int32array:"),this.dispatch(Array.prototype.slice.call(t))},_float32array(t){return e("float32array:"),this.dispatch(Array.prototype.slice.call(t))},_float64array(t){return e("float64array:"),this.dispatch(Array.prototype.slice.call(t))},_arraybuffer(t){return e("arraybuffer:"),this.dispatch(new Uint8Array(t))},_url(t){return e("url:"+t.toString())},_map(t){e("map:");const a=[...t];return this._array(a,n.unorderedSets!==!1)},_set(t){e("set:");const a=[...t];return this._array(a,n.unorderedSets!==!1)},_file(t){return e("file:"),this.dispatch([t.name,t.size,t.type,t.lastModfied])},_blob(){if(n.ignoreUnknown)return e("[blob]");throw new Error(`Hashing Blob objects is currently not supported
Use "options.replacer" or "options.ignoreUnknown"
`)},_domwindow(){return e("domwindow")},_bigint(t){return e("bigint:"+t.toString())},_process(){return e("process")},_timer(){return e("timer")},_pipe(){return e("pipe")},_tcp(){return e("tcp")},_udp(){return e("udp")},_tty(){return e("tty")},_statwatcher(){return e("statwatcher")},_securecontext(){return e("securecontext")},_connection(){return e("connection")},_zlib(){return e("zlib")},_context(){return e("context")},_nodescript(){return e("nodescript")},_httpparser(){return e("httpparser")},_dataview(){return e("dataview")},_signal(){return e("signal")},_fsevent(){return e("fsevent")},_tlswrap(){return e("tlswrap")}}}function O(n){return typeof n!="function"?!1:/^function\s+\w*\s*\(\s*\)\s*{\s+\[native code]\s+}$/i.exec(Function.prototype.toString.call(n))!=null}class k{constructor(s,r){s=this.words=s||[],this.sigBytes=r!==void 0?r:s.length*4}toString(s){return(s||X).stringify(this)}concat(s){if(this.clamp(),this.sigBytes%4)for(let r=0;r<s.sigBytes;r++){const e=s.words[r>>>2]>>>24-r%4*8&255;this.words[this.sigBytes+r>>>2]|=e<<24-(this.sigBytes+r)%4*8}else for(let r=0;r<s.sigBytes;r+=4)this.words[this.sigBytes+r>>>2]=s.words[r>>>2];return this.sigBytes+=s.sigBytes,this}clamp(){this.words[this.sigBytes>>>2]&=4294967295<<32-this.sigBytes%4*8,this.words.length=Math.ceil(this.sigBytes/4)}clone(){return new k([...this.words])}}const X={stringify(n){const s=[];for(let r=0;r<n.sigBytes;r++){const e=n.words[r>>>2]>>>24-r%4*8&255;s.push((e>>>4).toString(16),(e&15).toString(16))}return s.join("")}},Y={stringify(n){const s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",r=[];for(let e=0;e<n.sigBytes;e+=3){const t=n.words[e>>>2]>>>24-e%4*8&255,a=n.words[e+1>>>2]>>>24-(e+1)%4*8&255,o=n.words[e+2>>>2]>>>24-(e+2)%4*8&255,u=t<<16|a<<8|o;for(let i=0;i<4&&e*8+i*6<n.sigBytes*8;i++)r.push(s.charAt(u>>>6*(3-i)&63))}return r.join("")}},Z={parse(n){const s=n.length,r=[];for(let e=0;e<s;e++)r[e>>>2]|=(n.charCodeAt(e)&255)<<24-e%4*8;return new k(r,s)}},q={parse(n){return Z.parse(unescape(encodeURIComponent(n)))}};class tt{constructor(){this._minBufferSize=0,this.blockSize=512/32,this.reset()}reset(){this._data=new k,this._nDataBytes=0}_append(s){typeof s=="string"&&(s=q.parse(s)),this._data.concat(s),this._nDataBytes+=s.sigBytes}_doProcessBlock(s,r){}_process(s){let r,e=this._data.sigBytes/(this.blockSize*4);s?e=Math.ceil(e):e=Math.max((e|0)-this._minBufferSize,0);const t=e*this.blockSize,a=Math.min(t*4,this._data.sigBytes);if(t){for(let o=0;o<t;o+=this.blockSize)this._doProcessBlock(this._data.words,o);r=this._data.words.splice(0,t),this._data.sigBytes-=a}return new k(r,a)}}class et extends tt{update(s){return this._append(s),this._process(),this}finalize(s){s&&this._append(s)}}const rt=[1779033703,-1150833019,1013904242,-1521486534,1359893119,-1694144372,528734635,1541459225],st=[1116352408,1899447441,-1245643825,-373957723,961987163,1508970993,-1841331548,-1424204075,-670586216,310598401,607225278,1426881987,1925078388,-2132889090,-1680079193,-1046744716,-459576895,-272742522,264347078,604807628,770255983,1249150122,1555081692,1996064986,-1740746414,-1473132947,-1341970488,-1084653625,-958395405,-710438585,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,-2117940946,-1838011259,-1564481375,-1474664885,-1035236496,-949202525,-778901479,-694614492,-200395387,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,-2067236844,-1933114872,-1866530822,-1538233109,-1090935817,-965641998],b=[];class nt extends et{constructor(){super(),this.reset()}reset(){super.reset(),this._hash=new k([...rt])}_doProcessBlock(s,r){const e=this._hash.words;let t=e[0],a=e[1],o=e[2],u=e[3],i=e[4],h=e[5],p=e[6],y=e[7];for(let f=0;f<64;f++){if(f<16)b[f]=s[r+f]|0;else{const l=b[f-15],d=(l<<25|l>>>7)^(l<<14|l>>>18)^l>>>3,c=b[f-2],g=(c<<15|c>>>17)^(c<<13|c>>>19)^c>>>10;b[f]=d+b[f-7]+g+b[f-16]}const B=i&h^~i&p,x=t&a^t&o^a&o,S=(t<<30|t>>>2)^(t<<19|t>>>13)^(t<<10|t>>>22),m=(i<<26|i>>>6)^(i<<21|i>>>11)^(i<<7|i>>>25),w=y+m+B+st[f]+b[f],_=S+x;y=p,p=h,h=i,i=u+w|0,u=o,o=a,a=t,t=w+_|0}e[0]=e[0]+t|0,e[1]=e[1]+a|0,e[2]=e[2]+o|0,e[3]=e[3]+u|0,e[4]=e[4]+i|0,e[5]=e[5]+h|0,e[6]=e[6]+p|0,e[7]=e[7]+y|0}finalize(s){super.finalize(s);const r=this._nDataBytes*8,e=this._data.sigBytes*8;return this._data.words[e>>>5]|=128<<24-e%32,this._data.words[(e+64>>>9<<4)+14]=Math.floor(r/4294967296),this._data.words[(e+64>>>9<<4)+15]=r,this._data.sigBytes=this._data.words.length*4,this._process(),this._hash}}function at(n){return new nt().finalize(n).toString(Y)}function it(n,s={}){const r=typeof n=="string"?n:Q(n,s);return at(r).slice(0,10)}function ot(n,s,r){const[e={},t]=typeof s=="string"?[{},s]:[s,r],a=e.key||it([t,v(e.baseURL),typeof n=="string"?n:"",v(e.params)]);if(!a||typeof a!="string")throw new TypeError("[nuxt] [useFetch] key must be a string: "+a);if(!n)throw new Error("[nuxt] [useFetch] request is missing.");const o=a===t?"$f"+a:a,u=U(()=>{let d=n;return typeof d=="function"&&(d=d()),v(d)}),{server:i,lazy:h,default:p,transform:y,pick:f,watch:B,immediate:x,...S}=e,m=F({...S,cache:typeof e.cache=="boolean"?void 0:e.cache}),w={server:i,lazy:h,default:p,transform:y,pick:f,immediate:x,watch:[m,u,...B||[]]};let _;return G(o,()=>{var d;return(d=_==null?void 0:_.abort)==null||d.call(_),_=typeof AbortController<"u"?new AbortController:{},$fetch(u.value,{signal:_.signal,...m})},w)}const ut={__name:"[id]",async setup(n){let s,r;const e=R(),{data:t}=([s,r]=T(()=>ot(`https://www.omdbapi.com/?apikey=87217617&i=${e.params.id}`,{pick:["Plot","Title","Error","Poster"],key:`/movies/${e.params.id}`},"$RMfb8nUpTS")),s=await s,r(),s);return N({title:t.value.Title,meta:[{name:"description",content:t.value.Plot},{property:"og:description",content:t.value.Plot},{property:"og:image",content:t.value.Poster},{name:"twitter:card",content:"summary_large_image"}]}),t.value.Error==="Incorrect IMDb ID."&&I({statusCode:404,statusMessage:"Page Not Found"}),(a,o)=>($(),L("pre",null,"    "+K(v(t))+`
  `,1))}};export{ut as default};
