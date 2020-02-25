<template>
  <div class="canvas">
    <h2 v-if="canDraw">Ваше слово: {{ word }}</h2>
    <canvas
      id="drawing"
      width="450"
      height="450"
      oncontextmenu="return false"
      :class="{'canvas__block': !canDraw}"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mousemove="handleMouseMove"
    >
      Ваш браузер не поддерживает данную функцию
    </canvas>
    <v-btn
      light
      class="canvas__btn"
      @click="clearCanvas"
      :disabled="!canDraw"
    >Очистить изображение</v-btn>
    <v-select
      class="canvas__colors"
      light
      :items="colors"
      :disabled="!canDraw"
      v-model="selected"
      @input="getColor"
      label="Выбрать цвет"
    ></v-select>
  </div>
</template>

<script>
  import { db } from '~/plugins/firebase.js';

  export default {
    name: "PaintingCanvas",
    data: () => ({
      mouse: {
        click: false,
        move: false,
        pos: {x:0, y:0},
        pos_prev: false,
      },
      id: '',
      roomName: '',
      colors: ['Черный', 'Зеленый', 'Желтый', 'Синий', 'Красный', 'Коричневый'],
      color: '',
      selected: 'Черный',
      canDraw: false,
      whoDraws: 0,
      seeWordDiv: false,
      word: ''
    }),
    methods: {
      getColor: function(e) {
        switch(e) {
          case 'Черный':
            this.color = 'black';
            break;
          case 'Зеленый':
            this.color = 'green';
            break;
          case 'Желтый':
            this.color = 'yellow';
            break;
          case 'Синий':
            this.color = 'blue';
            break;
          case 'Красный':
            this.color = 'red';
            break;
          case 'Коричневый':
            this.color = 'brown';
            break;
        }
      },
      handleMouseDown: function (e) {
        this.mouse.click = true;
      },
      handleMouseUp: function (e) {
        this.mouse.click = false;
      },
      handleMouseMove: function (e) {
        const canvas = document.getElementById('drawing');
        const context = canvas.getContext('2d');
        context.strokeStyle = this.color;
        this.mouse.pos.x = e.pageX - canvas.offsetLeft;
        this.mouse.pos.y = e.pageY - canvas.offsetTop;
        this.mouse.move = true;
      },
      mainLoop: function () {
        if (this.mouse.click && this.mouse.move && this.mouse.pos_prev) {
          this.$socket.emit('drawLine', { line: [ this.mouse.pos, this.mouse.pos_prev ], color: this.color, id: this.id});
          this.mouse.move = false;
        }
        this.mouse.pos_prev = {x: this.mouse.pos.x, y: this.mouse.pos.y};
        setTimeout(this.mainLoop, 25);
      },
      clearCanvas: function () {
        const canvas = document.getElementById('drawing');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        canvas.width = 1;
        canvas.width = w;
        this.$socket.emit('clearCanvas', this.id)
      },
      setCanDraw: function (val) {
        if(typeof val === "boolean") {
          this.canDraw = val;
        }
      },
      getCanDraw: function () {
        return this.canDraw;
      },
      setSeeWordDiv: function (val) {
        if(typeof val === "boolean") {
          this.seeWordDiv = val;
        }
      },
      setWhoDraws: function (v) {
        this.whoDraws = v;
      }
    },
    async mounted() {
      this.id = this.$route.path.split('/')[2];
      this.mainLoop();
      setTimeout(() => document.addEventListener('DOMContentLoaded', function () {
        this.mainLoop();
      }));
    },

    sockets: {
      drawLine: function (data) {
        const canvas  = document.getElementById('drawing');
        const context = canvas.getContext('2d');
        let line = data.line;
        context.beginPath();
        context.strokeStyle = data.color;
        context.moveTo(line[0].x, line[0].y);
        context.lineTo(line[1].x, line[1].y);
        context.stroke();
      },
      clearCanvasAll: function () {
        const canvas = document.getElementById('drawing');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        canvas.width = 1;
        canvas.width = w;
      },
      //Замыкание :)
      choosePlayerToDraw: function() {
        let roomId = this.$route.path.split('/')[2];
        let socketId = this.$socket.id;
        let socket = this.$socket;
        let whoDraws = this.whoDraws;
        let setSeeWordDiv = this.setSeeWordDiv;
        let setCanDraw = this.setCanDraw;
        let getCanDraw = this.getCanDraw;
        let setWhoDraws = this.setWhoDraws;
        db.ref('rooms').once('value')
          .then(function(value) {
            if(value.val()) {
              for(let [key, v] of Object.entries(value.val())) {
                if (v.id === roomId) {
                  const id = key;
                  db.ref('rooms/' + `${id}/` + 'users').once('value')
                    .then(function(value) {
                      if(whoDraws > Object.keys(value.val()).length - 1) {
                        whoDraws = 0;
                        setWhoDraws(0);
                      }
                      if(Object.keys(value.val())[whoDraws] === socketId) {
                        setCanDraw(true);
                        setSeeWordDiv(true);
                      }
                      let canDraw = getCanDraw();
                      socket.emit('disableChatIfPainter', {canDraw: canDraw, roomId: roomId});
                    })
                    .catch(e => console.log(e))
                }
              }
            }
          })
          .catch(e => console.log(e));
      },
      giveWordToPainter: function (word) {
        this.word = word;
      },
      changeThePainter: function() {
        this.canDraw = false;
        const canvas = document.getElementById('drawing');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        const w = canvas.width;
        canvas.width = 1;
        canvas.width = w;
      },
      increaseWhoDraws: function () {
        this.whoDraws++;
      }
    },
  }
</script>


<style scoped>
  .canvas {
    margin-left: 40px;
    height: 60vh;
  }
  #drawing {
    border: 3px solid black;
  }

  .canvas__btn {
    margin-top: 64px;
  }
  .canvas__colors {
    width: 50%;
    transform: translateY(35px);
  }
  .canvas__block {
    pointer-events: none;
  }
</style>

