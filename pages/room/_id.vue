<template>
  <v-content class="white">
    <Loader v-if="loading" class="loader"/>
    <v-container v-else class="black--text">
      <h1>Имя комнаты: {{ roomName }}</h1>
      <v-layout>
        <v-flex xs4>
          <RoomPlayers />
          <div>
            <v-btn
              :disabled="!startGameBtn || users.length < 2"
              @click="startGame"
              class="startGame__btn"
              dark
            >
              Начать игру
            </v-btn>
          </div>
        </v-flex>
        <v-flex xs-12>
          <PaintingCanvas aria-disabled="true"/>
        </v-flex>
        <v-flex xs4>
          <RoomChat />
        </v-flex>
      </v-layout>
    </v-container>
    <v-snackbar
      v-model="snackbar"
      bottom
    >
      Введите имя
      <v-btn
        color="pink"
        text
        @click="snackbar = false"
      >
        Закрыть
      </v-btn>
    </v-snackbar>
  </v-content>
</template>

<script>
  import RoomPlayers from "../../components/RoomPage/RoomPlayers";
  import PaintingCanvas from "../../components/RoomPage/PaintingCanvas";
  import RoomChat from "../../components/RoomPage/RoomChat";
  import Loader from "../../components/Loader";
  import { db } from '~/plugins/firebase.js';

  export default {
    name: "Room",
    data: () => ({
      user: '',
      snackbar: '',
      users: [],
      rooms: [],
      roomNames: [],
      roomName: '',
      loading: true,
      startGameBtn: false,
      msg: '',
    }),
    components: {RoomPlayers, PaintingCanvas, RoomChat, Loader},
    async mounted() {
      this.loading = true;
      const id = this.$route.path.split('/')[2];
      let user = this.$store.getters.getUsers.find((user) => this.$socket.id === user.id);
      this.$store.commit('addHaveTimer', user);
      this.user = user;
      this.users.push(user);
      if (!user) {
        this.$router.push('/login?message=notLoggedIn')
      } else {
        this.loading = false;
        this.$socket.emit('joinRoom', id);
        this.user = user;
        await db.ref('rooms').once('value')
          .then(value => {
            this.roomName = Object.values((value.val())).find(room => room.id === id).roomName;
            this.rooms = value.val();
          })
          .catch(e => console.log(e));
        if (!this.roomName) {
          await this.$router.push('/?message=roomNotFound')
        } else {
          this.loading = false;
        }
      }
      if (user.id + '1' === id) {
        this.startGameBtn = true;
      }
    },
    methods: {
      prepareMsg: function() {
        setTimeout(() => {
          this.$socket.emit('sendRoomMsg', {msg: 'Игра начнется через 5 секунд!', id: this.$route.path.split('/')[2], name: '[System]'});
        }, 1000)
      },
      newRound: function() {
        this.$socket.emit('sendRoomMsg', {msg: 'Новый раунд!', id: this.$route.path.split('/')[2], name: '[System]'});
        this.$socket.emit('choosePlayerToDraw', this.$route.path.split('/')[2]);
        this.$socket.emit('chooseWord', this.$route.path.split('/')[2]);
        this.$socket.emit('setupTimer', this.$route.path.split('/')[2]);
      },
      startGame: function() {
        let user = this.$store.getters.getUsers.find((user) => this.$socket.id === user.id);
        console.log(user);
        this.startGameBtn = false;
        this.$socket.emit('removeHost', this.$route.path.split('/')[2]);
        this.prepareMsg();
        setTimeout(() => this.newRound(), 5000);
      },
    },
    sockets: {
      test: function(rooms) {
        console.log(rooms)
      },
      kickPlayers: function() {
        const user = this.$store.getters.getUsers.find((user) => this.$socket.id === user.id);
        this.$socket.emit('sendRoomMsg', {msg: this.msg, id: this.$route.path.split('/')[2], name: user.userName});
        this.$socket.emit('leavingRoom');
        setTimeout(() => this.$router.push('/?message=hostLeft'), 1000)
      },
      movePlayersFromRoom: function () {
        setTimeout(() => this.$router.push('/?message=hostLeft'), 1000)
      },
      joinedRoom: function (user) {
        if (this.users.indexOf(user) === -1) {
          this.users.push(user);
        }
      },
    }
  }
</script>

<style scoped>
  .loader {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    margin-top: 50px;
  }
  .startGame__btn {
    margin-top: -59px;
  }
</style>
