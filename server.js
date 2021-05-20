
const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const formatMessage = require('./utils/message');
const {userJoin,getUser,userLeave,getRoomUsers} = require('./utils/users');
const chatBot = 'Chit Chat Bot'

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//set static folder 
app.use(express.static(path.join(__dirname,'public')))

//Run when client connects
io.on('connection', socket => {
    console.log('New WS Connection...')


    socket.on('joinRoom',({username,room}) => {

        console.log(username,'has joined' , room)
        const user = userJoin(socket.id,username,room);

        socket.join(user.room); 

        socket.emit('message',formatMessage(chatBot,'Hello Welcome dost..!'))

        socket.broadcast
            .to(user.room)
            .emit('message',formatMessage(chatBot,`${user.username} has joined the chat`));

        io.to(user.room).emit('roomUsers',{
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });
    

    

    //listen for chatMessage
    socket.on('chatMessage',(msg) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('message',formatMessage(user.username,msg));
    })

    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user){
            socket.broadcast.
                to(user.room).
                emit('message',formatMessage(chatBot, `${user.username} has left the chat`));

            io.to(user.room).emit('roomUsers',{
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
        
    })
})

const PORT = 3000 || process.env.PORT

server.listen(PORT,()=> console.log(`Server running on PORT ${PORT}`))

