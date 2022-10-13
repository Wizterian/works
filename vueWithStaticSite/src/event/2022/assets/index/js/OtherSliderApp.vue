<template lang="pug">
div(v-if="swiperFlg")
  swiper(
    :modules="modules"
    :slides-per-view="3"
    :centered-slides="true"
    :space-between="30"
    :autoplay="{ delay: 2500 }"
    :loop="true"
    :navigation="true"
    :pagination="{clickable: true}"
    @slideChange="onSlideChange"
  )
    swiper-slide(v-for='(post, index) in posts' :key='`slide-${index}`')
      SliderItem(:post="post")
div(v-else)
  p 表示変更
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SliderItem from '@/components/index/SliderListItem.vue';
import stageData from "@/assets/stage/js/stageData.json";

const posts = stageData.posts;
const modules = [Navigation, Pagination, Autoplay];
const props = defineProps({
  posts: Object,
  slidesPV: String
});
const breakPoint = 768;
let swiperFlg = ref(false);

const onSlideChange = () => {
  // console.log('slide change');
};
window.addEventListener('resize', () => resize());
const resize = () => swiperFlg.value = breakPoint < window.innerWidth ? true : false;
onMounted(resize);
</script>

<style lang="scss" scoped>

</style>

<style lang="scss"> // scopedは複製した要素に効かない
.swiper-slide ,
.swiper-slide-duplicate {
  height: unset;

  img {
    width: 100%;
    display: block;
    margin: 0 auto;
  }
}
</style>