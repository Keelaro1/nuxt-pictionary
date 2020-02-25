<template>
  <Loader v-if="loading"/>
  <div
    class="room-list"
    v-else
  >
    <v-subheader class="black--text room-list__header" v-if="rooms.length === 0">Список комнат пуст</v-subheader>
    <div v-else>
      <v-subheader class="black--text room-list__header">Список комнат:</v-subheader>
      <v-list
        subheader
        class="room-list__list"
      >
        <v-list-item
          v-for="(room, i) in rooms"
          :key="room.id + i"
        >
          <v-list-item-content>
            <nuxt-link
              class="room-list__link room-list__item"
              :to="'room/' + room.id"
            >
              Комната {{ i + 1 }}: {{ room.roomName }}
            </nuxt-link>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </div>
    <v-form
      class="room__form"
      ref="form"
      lazy-validation
      @submit.prevent="createRoom"
    >
      <v-text-field
        class="form__input"
        color="black"
        v-model="roomName"
        label="Название комнаты"
        light
        autocomplete="off"
        maxlength="15"
      ></v-text-field>
      <v-btn type="submit">Создать комнату</v-btn>
    </v-form>
  </div>

</template>

<script>
  import { db } from '~/plugins/firebase.js';
  import Loader from "../Loader";

  export default {
    name: "Rooms",
    components: {Loader},
    data: () => ({
      user: '',
      rooms: [],
      roomName: '',
      loading: true,
    }),
    async mounted() {
      this.loading = true;
      this.user = this.$store.getters.getUsers.find(value => this.$socket.id === value.id);
      await db.ref('rooms').once('value')
        .then(value => {
          if(value.val()) {
            this.rooms = (Object.values(value.val()))
          } else {
            this.rooms = []
          }
        })
        .then(setTimeout(() => this.loading = false, 800))
        .catch(e => console.log(e));
    },
    methods: {
      async createRoom() {
        if (this.roomName) {
          this.loading = true;
          this.rooms.push({id: this.$socket.id + '1', roomName: this.roomName});
          this.$socket.emit('addToRoomList', this.rooms);
          await db.ref('rooms/' + `f${(+new Date).toString(16)}`).set({
            id: this.$socket.id + '1',
            roomName: this.roomName,
          });
          this.roomName = '';
          this.$router.push('/room/' + this.$socket.id + '1')
        }
      },
    },
    sockets: {
      addToRoomListAll: function(roomList) {
        this.rooms = roomList;
      },
      roomListRemove: function(id) {
        this.rooms = this.rooms.filter(room => room.id != id + '1')
      },
      roomListRemoveById: function (id) {
        this.rooms = this.rooms.filter(room => room.id != id)
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
  .room-list {
    position: relative;
    margin-top: 30px;
    height: 62vh;
    background-color: #fff;
  }
  .room-list__item {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  .room-list__list {
    background-color: #eeffff
  }
  .room__form {
    position: absolute;
    bottom: 0;
    width: 80%;
  }
  .room-list__header {
    padding-left: 30px;
  }
  .room-list__list{
    height: 40vh;
    width: 80%;
    margin-top: 15px;
    overflow-y: auto;
  }
  .room-list__link {
    color: #000;
    padding-left: 15px;
    text-decoration: none;
  }
  .room-list__link:hover {
    background-color: #ccdddd;
  }
</style>
