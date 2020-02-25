<template>
  <Loader v-if="loading" />
  <div class="player-list black--text" v-else>
    <h2>Список всех игроков ({{ users.length }}) : </h2>
    <div class="users-list">
      <h3 v-for="user in users">{{ user.userName }}</h3>
    </div>
  </div>
</template>

<script>
  import { db } from '~/plugins/firebase.js';
  import Loader from "../Loader";

  export default {
    name: "PlayerList",
    components: {Loader},
    data: () => ({
      loading: false,
      users: [],
    }),
    async mounted(){
      this.loading = true;
      await db.ref('users').once('value')
        .then(value => this.users = Object.values((value.val())))
        .then(setTimeout(() => this.loading = false, 500))
        .catch(e => console.log(e));
    },
    sockets: {
      playerListRemove: function(id) {
        this.users = this.users.filter(user => user.id != id)
      },
      playerJoined: function(user) {
        this.users.push(user);
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
  li {
    list-style-type: none;
  }
  .users-list {
    height: 45vh;
    width: 80%;
    margin-top: 15px;
    overflow-y: auto;
  }
  .player-list {
    transform: translateY(-46px);
    padding-left: 20px;
    height: 62vh;
    background-color: #fff;
  }
</style>
