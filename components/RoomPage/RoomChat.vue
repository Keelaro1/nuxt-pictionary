<template>
  <div class="general-chat" v-else>
    <h2 v-if="enableTimer">Времени осталось: {{ timer }} секунд</h2>
    <h2>Чат комнаты</h2>
    <div
      class="general-chat__chat">
      <h3
        id="messages"
        v-for="message in roomMessages"
      >
        {{message}}
      </h3>
    </div>
    <v-form
      @submit.prevent="sendRoomMessage"
      class="genChat__form"
    >
      <v-text-field
        v-model="msg"
        autocomplete="off"
        label="Введите сообщение"
        color="black"
        light
        maxlength="20"
        :disabled="!canType"
      >
      </v-text-field>
      <v-btn :disabled="cooldown" dark type="submit">Отправить</v-btn>
    </v-form>
    <v-snackbar
      v-model="snackbar"
    >
      Дождитесь окончания раунда / Игра еще не началась
    </v-snackbar>
  </div>
</template>

<script>

  export default {
    name: "RoomChat",
    data: () => ({
      cooldown: false,
      msg: '',
      roomMessages: [],
      userName: '',
      wordToGuess: '',
      canType: true,
      snackbar: false,
      enableTimer: false,
      reduceTime: false,
      timer: 100,
    }),
    methods: {
      sendRoomMessage({msg, id, name}) {
        if(this.msg) {
          const user = this.$store.getters.getUsers.find((item) => this.$socket.id === item.id);
          if(this.msg === this.wordToGuess) {
            this.roomMessages.push('Вы угадали слово!');
            if(this.roomMessages.length > 9) {
              this.roomMessages = this.roomMessages.slice(this.roomMessages.length - 10, this.roomMessages.length);
            }
            this.$socket.emit('increaseWhoDraws', this.$route.path.split('/')[2]);
            setTimeout(() => this.$socket.emit('sendRoomMsg', {msg: 'Новый раунд!', id: this.$route.path.split('/')[2], name: '[System]'}), 500)
          } else {
            this.roomMessages.push(`${user.userName}: ${this.msg}`);
            if(this.roomMessages.length > 9) {
              this.roomMessages = this.roomMessages.slice(this.roomMessages.length - 10, this.roomMessages.length);
            }
          }
          this.$socket.emit('sendRoomMsg', {msg: this.msg, id: this.$route.path.split('/')[2], name: user.userName});
          this.cooldown = true;
          setTimeout(() => this.cooldown = false, 1000);
          this.msg = '';
        }
      },
      newRound() {
        this.$socket.emit('setupTimer', this.$route.path.split('/')[2]);
        this.$socket.emit('changeThePainter', this.$route.path.split('/')[2]);
        this.$socket.emit('choosePlayerToDraw', this.$route.path.split('/')[2]);
        this.$socket.emit('chooseWord2', this.$route.path.split('/')[2]);
      }
    },
    mounted() {
      this.$socket.emit('setupTimer', this.$route.path.split('/')[2]);
      const user = this.$store.getters.getUsers.find((item) => this.$socket.id === item.id);
      this.wordToGuess = '';
      if(!user.wordToGuess) {
        this.snackbar = true;
        this.canType = false;
      }
    },
    sockets: {
      newRoomMsg: function (obj) {
        if(obj.text === this.wordToGuess) {
          this.roomMessages.push(`Игрок ${obj.name} угадал!, загаданное слово: ${this.wordToGuess}`);
          if(this.roomMessages.length > 9) {
            this.roomMessages = this.roomMessages.slice(this.roomMessages.length - 10, this.roomMessages.length);
          }
          this.wordToGuess = '';
          this.newRound();
        } else {
          this.roomMessages.push(obj.message);
        }
        if(this.roomMessages.length > 9) {
          this.roomMessages = this.roomMessages.slice(this.roomMessages.length - 10, this.roomMessages.length);
        }
      },
      chooseWordFromArray: function(word) {
        this.timer = 100;
        this.wordToGuess = word;
        setInterval(() => {
          this.$socket.emit('decreaseTimer', {timer: this.timer, id: this.$route.path.split('/')[2]})
          if(this.timer <= 0) {
            this.roomMessages.push(`Никто не угадал!, загаданное слово: ${this.wordToGuess}`);
            this.wordToGuess = '';
            if(this.roomMessages.length > 9) {
              this.roomMessages = this.roomMessages.slice(this.roomMessages.length - 10, this.roomMessages.length);
            }
            this.$socket.emit('increaseWhoDraws', this.$route.path.split('/')[2]);
            this.newRound();
          }
        }, 1000);
      },
      disableChatIfPainter: function (canDraw) {
        if (canDraw === false) {
          this.canType = true
        } else {
          this.$socket.emit('giveWordToPainter', {id: this.$route.path.split('/')[2], word: this.wordToGuess});
          this.canType = false;
        }
      },
      enableChat: function () {
        this.canType = true;
      },
      setupTimer: function () {
        this.timer = 100;
        this.enableTimer = true;
      },
      decreaseTimer: function (timer) {
        this.timer = timer;
      },
      chooseWord2: function (word) {
        this.wordToGuess = word;
      },
    }
  }
</script>

<style scoped>
  .room-chat__chat {
    height: 40vh;
  }
</style>
