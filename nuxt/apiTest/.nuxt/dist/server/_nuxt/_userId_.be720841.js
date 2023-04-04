import { b as useRoute } from "../server.mjs";
import { computed, unref, useSSRContext } from "vue";
import "destr";
import { ssrRenderAttrs, ssrInterpolate } from "vue/server-renderer";
import "ofetch";
import "#internal/nitro";
import "hookable";
import "unctx";
import "ufo";
import "h3";
import "@vue/devtools-api";
import "@unhead/vue";
import "@unhead/dom";
import "vue-router";
import "defu";
const _sfc_main = {
  __name: "[userId]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const message = computed(() => {
      const msg = `Team: ${route.params.teamSlug}  User ID: ${route.params.userId}`;
      return msg;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>${ssrInterpolate(unref(message))}</div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/teams/[teamSlug]/users/[userId].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=_userId_.be720841.js.map
