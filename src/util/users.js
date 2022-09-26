const users = []

//Adds user to chat room and validates name and if user exists or if name is taken
const addUser = ({id, username, room}) =>{
    //clean data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //Validate Data
    if(!username||!room){
        return{
            error:'Username and room are required'
        }
    }

    //Check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    //Validate username
    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //Store user
    const user = {id, username, room}
    users.push(user)
    return {user}
}

//Removes A user from chat
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id===id)

    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

//Gets a specfic user
const getUser = (id)=>{
    return  users.find(user=>user.id===id)

}

//Gets all users in a specfic room
const getUsersInRoom = (room)=>{
   return users.filter(user=>user.room === room.trim().toLowerCase())
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}