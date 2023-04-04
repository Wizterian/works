import { defineEventHandler, readBody } from 'h3';

const helloWorld_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  return {
    message: body
  };
});

export { helloWorld_post as default };
//# sourceMappingURL=helloWorld.post.mjs.map
