import { _ as __nuxt_component_0$1 } from "../server.mjs";
import { useSSRContext, ref, unref, withCtx, createVNode } from "vue";
import { ssrRenderAttr, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper.a1a6add7.js";
const Search_vue_vue_type_style_index_0_scoped_339cc123_lang = "";
const _sfc_main = {
  __name: "Search",
  __ssrInlineRender: true,
  setup(__props) {
    const query = ref("");
    const movies = ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0$1;
      _push(`<!--[--><form data-v-339cc123><p data-v-339cc123>Movie Database API\u30C6\u30B9\u30C8 \u6620\u753B\u540D\u3092\u5165\u529B\u3057\u3066\u304F\u3060\u3055\u3044</p><input type="text"${ssrRenderAttr("value", unref(query))} data-v-339cc123><button data-v-339cc123>Search</button></form><ul data-v-339cc123><!--[-->`);
      ssrRenderList(unref(movies), (movie) => {
        _push(`<li data-v-339cc123>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { name: "movies-id", params: { id: movie.imdbID } }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<img${ssrRenderAttr("src", movie.Poster)}${ssrRenderAttr("alt", movie.title)} data-v-339cc123${_scopeId}>`);
            } else {
              return [
                createVNode("img", {
                  src: movie.Poster,
                  alt: movie.title
                }, null, 8, ["src", "alt"])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ul><!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/movie/Search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-339cc123"]]);
export {
  __nuxt_component_0 as _
};
//# sourceMappingURL=Search.4698f4f6.js.map
