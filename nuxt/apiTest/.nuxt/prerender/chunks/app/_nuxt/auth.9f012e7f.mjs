import { f as defineNuxtRouteMiddleware, n as navigateTo } from '../server.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/ofetch/dist/node.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/hookable/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/unctx/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/ufo/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/h3/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/@unhead/vue/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/@unhead/dom/dist/index.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue-router/dist/vue-router.node.mjs';
import 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/vue/server-renderer/index.mjs';
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

const auth = defineNuxtRouteMiddleware((to, from) => {
  {
    return navigateTo({ name: "login" });
  }
});

export { auth as default };
//# sourceMappingURL=auth.9f012e7f.mjs.map
