<template>
  <Loader v-if="loading"/>
  <v-content class="main__content" v-else>
    <v-container class="pa-0" v-if="user">
      <v-subheader class="black--text">
        <h2 class="main__name">Добро пожаловать,<br> {{ user.userName }}</h2>
      </v-subheader>
      <v-layout>
        <v-flex class="main__col" xs4>
          <RoomList />
        </v-flex>
        <v-flex class="main__col" xs4>
          <GeneralChat />
        </v-flex>
        <v-flex class="main__col" xs4>
          <PlayerList />
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar
      v-model="snackbar"
      bottom
    >
      {{ snackbarText }}
      <v-btn
        color="primary"
        text
        @click="snackbar = false"
      >
        Закрыть
      </v-btn>
    </v-snackbar>
  </v-content>
</template>

<script>
import RoomList from "../components/MainPage/RoomList";
import GeneralChat from "../components/MainPage/GeneralChat";
import PlayerList from "../components/MainPage/PlayerList";
import Loader from "../components/Loader";
import { db } from '~/plugins/firebase.js';

export default {
  layout: 'default',
  components: {PlayerList, RoomList, GeneralChat, Loader},
  data: () => ({
    user: '',
    loading: false,
    rooms: [],
    socketRooms: [],
    snackbarText: '',
    snackbar: false
  }),
  async mounted() {
    switch(this.$route.query.message) {
      case 'gameAlreadyStarted':
        this.snackbarText = 'Игра уже началась';
        this.snackbar = true;
        break;
      case('hostLeft'):
        this.snackbarText = 'Ведущий вышел из игры';
        this.snackbar = true;
        break;
      case('roomNotFound'):
        this.snackbarText = 'Комната не найдена';
        this.snackbar = true;
        break;
      case('notLoggedIn'):
        this.snackbarText = 'Вы не зашли в систему';
        this.snackbar = true;
        break;
    }

    this.loading = true;
    let user = this.$store.getters.getUsers.find((user) => this.$socket.id === user.id);
    this.user = user;
    if(!user) {
      this.$router.push('/login')
    }
    if(user.haveTimer === true) {
      location.reload();
    }
    this.loading = false;
    this.$socket.emit('leavingRoom');
    this.$socket.emit('deleteUserFromRoom', user);
    this.$socket.emit('leaveTest');
    this.$socket.emit('resetTimer')
  },
  sockets: {
    checkIfHost: async function() {
      await db.ref('rooms/').once('value')
        .then(value => {
          for(let key in value.val()) {
            if(value.val()[key].id === this.$socket.id + '1') {
              db.ref('rooms').child(key).remove();
              this.$socket.emit('kickPlayersFromRoom', this.$socket.id + '1');
            }
          }
        })
        .catch(e => console.log(e));
    }
  }
}
</script>

<style>
  .main__col {
    height: 800px;
  }
  .main__content {
    background-color: #fff;
  }
  .main__name {
    width: 400px;
    padding-left: 15px;
    margin-top: 20px;
  }
</style>
