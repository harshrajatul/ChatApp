const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

let users = new Map();

const server = http.createServer(app);
const io = socketIO(server);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

let socketID;

io.on('connection', (socket) => {
    socketID = socket.id;

    //
    //
    // Handle private chat initiation
    socket.on('initiateChat', (data) => {
      const { recipientId } = data;
      
      // Notify the recipient to initiate a private chat
      io.to(recipientId).emit('chatRequest', { senderId: socket.id });
      console.log("initiatechat: rid"+ recipientId+" senderId: "+socket.id);
    });

    // Handle private chat messages
    socket.on('privateChatMessage', (data) => {
      const { recipientId, message } = data;


      // Send the private message to the recipient
      io.to(recipientId).emit('privateChatMessage', {
        senderId: socket.id,
        message,
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected: ', socket.id);
    });
    //
    //
});

app.post('/chat-api', (req, res) => {
    const user_name = req.body.username;
    res.sendFile(path.join(__dirname, '/chat.html'));

    users.set(user_name, socketID);
    console.log(users);
});

app.get('/getData', (req, res) => {
  const mapObject = {};
  users.forEach((value, key) => {
  mapObject[key] = value;
  });

  res.json({ data: mapObject });

});


const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
