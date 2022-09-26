//Require path

const path = require('path')

//Require express
const express = require('express')

//Require Http
const http = require('http')

//Require socket.io
const socketio = require('socket.io')

//Require bad words filter
const Filter = require('bad-words')

//Get argument function for time
const {generateMessage, generateLocationMessage} = require('./util/messages')

//Get user functions
const {addUser,removeUser,getUser,getUsersInRoom} = require('./util/users')

//App
const app = express();
//creating a server
const server = http.createServer(app)
//io
const io = socketio(server); //configuring socket.io to work with a server, now server supports websockets

//port
const port = process.env.PORT || 3000

//link to public directory
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



//Listening on client connection
io.on('connection',(socket)=>{
    console.log('New Websocket Connection')
 

    // socket.emit('message', generateMessage('Welcome!'))

    // //Broadcasting 
    // socket.broadcast.emit('message',generateMessage('A new user has joined!')) //client exists thus the server presents a message that they joined the chat, but message doesn't get seen by them

    //Listenng for users joining rooms
    socket.on('join',({username,room},callback)=>{

        const {error, user} = addUser({id: socket.id, username,room})

        if(error){
            return callback(error)
        }


        //To join a given chat room, specfically emits messages or events to specfic room
        socket.join(user.room)
        //io.to(room).emit -> send to all users in a specfic room
        //socket.broadcast.to(room).emit -> send to everyone except to user who sent it within a specfic room
        
        socket.emit('message', generateMessage('Admin','Welcome!'))

        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the room `))

        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    //Listening to messages being sent
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

     //Sending Location from one client to all clients
    socket.on('sendLocation',(location,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback();
    })

    //Disconnecting a client
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the chat`)) //since client doesn't exist after leaving we send message to everyone else
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

    })
 
   
})

//listening on a server
server.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})

