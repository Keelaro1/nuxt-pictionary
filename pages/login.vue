<template>
  <v-layout class="layout">
    <Loader v-if="loading"/>
    <v-flex v-else class="login__content">
      <v-form
        class="login__form "
        ref="form"
        v-model="valid"
        lazy-validation
        color="black"
        light
        @submit.prevent="submit"
      >
        <v-text-field
          class="form__input"
          color="black"
          v-model="userName"
          :rules="userNameRules"
          label="Ваше имя"
          light
          autocomplete="off"
          maxlength="15"
        ></v-text-field>
        <v-btn
          class="form__btn"
          :class="{'red': !valid}"
          type="submit"
        >
          Вход
          <v-icon>mdi-login</v-icon>
        </v-btn>
      </v-form>
      <div class="accordion__wrapper black--text">
        <v-expansion-panels class="accordion__panels">
          <v-expansion-panel
            v-for="item in accordionHeaders"
            :key="accordionHeaders.title"
            class="accordion__panel"
          >
            <v-expansion-panel-header> {{ item.title }}
              <v-icon slot="actions" color="black">$vuetify.icons.expand</v-icon>
            </v-expansion-panel-header>
            <v-expansion-panel-content >
              <span class="red--text quote">"Самые неприятные баги - это гейзенбаги"</span>
              <pre>{{ item.text }}</pre>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </v-flex>
    <h4 class="github"><a href="https://github.com/Igelness/nuxt-pictionary">GitHub</a></h4>
    <h5 class="disclaimer grey--text">Создатель сайта не несёт ответственности за содержимое рисунков и сообщений</h5>
    <v-snackbar
      v-model="snackbar"
      bottom
    >
      {{ snackbarText }}
      <v-btn
        color="pink"
        text
        @click="snackbar = false"
      >
        Закрыть
      </v-btn>
    </v-snackbar>
  </v-layout>
</template>
<script>
  import { db } from '~/plugins/firebase.js';
  import Loader from "../components/Loader";

  export default {
    name: "login",
    layout: "empty",
    components: {Loader},
    data: () => ({
      valid: true,
      snackbar: false,
      userName: '',
      userNameRules: [
        v => !!v || 'Введите имя',
        v => v.length >= 5 || 'Минимальная длина имени - 5 символов'
      ],
      loading: false,
      snackbarText: '',
      accordionHeaders: [{title: 'Важная информация', text: 'Иногда, если играет от трёх и более человек, и предыдущий\nраунд закончился из-за окончания таймера, в следующем\nраунде может быть двое рисующих.'}]
    }),
    methods: {
      async submit() {
        if (this.$refs.form.validate()) {
          const user = {
            userName: this.userName,
            id: this.$socket.id,
            wordToGuess: ''
          };
          this.$store.commit('addUser', user);
          this.$socket.emit('playerLogged', user);
          await db.ref('users/' + `f${(+new Date).toString(16)}`).set({
            id: this.$socket.id,
            userName: user.userName,
          });
          this.$router.push('/');
        }
      }
    },
    mounted() {
      if(this.$route.query.message === 'notLoggedIn') {
        this.snackbarText = 'Вы вышли из системы';
        this.snackbar = true;
      }
      this.loading = true;
      const user = this.$store.getters.getUsers.find((item) => this.$socket.id === item.id);
      if (user) {
        this.$router.push('/');
      } else {
        this.loading = false;
      }
    }
  }
</script>

<style scoped lang="scss">
  pre {
    font-family: Roboto, Arial;
    width: 450px;
    font-size: 14px;
  }
  .accordion__wrapper {
    margin-top: 48px;
  }
  .accordion__panels {
    width: 450px;
  }
  .accordion__panel {
    color: #000 !important;
    background-color: #fff !important;
  }
  .quote {
    font-size: 14px;
  }
  .layout {
    display: table;
    margin: 0 auto;
    background-color: #fff;
  }
  .login__form {
    width: 450px;
    margin-top: 50px;
    background-color: #ccdddd;
    text-align: center;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    padding-bottom: 20px;
    margin-right: 50px;
    button {
      margin-top: 100px;
      background-color: #000;
    }
  }
  .form__title {
    display: table;
    margin: 0 auto;
    padding-top: 30px;
    color: #000;
    font-size: 30px;
  }
  .form__input {
    padding: 0px 30px;
    margin-top: 30px;
  }
  .login__content {
    display: flex;
  }
  .red {
    pointer-events: none;
  }
  .github {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    border-bottom: 1px solid transparent;
  }
  .github:hover {
    border-bottom: 1px solid #aaa;
  }
  .disclaimer {
    position: absolute;
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
  }
  @media (max-width: 1000px) {
    .login__content {
      display: block;
    }
  }
  a {
    text-decoration: none;
    color: #aaa;
  }
</style>
