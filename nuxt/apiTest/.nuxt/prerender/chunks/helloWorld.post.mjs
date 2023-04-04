import { defineEventHandler, readBody } from 'file:///Users/makoto/Desktop/work/myrepos/works/nuxt/apiTest/node_modules/h3/dist/index.mjs';

const helloWorld_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    message: body
  };
});

export { helloWorld_post as default };
//# sourceMappingURL=helloWorld.post.mjs.map
