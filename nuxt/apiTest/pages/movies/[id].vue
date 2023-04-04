<script setup>
  const route = useRoute();
  // const {data} = useAsyncData(
  //   `/movies/${route.params.id}`,
  //   () => {
  //     return $fetch(
  //       `https://www.omdbapi.com/?apikey=87217617&i=${route.params.id}`
  //     )
  //   },{
  //     pick: ['Plot', 'Title']
  //   }
  // );
  const {data} = await useFetch(
    `https://www.omdbapi.com/?apikey=87217617&i=${route.params.id}`,
    // 'https://httpbin.org/status/500',
    {
      pick: ['Plot', 'Title', 'Error', 'Poster'],
      key: `/movies/${route.params.id}`,
      // onResponse({request, response}){
      //   if(response._data.Error === "Incorrect IMDb ID.") {
      //     showError({statusCode: 404, statusMessage: "Page Not Found"});
      //   }
      // },
      // onResponseError() {
      //   showError({statusCode: 500, statusMessage: "Ooops!"});
      // }
    }
  );
  useHead({
    title: data.value.Title,
    meta: [
      { name: "description", content: data.value.Plot },
      { property: "og:description", content: data.value.Plot },
      { property: "og:image", content: data.value.Poster },
      { name: "twitter:card", content: `summary_large_image` },
    ],
  });
  if(data.value.Error === "Incorrect IMDb ID.") {
    showError({statusCode: 404, statusMessage: "Page Not Found"});
  }
</script>

<template>
  <pre>
    {{ data }}
  </pre>
</template>

<style scoped></style>
