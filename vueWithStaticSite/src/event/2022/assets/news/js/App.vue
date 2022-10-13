<template lang="pug">
.container
  router-view
  //- div(v-if='isLoading') Loading...
</template>

<script setup>
// import { useRoute, useRouter } from 'vue-router';
// import usePageRequests from './composables/usePageRequests';
// const {isLoading} = usePageRequests();

// appでrouter redirect処理をかける場合
// 冗長感あり
// const router = useRouter();
// const route = useRoute();
// watch(computed(() => route.query), q => {
//   if(q.date) {
//     router.push({name: 'NewsDetail', query: q})
//   }
// })

</script>