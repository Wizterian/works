import { u as useUser } from './User.3fec5034.mjs';
import { ssrRenderAttrs } from 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue/server-renderer/index.mjs';
import { useSSRContext } from 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue/index.mjs';
import '../server.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/ofetch/dist/node.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/hookable/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/unctx/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/ufo/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/h3/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/@unhead/vue/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/@unhead/dom/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue-router/dist/vue-router.node.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/defu/dist/defu.mjs';
import '../../nitro/nitro-prerenderer.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/node-fetch-native/dist/polyfill.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/destr/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/unenv/runtime/fetch/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/scule/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/ohash/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/unstorage/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/unstorage/dist/drivers/fs.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/radix3/dist/index.mjs';

const _sfc_main = {
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    useUser();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<form${ssrRenderAttrs(_attrs)}><h1>Login</h1><button>submit</button></form>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login.d6ca645a.mjs.map
