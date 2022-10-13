<template lang="pug">
div.stageItem(:id="post.id")
  strong {{ post.title }}（サブカテゴリ:{{post.subCategory}}）
  div
    img(v-if="post.thumb" :src="post.thumb")
    img(v-else src="https://placehold.jp/320x200.png")
  div(v-html="post.body")
  div
    p(v-html="post.actors")
    p {{ post.time }}
    ul
      li(v-for="tag in post.tags" :key="tag" :post="tag") {{ tag }}
    p
      a.js-YT-video-modal(
        :data-yt-video-id="post.ytid",
        :href="`https://www.youtube.com/watch?v=${post.ytid}`",
        :data-tracking="'種別,場所,https://www.youtube.com/watch?v=' + post.ytid",
        onclick="window.Tracking.onClick(window.event)",
        target="_blank",
        rel="noopener", 
      ) アーカイブ動画（YTモーダル）
</template>

<script setup>
const props = defineProps({post: Object});
const post = {...props.post};
</script>

<style lang="scss" scoped>
  .stageItem {
    border: 1px solid #ccc;
    margin-bottom: 20px;
    padding: 10px;
  }
</style>

<!-- - var ytId = "8UDTC20bwPs";
a.tp-youtube__link.js-YT-video-modal(
  style=`background:url(https://img.youtube.com/vi/${ytId}/sddefault.jpg) center / cover no-repeat`,
  data-yt-video-id=`${ytId}`,
  href=`https://www.youtube.com/watch?v=${ytId}`,
  target="_blank",
  rel="noopener",
  data-tracking=`モーダル,TOP_MINIPARKとは,to_https://www.youtube.com/watch?v=${ytId}`
) -->