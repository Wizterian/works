<template lang="pug">
div.frame
  router-link(:to="{ name: 'NewsDetail', query: { date: post.date } }" :post="post") {{ post.title }}
</template>
<script setup>
const props = defineProps({post: Object});
const post = { ...props.post };
</script>
<style lang="scss" scoped>
  .frame {
    border: 1px solid #ccc;
    border-radius: 10px;
    margin-bottom: 20px;
    padding: 10px;
  }
</style>