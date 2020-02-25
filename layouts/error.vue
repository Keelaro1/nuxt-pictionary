<template>
  <v-app app >
    <v-content class="grey">
      <Loader
        v-if="loading"
        class="loader"
      />
      <v-container class="fill-height" v-else>
        <v-row
          class=" mt-n12"
          justify="center"
        >
          <v-col
            class="text-center"
            cols="auto"
          >
            <h1 class="font-weight-bold mb-6">
              Ошибка! 404
            </h1>

            <p class="mb-12 display-1 grey--text text--darken-2">
              Страница не найдена
            </p>

            <v-btn
              color="black"
              x-large
              to="/"
            >
              Перейти на главную

              <v-icon right>
                mdi-open-in-new
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import Loader from "../components/Loader";

  export default {
    data: () => ({
      loading: true
    }),
    mounted() {
      this.loading = true;
      setTimeout(() => this.loading = false, 700);
    },
    components: {Loader}
  }
</script>

<style scoped>
  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }
  h1 {
    font-size: 96px;
  }
  @media (max-width: 600px) {
    h1 {
      font-size: 48px;
    }
  }
</style>
