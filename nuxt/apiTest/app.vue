<script setup>
  useHead({
    // title: "My movie site",
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - Movie` : 'My movie site'
    },
  });
</script>
<template>
  <div class="centerize">
    <NuxtLayout>
      <NuxtPage/>
    </NuxtLayout>
  </div>
</template>

<style>
  a {
    display: inline-block;
    margin-right: 10px;
  }
  .centerize {
    width: fit-content;
    margin: 0 auto;
  }
</style>