<template lang="pug">
div.mdl-bg(v-if="modalFlg")
  div.mdl-centerizer
    div.mdl-contents
      img(src="https://placehold.jp/320x200.png")
    button(@click="modalClose") 閉じる

  
</template>

<script setup>
import { ref } from 'vue';
const modalFlg = ref(true);
const modalClose = () => {
  console.log('とじる');
}
</script>

<style lang="scss" scoped>
.mdl-bg {
  position: fixed;
  background: rgba(0, 0, 0, 0.5);
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.mdl-centerizer {
  position: absolute;
  width: 100%;
  max-width: 750px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.1);

  &::before {
    content: "";
    display: block;
    padding-top: 56.25%;
  }
}

.mdl-contents {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

</style>