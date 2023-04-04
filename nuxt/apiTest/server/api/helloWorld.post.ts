export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  return {
    // message: getQuery(event)
    message: body
  }
})
