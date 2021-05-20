

const chatform = document.getElementById('chat-form');
const chatMessage = document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
});
const socket = io();

//tell server that user has joined room
socket.emit('joinRoom',{username,room})


//get room and users of that room
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
})

console.log(username,room)


socket.on('message',msg => {
    console.log(msg);
    outputMessage(msg);
    chatMessage.scrollTop = chatMessage.scrollHeight;
})

//Message submit
chatform.addEventListener('submit',e=>{
    e.preventDefault();


    const message= e.target.elements.msg.value;

    //Emit message to server
    socket.emit('chatMessage',message);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

})

function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div);
}

//add room name to html
function outputRoomName(roome){
    roomName.innerText = roome;
}


//add users to html
function outputUsers(users){
    userList.innerHTML = `
        ${users.map(user =>  `<li> ${user.username}</li>`).join('')}
    `;
}