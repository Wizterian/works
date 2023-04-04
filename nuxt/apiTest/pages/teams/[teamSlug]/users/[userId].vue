<script setup>
const route = useRoute();
const message = computed(() => {
  // console.log(route.params.userId);
  // return;
  const msg = `Team: ${route.params.teamSlug}\
  User ID: ${route.params.userId}`;
  return msg;
});
</script>

<template>
  <div>
    <!-- Team: {{$route.params.teamSlug}}
    <br>
    User ID: {{$route.params.userId}} -->
    {{message}}
  </div>
</template>

<style scoped></style>
