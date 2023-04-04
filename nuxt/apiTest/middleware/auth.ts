export default defineNuxtRouteMiddleware((to, from) => {
  const userIsLoggedin = false;
  if(!userIsLoggedin) {
    // return abortNavigation("not allowed");
    return navigateTo({name: "login"});
  }
})
