<script setup>
/** 
 * Stage情報ページ
 * 1.セレクター変更で、サブカテゴリー選択用チェックボックスを切り替え
 * 2.チェックボックス選択・絞り込む（もしくはクエリーパラメーター）で該当記事（JSON）表示
 * 
 * 使い方
 * 1.記事JSON用意
 *     カテゴリ名は比較処理用に必要
 * 2.セレクタとチェックボックス設定
 *     カテゴリ名は比較処理用に必要（categoryItems）
 * 3.URLパラメータ設定（オプション）
 *     ?sub=subCat3&sub=subCat1
 *     同一カテゴリ内で指定（異なる場合、最初のパラメータが属するカテゴリのoptionグループ表示）
*/
import { ref, watchEffect, onMounted, onUpdated } from 'vue';
import stageData from "@/assets/stage/js/stageData.json"; // JSONデータ
import StageItem from "@/components/stage/StageListItem.vue"; // 項目コンポーネント

// 記事JSON
const posts = stageData.posts;
// select（と紐づくoptionグループ）設定 valueの（サブ）カテゴリ名は比較処理用に必須
const categoryItems = [
  {label: "ステージを絞り込む", value: "all", id: "catAll", options: [
      {label: "すべて", value: "all", id: "catAll"}
  ]},
  {label: "カテゴリ1", value: "cat1", id: "cat1", options: [
      {label: "カテゴリ1サブカテゴリ1", value: "subCat1", id: "cat1subCat1"},
      {label: "カテゴリ1サブカテゴリ2", value: "subCat2", id: "cat1subCat2"},
      {label: "カテゴリ1サブカテゴリ3", value: "subCat3", id: "cat1subCat3"}
  ]},
  {label: "カテゴリ2", value: "cat2", id: "cat2", options: [
      {label: "カテゴリ2サブカテゴリ4", value: "subCat4", id: "cat2subCat4"},
      {label: "カテゴリ2サブカテゴリ5", value: "subCat5", id: "cat2subCat5"}
  ]},
  {label: "カテゴリ3", value: "cat3", id: "cat3", options: [
      {label: "カテゴリ3サブカテゴリ6", value: "subCat6", id: "cat3subCat6"},
      {label: "カテゴリ3サブカテゴリ7", value: "subCat7", id: "cat3subCat7"}
  ]}
];
const catAll = categoryItems[0].value; // 全記事表示用カテゴリ名
const paramData = location.search; // URLパラメータ
let selectedCat = ref(null); // selectのvalue（カテゴリ名）
let selectedSubCats = ref([]); // optionのvalue（サブカテゴリ名） reactive([])は値を直に代入の場合機能しないため不使用
let categoryItem = ref([]); // categoryItemsの一要素
let filteredPostData = ref([]); // filterされた記事データ（非表示）
let filteredPosts = ref([]); // filterされた記事（表示）
let noPostsFlg = ref(false); // 0件表示

// selector変更
const selectCatHandler = () => {
  resetCheckBoxes();
  showOptionGroup();
}

// selectorに紐づくoption表示
const showOptionGroup = () => {
  categoryItem.value = categoryItems.filter(catItem => catItem.value === selectedCat.value);
}

// checkbox変更・記事振り分け配列生成
const filterPostData = () => {
  filteredPostData.value = [...posts].filter(post => selectedSubCats.value.includes(post.subCategory));
}

// 全チェックボックスを初期化
const resetCheckBoxes = () => selectedSubCats.value = [];

// 全記事表示・初期化
const showAllPosts = () => {
  noPostsFlg.value = false;
  resetCheckBoxes();
  selectedCat.value = catAll;
  showOptionGroup();
  selectedSubCats.value = [catAll];
  filteredPostData.value = posts;
  filteredPosts.value = filteredPostData.value;
}

// 振り分け記事表示
const showFilteredPosts = () => {
  filteredPosts.value = filteredPostData.value;
  noPostsFlg.value = filteredPostData.value.length === 0 ? true : false;
}

// 例外処理（カテゴリ名が「all（ステージを絞り込む）」の場合は全記事表示）
watchEffect(() => {
  if(selectedCat.value === catAll) {
    showAllPosts();
    return selectedSubCats.value;
  }
})

// ボタン機能
const resetBtnHandler = () => showAllPosts();
const filterBtnHandler = () => showFilteredPosts();

// パラメーター処理
const paramsHandler = () => {
  const subCats = new URLSearchParams(paramData).getAll('sub');
  selectedSubCats.value = subCats; // チェックボックス選択
  filterPostData(); // 記事振り分け
  showFilteredPosts(); // 記事表示
  categoryItems.forEach(catItem => {
    (catItem.options).forEach(opt => {
      if(opt.value.includes(subCats[0])) {
        selectedCat.value = catItem.value; // select（親カテゴリ）選択
        showOptionGroup();
      }
    })
  });
}

// 初期表示
onMounted(() => paramData ? paramsHandler(): showAllPosts());
// 描画が更新（子コンポーネント読込）されたら、動的リンクに既存ライブラリ適用
onUpdated(() => window.YoutubeModal.YTVideoModal());
</script>

<template lang="pug">
h1 Stage
ul.stageDetail
  li ・フィルター項目設定 … 変数に親カテゴリ、子カテゴリ設定
  li ・JSON管理（記事詳細） … MTでJSON設定
  li ・URLパラメータフィルタリング … 「?sub=categoryName」フィルタリングして遷移
  li ・TOPスライダーコンポーネント（JSONを共用）
div.stageFilter
  select(v-model="selectedCat" v-on:change="selectCatHandler")
    option( v-for="catItem in categoryItems", :value="catItem.value") {{ catItem.label }}
  ul(v-for="optGroup in categoryItem" :key="optGroup.id")
    li(v-for="optItem in optGroup.options" :key="optItem.id")
      input(type="checkbox", name="filterItems",
        :id="optItem.value",
        :value="optItem.value",
        v-model="selectedSubCats",
        v-on:change="filterPostData"
      )
      label(:for="optItem.value") {{ optItem.label }}
  div
    button(@click="resetBtnHandler") リセット
    button(@click="filterBtnHandler") 絞り込む
div(v-if="noPostsFlg") 該当記事なし
transition-group(name="stageItems")
  StageItem(v-for="post in filteredPosts" :key="post.id" :post="post")
</template>

<style lang="scss" scoped>
@import '../../assets/common/css/_variables.scss';
// 固有スタイル記載
.stageFilter {
  width: 100%;
  max-width: $contentsW;
  margin: 0 auto;
  background: #ececec;
  margin-bottom: 20px;
}
.stageDetail {
  margin-bottom: 20px;
}

// トランジション用（https://v3.ja.vuejs.org/guide/transitions-list.html#list-move-transitions）
.stageItem {
  width: 100%;
  max-width: $contentsW;
  transition: all 0.6s cubic-bezier(0.445, 0.05, 0.55, 0.95);
}
.stageItems-enter-from,
.stageItems-leave-to {
  opacity: 0;
}
.stageItems-leave-active {
  position: absolute;
}
</style>