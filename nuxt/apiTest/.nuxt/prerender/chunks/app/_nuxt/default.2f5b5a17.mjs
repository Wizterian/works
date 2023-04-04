import { _ as __nuxt_component_0$1 } from '../server.mjs';
import { u as useUser } from './User.3fec5034.mjs';
import { withCtx, createTextVNode, unref, useSSRContext } from 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue/index.mjs';
import { ssrRenderComponent, ssrRenderSlot } from 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue/server-renderer/index.mjs';
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
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    const user = useUser();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<!--[--><nav>`);
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Home`);
          } else {
            return [
              createTextVNode("Home")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, { to: "/movies" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Movies`);
          } else {
            return [
              createTextVNode("Movies")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (!unref(user).isLoggedIn) {
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/login" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Login`);
            } else {
              return [
                createTextVNode("Login")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<a href="#">Logout</a>`);
      }
      _push(`</nav>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default.2f5b5a17.mjs.map
