import { createRouter, createWebHistory } from 'vue-router';
import newsData from '@/assets/news/js/newsData.json';

let newsQueries = {page: '1', cat: 'genre1'};

const routes = [
    {
        path: '/news/',
        name: 'NewsIndex',
        component: () => import(
            /* webpackChunkName: "event/2022/views/newsIndex.js" */
            '@/views/news/NewsIndex.vue'
        ),
        beforeEnter: (to, from, next) => {
            // query: {xxxx: 'xxxxxx'}というkeyはないためtoを編集
            // query.pageがあれば設定
            // query.catがあれば追加設定
            to.query.page = newsQueries.page;
            to.fullPath = `/news/?page=${newsQueries.page}`; // to.href, to.pathあたりも直すか確認 hrefはrouter-link用ぽいので一旦不要。
            next();
        }
    },
    {
        path: '/news/post/',
        name: 'NewsDetail',
        component: () => import(
            /* webpackChunkName: "event/2022/views/newsDetail.js" */
            '@/views/news/NewsDetail.vue'
        ),
        beforeEnter: (to, from, next) => {
            const queryObj = to.query;
            const newsPosts = newsData.posts;
            // 詳細ページがない・パラメーターがない場合indexへ遷移
            if((to.name).includes('NewsDetail') && (Object.keys(queryObj)[0]) === 'date') {
                const dateMatchFlg = newsPosts.some(post => post.date === Number(queryObj.date));
                dateMatchFlg ? next() : next({name: 'NewsIndex'});
            } else {
                next({name: 'NewsIndex'})
            }
        }
    },
    {
        path: '/stage/',
        name: 'Stage',
        component: () => import(
            /* webpackChunkName: "event/2022/views/stage.js" */
            '@/views/stage/Stage.vue'
        )
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import(
            /* webpackChunkName: "event/2022/views/notFound.js" */
            '@/views/common/NotFound.vue'
        )
    }
];

const router = createRouter({
    history: createWebHistory('/event/2022/'),
    routes
});

router.beforeEach((to, from, next) => {
    if((to.name).includes('NewsIndex') && !Object.keys(to.query).length) {
        newsQueries.page = sessionStorage.getItem('newsPage');
        newsQueries.cat = sessionStorage.getItem('newsCat');
    }
    next();
})

export default router;