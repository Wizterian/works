import { _ as __nuxt_component_0 } from "./Search.4698f4f6.js";
import { ref, useSSRContext } from "vue";
import { ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper.a1a6add7.js";
import "../server.mjs";
import "ofetch";
import "#internal/nitro";
import "hookable";
import "unctx";
import "destr";
import "ufo";
import "h3";
import "@vue/devtools-api";
import "@unhead/vue";
import "@unhead/dom";
import "vue-router";
import "defu";
const index_vue_vue_type_style_index_0_scoped_23cbc66f_lang = "";
const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    ref("");
    ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_MovieSearch = __nuxt_component_0;
      _push(ssrRenderComponent(_component_MovieSearch, _attrs, null, _parent));
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-23cbc66f"]]);
export {
  index as default
};
//# sourceMappingURL=index.43fde9bc.js.map
