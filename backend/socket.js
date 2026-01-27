const socketIo = (io) => {
    const connectedUsers = new Map();
    // listen for new socket connection
    io.on('connection', (socket) => {
        // get user from authentication
        const user = socket.handshake.auth.user;
        console.log("User connected ", user?.username);

        // Join handler Start
        socket.on('join room', (groupId) => {
            socket.join(groupId);

            connectedUsers.set(socket.id, { user, room: groupId });

            userInRoom = Array.from(connectedUsers.values())
                .filter((u) => u.room === groupId)
                .map((u) => u.user);

            io.in(groupId).emit('users in room', userInRoom);

            socket.to(groupId).emit('notification',{
                type:"USER_JOINED",
                message:`${user?.username} has joined`,
                user: user
            });
        });
        // Join handler end

        // leave handler start
        // when manually room is left by user
        socket.on('leave room', (groupId)=>{
            console.log(`${user?.username} is leaving the group `, groupId);
            socket.leave(groupId);
            if(connectedUsers.has(socket.id)){
                connectedUsers.delete(socket.id);
                socket.to(groupId).emit("user left ", user?._id);
            }
        })
        // leave handler end

        // send new messages start
        socket.on('new message', (message)=>{
            socket.to(message.groupId).emit('message recieved ', message);
        });
        // send new messages end

        // disconnect handler start
        // when user closes connection
        socket.on('disconnect',()=>{
            console.log(`${user?.username} has disconnected`);
            if(connectedUsers.has(socket.id)){
                const userData = connectedUsers.get(socket.id);
                socket.to(userData.room).emit("user left", user?._id);
                connectedUsers.delete(socket.id);
            }
        });
        // disconnect handler end

        // typing indicator
        socket.on('typing', ({groupId})=>{
            socket.to(groupId).emit('user typing', {username});
        });
        socket.on('stop typing', ({groupId, username})=>{
            socket.to(groupId).emit('user stop typing', {username: user?.username});
        });
        // typing indicator

    })
};

module.exports = socketIo;