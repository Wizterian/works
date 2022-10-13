<template lang="pug">
h1 News
div(v-if="myPost").post
  h2 {{ myPost.title }}
  p(v-html="myPost.body")
  ul
    li
      router-link(v-if="prevDate" :to="{name: 'NewsDetail', query: {date: prevDate}}") 前へ
    li
      router-link(:to="{name: 'NewsIndex'}") 一覧へ
    li
      router-link(v-if="nextDate" :to="{name: 'NewsDetail', query: {date: nextDate}}") 次へ
div(v-else)
  p 該当の記事がありませんでした。
</template>

<script setup>
import { onBeforeUpdate, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import newsPosts from '@/assets/news/js/newsData.json';

const router = useRouter();
const route = useRoute();
const posts = newsPosts.posts;
const postsLength = posts.length;
const myPost = ref(null);
const prevDate = ref(null);
const nextDate = ref(null);

const getPostData = () => {
  const qDate = parseInt(route.query.date);
  posts.forEach((post, index) => {
    if(post.date === qDate) { // 要ユニークdate
      // 該当記事表示
      myPost.value = post;

      // meta設定
      const metaTitle = `News | ${myPost.value.title}`;
      // const metaDesc = myPost.value.body.replace(/<[^>]+>/g, '').substring(0, 100); // MTでも文字制御の処理可
      document.title = metaTitle;
      document.querySelector('meta[property="og:title"]').setAttribute("content",metaTitle);

      // ローカルナビ設定
      if(postsLength >= 2) {
        prevDate.value = posts[index - 1] ? posts[index - 1].date : null;
        nextDate.value = posts[index + 1] ? posts[index + 1].date : null;
      }
    }
  });
}

getPostData(); // 初回記事表示
onBeforeUpdate(() => getPostData()); // 遷移時記事表示

</script>

<style lang="scss" scoped>
.post {
  p,
  ul {
    margin-bottom: 20px;
  }
  ul {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>