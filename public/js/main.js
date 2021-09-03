const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const mssg = document.getElementById('msg');

var audio = new Audio('notification.mp3');
//get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

//join chatroom
socket.emit('joinRoom', { username, room });

//Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})

///Message from server

socket.on('user-joined', message => {
    userJoined(message);

});

socket.on('leaving', message => {
    userLeft(message);

});

socket.on('messageReceived', message => {
    console.log(message)
    messageReceive(message);

    //scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//Message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message text
    const msg = mssg.value;

    messageSend(msg);
    //emit message to server
    
    socket.emit('chatMessage', msg);

    //clear input
    mssg.value = '';
    mssg.focus();
})



function messageSend(message){
    
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('message-right');
    div.innerHTML = `<p class="meta">You : </p>
    <p class="text">
      ${message}
    </p>`;
    document.querySelector('.chat-messages').append(div);  

}


//output message to DOM
function messageReceive(message) {
    audio.play();
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('message-left');
    div.innerHTML = `<p class="meta">${message.username}:</p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').append(div);

}




function userLeft(message) {

    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('message-center');
    div.innerHTML = `
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').append(div);

}

function userJoined(message) {

    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add('message-center');
    div.innerHTML = `
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').append(div);

}

//add room name to dom
function outputRoomName(room) {
    roomName.innerText = room;
}

//add users to dom
function outputUsers(users) {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}