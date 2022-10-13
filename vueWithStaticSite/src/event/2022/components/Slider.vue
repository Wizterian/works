<template lang="pug">
swiper(
  :modules="modules"
  :slides-per-view="slidesPV"
  :centered-slides="true"
  :space-between="30"
  :autoplay="{ delay: 2000 }"
  :loop="true"
  :navigation="true"
  :pagination="{clickable: true}"
  @slideChange="onSlideChange"
)
  swiper-slide(v-for='(post, index) in posts' :key='`slide-${index}`')
    //- img(:src='post.thumb')
    SliderItem(:post="post")
      //- slot
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination, Autoplay } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import SliderItem from './SliderItem.vue'

const modules = [Navigation, Pagination, Autoplay];
// 変数管理参考
// https://zenn.dev/sindicum/articles/f9e737fba22281
// デバイスでdestroy()する機能もつけておく
const props = defineProps({
  posts: Object,
  slidesPV: String
});
const posts = { ...props.posts };
const slidesPV = props.slidesPV;

const onSlideChange = () => console.log('slide change');
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
// scopedは複製した要素に効かない
.swiper-slide ,
.swiper-slide-duplicate {

  img {
    width: 100%;
  }
}
</style>