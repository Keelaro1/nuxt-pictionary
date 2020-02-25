<template>
  <div class="general-chat__wrapper">
    <Loader class="loader" v-if="loading"/>
    <div class="general-chat" v-else>
      <h1 class="black--text">Главный чат</h1>
      <div
        class="general-chat__chat">
        <h4
          id="messages"
          v-for="message in genMessages"
        >
          <span class="red--text">{{ message.date }}</span>
          <span class="font-weight-bold">{{ message.userName }}:</span> <span class="black--text font-regular">{{ message.msg }}</span>
        </h4>
      </div>
      <v-form
        @submit.prevent="sendMessage"
        class="genChat__form"
      >
        <v-text-field
          v-model="msg"
          autocomplete="off"
          label="Введите сообщение"
          color="black"
          light
          maxlength="30"
        >
        </v-text-field>
        <v-btn :disabled="cooldown" type="submit">Отправить</v-btn>
      </v-form>
    </div>
  </div>
</template>

<script>
  import { db } from '~/plugins/firebase.js';
  import Loader from "../Loader";

  export default {
    name: "GeneralChat",
    components: {Loader},
    data: () => ({
      msg: '',
      genMessages: [],
      cooldown: false,
      loading: false
    }),
    methods: {
      async sendMessage() {
        const user = this.$store.getters.getUsers.find((item) => this.$socket.id === item.id);
        let hours = new Date().getHours();
        if (hours < 10)  {
          hours = '0' + hours;
        }
        let minutes = new Date().getMinutes();
        if (minutes < 10)  {
          minutes = '0' + minutes;
        }
        if(this.msg) {
          user.msg = this.msg;
          user.date = `${hours}:${minutes}`;
          this.$socket.emit('generalChatMessage', user);
          await db.ref('generalChatMessages/' + `f${(+new Date).toString(16)}`).set({
            date: `${hours}:${minutes}`,
            id: this.$socket.id,
            msg: this.msg,
            userName: user.userName,
          });
        }
        this.msg = '';
        this.user = user;
        this.cooldown = true;
        setTimeout(() => this.cooldown = false, 1000);
      },
    },
    async mounted() {
      this.loading = true;
      await db.ref('generalChatMessages').limitToLast(11).once('value')
        .then(value => this.genMessages = (value.val()))
        .then(setTimeout(() => this.loading = false, 700))
        .catch(e => console.log(e));
    },
    sockets: {
      genChatMsg: function(user) {
        if(this.genMessages) {
          let temp = Object.values(this.genMessages);
          temp.push(user);
          if(temp.length > 10) {
            this.genMessages = temp.slice(temp.length - 11, temp.length);
          } else {
            this.genMessages = temp;
          }
        } else {
          this.genMessages = [];
          this.genMessages.push(user);
        }
      },
      userDisconnected: async function(id) {
        let tempUsers = {};
        tempUsers = await db.ref('users').once('value')
          .then(value => tempUsers = (value.val()));
        tempUsers = Object.values(tempUsers);
        let user = tempUsers.find(value => id === value.id);
        let temp = Object.values(this.genMessages);
        temp.push({userName: `${user.userName} вышел`});
        this.genMessages = temp.slice(temp.length - 11, temp.length);
      },
    }
  }
</script>

<style>
  .loader {
    margin-top: 40px;
  }
  .general-chat__wrapper {
    background-color: #fff;
    transform: translateY(-50px);
    padding-left: 20px;
    padding-bottom: 200px;
    min-height: 90vh;
  }
  .general-chat {
    position: relative;
    margin: 0 auto;
  }
  .general-chat__chat {
    height: 60.1vh;
    margin-top: 20px;
    word-wrap: break-word;
  }
  li {
    list-style-type: none;
  }
  span {
    color: #000;
  }
  .genChat__form {
    position: absolute;
    transform: translateY(30px);
    bottom: 0;
    width: 80%;
  }

</style>
