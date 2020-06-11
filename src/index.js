const path =require('path')
const http=require('http')
const express=require('express')
const socketio= require('socket.io')
const {generateMessage}=require('./utils/messages')
const {generateLocationMessage}=require('./utils/messages')
const {addUser,getUser,removeUser,getUsersInRoom}=require('./utils/users')

const app=express()
const server= http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const publicDirectory=path.join(__dirname,'../public')

app.use(express.static(publicDirectory))


io.on('connection',(socket)=>{
    console.log("connected")

    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})
        console.log(getUsersInRoom(user.room))
        if(error){
            callback(error);
            return
        }

        socket.join(room)

        socket.emit("message",generateMessage('Admin','Welcome!'));
        socket.broadcast.to(user.room).emit("message",generateMessage('Admin',`${user.username} has joined`))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendlocation',(location,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
       const user= removeUser(socket.id)
       if(user){
        console.log(getUsersInRoom(user.room))
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
       }
    })
})

server.listen(port,()=>{
    console.log('Server is running on port '+port)
})