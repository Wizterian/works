import { defineEventHandler } from 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/h3/dist/index.mjs';

const helloWorld_get = defineEventHandler((event) => {
  return {
    message: "Hello Get"
  };
});

export { helloWorld_get as default };
//# sourceMappingURL=helloWorld.get.mjs.map
