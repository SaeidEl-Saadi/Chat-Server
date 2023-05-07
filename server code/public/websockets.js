const socket = io('http://' + window.document.location.host);

socket.on('serverSays', function(message, username, status) {
    let msgDiv = document.createElement('div');
    msgDiv.setAttribute('id', status);
    msgDiv.textContent = username + ': ' + message;
    document.getElementById('messages').appendChild(msgDiv)
})

socket.on('serverConnect', function(user) {
    let msgDiv = document.createElement('div');
    msgDiv.setAttribute('id', 'joinOrLeave');
    msgDiv.textContent = `${user} has joined.`;
    document.getElementById('messages').appendChild(msgDiv)
})

socket.on('serverDisconnect', function(user) {
    let msgDiv = document.createElement('div');
    msgDiv.setAttribute('id', 'joinOrLeave');
    msgDiv.textContent = `${user} has left.`;
    document.getElementById('messages').appendChild(msgDiv)
})

socket.on('serverPrivate', function(message, username, recipient, status) {
    let msgDiv = document.createElement('div');
    msgDiv.setAttribute('id', 'private');
    if (status === 'privateRecieve') {
        msgDiv.textContent = 'From ' + username + ': ' + message;
    } else if (status === 'privateSent') {
        msgDiv.textContent = 'To ' + recipient + ': ' + message;
    }
    document.getElementById('messages').appendChild(msgDiv)
})



function sendMessage() {
    let message = document.getElementById('msgBox').value.trim()
    if( message === '') return;     //do nothing
    socket.emit('clientSays', message);
    document.getElementById('msgBox').value = '';
}

function enterUsername() {
    let username = document.getElementById('username').value.trim()
    if (username === '') return;    //do nothing
    
    if (/^[a-zA-Z0-9]+$/.test(username) && isNaN(username.charAt(0))) {
        socket.emit('clientConnect', username);
        document.getElementById('userConnection').innerHTML = `Connected as: ${username}`;
        document.getElementById('msgBox').readOnly = false;
        document.getElementById('msgBox').placeholder = 'Send a message';
    } else {
        document.getElementById('username').value = '';
    }
}

  
function handleKeyDown(event) {
    const ENTER_KEY = 13 //keycode for enter key
    if (event.keyCode === ENTER_KEY) {
        if (document.getElementById('msgBox').readOnly === true) {
            enterUsername();
            return false;
        } else {
            sendMessage()
            return false
        }
    }
}

function clearMessages() {
    document.getElementById('messages').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', function() {

    //add listener to buttons
    document.getElementById('send_button').addEventListener('click', sendMessage);
    document.getElementById('username_button').addEventListener('click', enterUsername);
    document.getElementById('clear_button').addEventListener('click', clearMessages);

    //add keyboard handler for the document
    document.addEventListener('keydown', handleKeyDown);
     
})