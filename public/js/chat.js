const socket = io()


//Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')
const $messageLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

//Logic for autoscrolling
const autoScroll = ()=>{
    //New message
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far has user scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight-newMessageHeight <= scrollOffset){ //checking if user scrolled before new message was added in
        $messages.scrollTop = $messages.scrollHeight
    }
}


socket.on('message',(message)=>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//Refactor location message
socket.on('locationMessage',(url)=>{
    console.log(url)
    const html = Mustache.render(locationTemplate,{
        username,
        url : url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

//Check for new users and list them or remove user and list online users
socket.on('roomData',({room, users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML = html
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disable messaging

    $messageFormButton.setAttribute('disabled','disabled')
    
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        //console.log(`Message was delivered, ${message}`) //Acknowledgment sent 
        //enable messaging
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }

        console.log('Message Deilvered')
    })
})

//Send Location Logic
$messageLocation.addEventListener('click',()=>{
   if(!navigator.geolocation){
     return alert('Geolcation is not supported by your browser')
   }

   $messageLocation.setAttribute('disabled','disabled')

   navigator.geolocation.getCurrentPosition((position)=>{
    const {latitude, longitude} = position.coords
     socket.emit('sendLocation',{
        latitude,
        longitude
     },()=>{
        console.log('Location Shared')
        $messageLocation.removeAttribute('disabled')
     })
   })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
    }
})


