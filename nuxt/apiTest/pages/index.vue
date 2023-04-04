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
  <MovieSearch />
</template>

<style scoped>
ul {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  list-style: none;
}
</style>
