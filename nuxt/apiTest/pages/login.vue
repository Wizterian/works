<script setup>
// const isLoggedIn = useIsLoggedIn();
const user = useUser();
definePageMeta({
  layout: "plain"
});

</script>
<template>
  <form @submit.prevent="user.login">
    <h1>Login</h1>
    <button>submit</button>
  </form>
</template>