<script setup>
  const query = ref("");
  const movies = ref([]);
  const search = async () => {
    const {Search} = await $fetch(`https://www.omdbapi.com/?i=tt3896198&apikey=87217617&s=${query.value}`);
    movies.value = Search;
    // console.log('data: ', data);
  }
</script>

<template>
  <form @submit.prevent="search">
    <p>Movie Database APIテスト 映画名を入力してください</p>
    <input type="text" v-model="query">
    <button>Search</button>
  </form>
  <ul>
    <li v-for="movie in movies" :key="movie.imdbID">
      <!-- movies-id -> movies/[id] -->
      <!-- params.id -> movies/[id] -->
      <NuxtLink :to="{name: 'movies-id', params: {id: movie.imdbID}}">
        <img :src="movie.Poster" :alt="movie.title">
      </NuxtLink>
    </li>
  </ul>
</template>

<style scoped>
ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}
.guideText {
  width: fit-content;
  margin: 0 auto;
}
</style>
