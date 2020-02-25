<template>
  <div class="player-list" v-else>
    <h2>Список игроков комнаты ({{ users.length }}) : </h2>
    <div class="room__players-list">
      <h3 v-for="user in users">{{ user.userName }}</h3>
    </div>
  </div>
</template>

<script>
  import { db } from '~/plugins/firebase.js';

  export default {
    name: "RoomPlayers",
    data: () => ({
      users: [],
      dbUsers: [],
      rooms: [],
      roomKey: '',
      host: false,
    }),
    async mounted() {
      const id = this.$route.path.split('/')[2];
      const user = this.$store.getters.getUsers.find((user) => this.$socket.id === user.id);
      if(user.id + '1' === id) {
        this.host = true;
      }
      await db.ref('rooms').once('value')
        .then(value => this.rooms = value.val());
      const rooms = this.rooms;
      if(Object.entries(rooms)) {
        for(let [key, value] of Object.entries(rooms)) {
          if(value.id === id) {
            await db.ref('rooms/' + `${key}/` + 'users/' + this.$socket.id).set({
              id: this.$socket.id,
              userName: user.userName,
              host: this.host
            });
            this.roomKey = key;
          }
        }
      }
      await db.ref('rooms/' + `${this.roomKey}/` + 'users/').once('value')
        .then(value => {
          const checkHost = [];
          for(let val of Object.values(value.val())) {
            checkHost.push(val.host);
          }
          if(checkHost.indexOf(true) === -1) {
            this.$socket.emit('leavingRoom');
            this.$router.push('/?message=gameAlreadyStarted');
            user.haveTimer = false;
          }
          this.users.push(...Object.values(value.val()));
        })
        .catch(e => console.log(e));
      this.$socket.emit('playerJoinedRoom', id, {user});
    },
    sockets: {
      joinedRoom: function (user) {
        if (this.users.indexOf(user) === -1) {
          this.users.push(user);
        }
      },
      deleteFromRoom: function (user) {
        this.users = this.users.filter(u => user.id != u.id);
        if(user.host === true) {
          this.$router.push('/?message=hostLeft')
        }
      },
      roomPlayerListRemove: function (id) {
        this.users = this.users.filter(u => id != u.id);
      },
      removeHost: async function () {
        const user = this.$store.getters.getUsers.find((user) => this.$socket.id === user.id);
        if(this.host === true) {
          this.host = false;
          await db.ref('rooms/' + `${this.roomKey}/` + 'users/' + this.$socket.id).set({
            id: this.$socket.id,
            userName: user.userName,
            host: false
          });
        }
      }
    }
  }
</script>

<style scoped>
  ::-webkit-scrollbar {
    width: 10px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  ::-webkit-scrollbar-thumb {
    background: lightskyblue;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
  .room__players-list {
    height: 40vh;
    overflow-y: auto;
  }
  .player-list {
    position: relative;
    height: 60vh;
  }
</style>
