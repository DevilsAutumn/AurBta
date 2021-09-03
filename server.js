const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUers } = require('./users');


const app = express();
const server = http.createServer(app)
const io = socket(server);


//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botname = 'Aurbta';

//runs when client connects
io.on('connection', socket => {

    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //welcome current user
        socket.emit('user-joined', formatMessage(botname, 'Welcome to AurBta!'));

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('user-joined', formatMessage(botname, `${user.username} has joined the chat!`));

        //send user and chat info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUers(user.room)
        });
    });


    //listen for chat message
    socket.on('chatMessage', (msg) => {

        const user = getCurrentUser(socket.id);

        socket.broadcast.to(user.room).emit('messageReceived', formatMessage(user.username, msg));
    });



    //runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {

            io.to(user.room).emit('leaving', formatMessage(botname, `${user.username} has left the chat`));


            //send user and chat info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUers(user.room)
            });
        };

    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server runnning on port ${PORT}`));