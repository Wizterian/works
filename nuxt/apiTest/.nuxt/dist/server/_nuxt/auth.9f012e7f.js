import { f as defineNuxtRouteMiddleware, n as navigateTo } from "../server.mjs";
import "vue";
import "destr";
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
import "vue/server-renderer";
import "defu";
const auth = defineNuxtRouteMiddleware((to, from) => {
  {
    return navigateTo({ name: "login" });
  }
});
export {
  auth as default
};
//# sourceMappingURL=auth.9f012e7f.js.map
