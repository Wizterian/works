import { defineEventHandler } from 'h3';

const helloWorld_get = defineEventHandler((event) => {
  return {
    message: "Hello Get"
  };
});

export { helloWorld_get as default };
//# sourceMappingURL=helloWorld.get.mjs.map
