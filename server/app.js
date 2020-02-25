const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const firebase = require('firebase');
let wordList = require('../assets/wordList');

io.on('connection', socket => {
  let joinedRoom;

  socket.on('generalChatMessage', function (user) {
    io.emit('genChatMsg', user)
  });

  socket.on('playerLogged', function(user) {
    io.emit('playerJoined', user)
  });

  socket.on('playerJoinedRoom', function(id, {user}) {
    socket.broadcast.to(id).emit('joinedRoom', user)
  });

  socket.on('disconnectFromServer', function () {
    socket.disconnect(true);
  });

  socket.on('disconnect', async function () {
    await io.emit('userDisconnected', socket.id);
    await io.emit('playerListRemove', socket.id);
    socket.broadcast.to(joinedRoom).emit('roomPlayerListRemove', socket.id);

    await firebase.database().ref('rooms').once('value')
      .then(function(value) {
        if(value.val()) {
          for(let [key, v] of Object.entries(value.val())) {
            if (v.id === joinedRoom) {
              const id = key;
              firebase.database().ref('rooms/' + `${id}/` + 'users').once('value')
                .then(function(value) {
                  for(let key in value.val()) {
                    if(key === socket.id) {
                      firebase.database().ref('rooms/' + `${id}/` + 'users').child(key).remove();
                    }
                  }
                })
                .catch(e => console.log(e))
            }
          }
        }
      });

    await firebase.database().ref('users').once('value')
      .then(function(value) {
        for(let key in value.val()) {
          if(value.val()[key].id === socket.id) {
            setTimeout(() => firebase.database().ref('users').child(key).remove(), 1000)
          }
        }
      })
      .catch(e => console.log(e));

    await firebase.database().ref('rooms').once('value')
      .then(async function(value) {
        for(let key in value.val()) {
          if(value.val()[key].id === socket.id + '1') {
            io.emit('roomListRemove', socket.id);
            await firebase.database().ref('rooms').child(key).remove();
            io.to(value.val()[key].id).emit('kickPlayers');
          }
        }
      })
      .catch(e => console.log(e));
  });

  socket.on('joinRoom', function(id) {
    socket.join(id, () => {
      joinedRoom = id;
    });
  });

  socket.on('deleteUserFromRoom', function(user) {
    socket.broadcast.to(joinedRoom).emit('deleteFromRoom', user);
    socket.emit('checkIfHost', user)
  });

  socket.on('kickPlayersFromRoom', function (key) {
    socket.broadcast.to(key).emit('movePlayersFromRoom');
    io.emit('roomListRemoveById', key)
  });

  socket.on('leavingRoom', async function() {
    socket.leave(Object.values(socket.rooms)[1], async () => {
      await firebase.database().ref('rooms').once('value')
        .then(function(value) {
          if(value.val()) {
            for(let [key, v] of Object.entries(value.val())) {
              if (v.id === joinedRoom) {
                const id = key;
                firebase.database().ref('rooms/' + `${id}/` + 'users').once('value')
                  .then(function(value) {
                    for(let key in value.val()) {
                      if(key === socket.id) {
                        firebase.database().ref('rooms/' + `${id}/` + 'users').child(key).remove();
                      }
                    }
                  })
                  .catch(e => console.log(e))
              }
            }
          }
        })
        .catch(e => console.log(e))

    });
  });

  socket.on('addToRoomList', function(roomList) {
    io.emit('addToRoomListAll', roomList)
  });

  socket.on('sendRoomMsg', function({msg, id, name}) {
    if(msg === 'Игра начнется через 5 секунд!' && name === '[System]') {
      io.to(id).emit('newRoomMsg', {message: `${name}: ${msg}`})
    } else if (msg === 'Новый раунд!' && name === '[System]')  {
      io.to(id).emit('newRoomMsg', {message: `${name}: ${msg}`})
    } else if (msg.includes('Никто не угадал, загаданное слово:') && name === '[System]') {
      socket.to(id).emit('newRoomMsg', {message: `${name}: ${msg}`})
    } else {
      socket.to(id).emit('newRoomMsg', {message: `${name}: ${msg}`, text: msg, name: name})
    }
  });

  //canvas
  socket.on('drawLine', function (data) {
    socket.to(data.id).emit('drawLine', { line: data.line , color: data.color});
    socket.emit('drawLine', { line: data.line })
  });

  socket.on('clearCanvas', function (id) {
    socket.to(id).emit('clearCanvasAll');
  });

  //game
  const words = Object.values(wordList);

  socket.on('choosePlayerToDraw', function(id) {
    io.to(id).emit('choosePlayerToDraw');
  });

  socket.on('disableChatIfPainter', function({canDraw, roomId}) {
    socket.emit('disableChatIfPainter', canDraw)
  });

  socket.on('chooseWord', function(id) {
    let word = words[Math.floor(Math.random() * words.length)];
    io.to(id).emit('chooseWordFromArray', word)
  });

  socket.on('chooseWord2', function(id) {
    let word = words[Math.floor(Math.random() * words.length)];
    io.to(id).emit('chooseWord2', word);
  });

  socket.on('giveWordToPainter', function ({id, word}) {
    io.to(id).emit('giveWordToPainter', word);
  });

  socket.on('changeThePainter', function (id) {
    io.to(id).emit('changeThePainter');
    io.to(id).emit('enableChat');
  });

  socket.on('increaseWhoDraws', function (id) {
    io.to(id).emit('increaseWhoDraws');
  });

  socket.on('setupTimer', function (id) {
    io.to(id).emit('setupTimer')
  });

  socket.on('decreaseTimer', function ({timer: timer, id: id}) {
    timer = timer - 1;
    socket.emit('decreaseTimer', timer)
  });

  socket.on('removeHost', function (id) {
    io.to(id).emit('removeHost');
  })
});


module.exports = {
  app,
  server,
};
