<template lang="pug">
h1 News
NewsIndexItem(v-for="post in chosenPosts" :key="post.id" :post="post")
v-pagination(
    v-model='currentPageNum'
    :pages='allPageNum'
    :range-size='1'
    active-color='#DCEDFF'
    @update:modelValue="updateHandler"
    :hide-first-button='true'
    :hide-last-button='true'
)
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import NewsIndexItem from "@/components/news/NewsListItem.vue";
import VPagination from "@hennge/vue3-pagination"; // pagenation plugin
import "@hennge/vue3-pagination/dist/vue3-pagination.css"; // pagenation plugin
import newsPosts from '@/assets/news/js/newsData.json';

const router = useRouter();
const route = useRoute();
const postsAll = newsPosts.posts;
const postsAllLength = postsAll.length;
const postPerPageNum = 4;
const allPageNum = Math.ceil(postsAllLength / postPerPageNum); // ページ端数切り上げ
const currentPageNum = ref(1);
const currentPageCat = ref(null);
const chosenPosts = ref([...postsAll]);

// filter用query paramsの設定・保管
const queryParamHandler = (page, cat) => {
    if (page) {
        currentPageNum.value = page;
        sessionStorage.setItem('newsPage', currentPageNum.value);
    }
    if (cat !== undefined) {
        currentPageCat.value = cat;
        sessionStorage.setItem('newsCat', currentPageCat.value)
    }
}
// 記事フィルタリング
const filteredPosts = () => {
    const offsetEnd = postPerPageNum * currentPageNum.value;
    const offsetStart = offsetEnd - postPerPageNum;
    chosenPosts.value = [...postsAll].slice(offsetStart, offsetEnd);
}
const updateHandler = () => {
    // catがあれば結合
    router.push({name: 'NewsIndex', query: {page: currentPageNum.value}})
}
// newsページ初回読み込み時の処理
const newsInit = () => {
    const qPage = parseInt(route.query.page); 
    const qCat = route.query.cat || undefined;
    queryParamHandler(qPage, qCat);
    filteredPosts();
}
// ページネーションの処理
router.beforeEach((to, from, next) => {
    const qPage = parseInt(to.query.page);
    const qCat = to.query.cat || undefined;
    queryParamHandler(qPage, qCat);
    filteredPosts();
    next();
})

newsInit();

/** 
 * categoryでfilter機能追加する
*/
</script>
