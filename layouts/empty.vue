<template>
  <v-app app >
      <v-content class="content">
        <v-container fluid class="container" >
          <nuxt />
        </v-container>
    </v-content>
  </v-app>
</template>

<script>
  export default {
    name: "empty"
  }
</script>

<style scoped>
  .content {
    background-color: #fff;
  }
</style>
