<script setup>
// const isLoggedIn = useIsLoggedIn();
const user = useUser();
</script>
<template>
    <nav>
      <NuxtLink to="/">Home</NuxtLink>
      <NuxtLink to="/movies">Movies</NuxtLink>
      <!-- <NuxtLink to="https://vueschool.io">Vue School</NuxtLink> -->
      <NuxtLink v-if="!user.isLoggedIn" to="/login">Login</NuxtLink>
      <a href="#" v-else @click.prevent="user.isLoggedIn = false">Logout</a>
    </nav>
  <slot></slot>
</template>