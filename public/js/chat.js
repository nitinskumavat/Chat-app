//client side socket 
const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML
const {username, room}=JSON.parse('{"'+decodeURI(location.search.substring(1)).replace(/&/g,'","').replace().replace(/=/g,'":"')+'"}')

socket.on('message',(message)=>{
    console.log(message.createdAt)
    const html=Mustache.render(messageTemplate,{
        'username':message.username,
       'message':message.text,
       'createdAt':moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage',(message)=>{
    const html=Mustache.render(locationMessageTemplate,{
        'username':message.username,
        'location':message.url,
        'createdAt':moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData',(data)=>{
    const html=Mustache.render(sidebarTemplate,{
        room:data.room,
        users:data.users,
    })
    document.querySelector('#sidebar').innerHTML=html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    const message=e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error)
            return console.log("Error!")
        console.log('Message sent')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation)
        return alert('Geolocation is not supported in your browser')
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        location.latitude=position.coords.latitude
        location.longitude=position.coords.longitude
        socket.emit('sendlocation',location,()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared!')
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
    alert(error)
    location.href='/'
    }
})