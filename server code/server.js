const http = require('http');
const express = require('express');
const app = express();
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const ROOT_DIR = '/public';

users = {}; //stores users connected


io.on('connection', (socket) => {

    socket.on('clientSays', function(data) {
        if (data.includes(':')) {
            let text = data.split(':')[1].trim();
            let group = data.split(':')[0].trim();
            let recipient = group.split(',');

            if (recipient.length > 1) {
                recipient.forEach(function (person) {
                    socket.to(users[person.trim()]).emit('serverPrivate', text, socket.username, person.trim(), 'privateRecieve');
                })
                socket.emit('serverPrivate', text, socket.username, group, 'privateSent');
            } else {
                socket.to(users[recipient[0].trim()]).emit('serverPrivate', text, socket.username, recipient[0].trim(), 'privateRecieve');
                socket.emit('serverPrivate', text, socket.username, recipient, 'privateSent');
            }


        } else {
            socket.to('connected').emit('serverSays', data, socket.username, 'recieved');
            socket.emit('serverSays', data, socket.username, 'sent');
        }

    })


    socket.on('clientConnect', function(data) {
        socket.username = data;
        users[data] = socket.id;
        socket.join('connected');
        console.log(data + ' has joined');
        io.to('connected').emit('serverConnect', data);
    })

    socket.on('disconnect', function() {
        if (socket.username != null) {
            console.log(socket.username + ' has disconnected');
            socket.leave('connected');
            delete users[socket.username];
            io.to('connected').emit('serverDisconnect', socket.username);
        }
    })
})

app.use(express.static(__dirname + ROOT_DIR));

app.use((req,res)=>{
    res.status(404).send('404: PAGE NOT FOUND');
})

server.listen(PORT, err => {
    if (err) console.log(err)
    else {
        console.log(`Server listening on port: ${PORT} CNTL-C to Quit`)
        console.log('To Test:')
        console.log('http://localhost:3000/index.html')
    }
})