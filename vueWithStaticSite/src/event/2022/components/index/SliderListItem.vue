<template lang="pug">
div.stageItem
  strong {{ post.title }}（サブカテゴリ:{{post.subCategory}}）
  div
    img(v-if="post.thumb" :src="post.thumb")
    img(v-else src="https://placehold.jp/320x200.png")
  div(v-html="post.body")
</template>
<script setup>
const props = defineProps({
  post: Object
});
</script>