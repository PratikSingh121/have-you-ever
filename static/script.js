// Connect to SocketIO server
var socket = io.connect('http://' + document.domain + ':' + location.port);

// Function to retrieve or generate a unique client ID
function getClientID() {
    var clientID = localStorage.getItem('clientID');
    if (!clientID) {
        clientID = generateUniqueID();
        localStorage.setItem('clientID', clientID);
    }
    return clientID;
}

// Ensure socket connection
socket.on('connect', function() {
    console.log('Connected to SocketIO server.');
    var clientID = getClientID();
    // Send client ID to the server
    socket.emit('set_client_id', { clientID: clientID });
});


// Handle user disconnect
window.onbeforeunload = function() {
    socket.emit('disconnect_user');
};

// Join room button click event
$('#joinRoomButton').click(function (event) {
    event.preventDefault();
    $('#roomForm').hide();
    $('#joinRoomForm').show();
});

// Create room button click event
$('#createRoomButton').click(function (event) {
    event.preventDefault();
    var playerName = $('#playerName').val();
    socket.emit('create_room', { name: playerName });
});

// Automatically join room when created
socket.on('auto_join_room', function (roomID) {
    var playerName = $('#playerName').val();
    // Update room ID in form
    $('#roomID').val(roomID);
    socket.emit('join_custom_room', { name: playerName, room_id: roomID });
    // Hide join room form
    $('#joinRoomForm').hide();
    // Store room ID in local storage
    localStorage.setItem('roomId', roomID);
});

// Join a room
$('#joinRoomForm').submit(function (event) {
    event.preventDefault();
    var playerName = $('#playerName').val();
    var roomID = $('#roomID').val();
    socket.emit('join_custom_room', { name: playerName, room_id: roomID });
    // Hide join room form
    $('#joinRoomForm').hide();
    // Store room ID in local storage
    localStorage.setItem('roomId', roomID);
});

// Display room ID when created
socket.on('room_created', function (roomID) {
    $('#roomIdDisplay').text('Room ID: ' + roomID);
});

// Update current users and display game section when joining room
socket.on('update_users', function (data) {
    var users = data.users;
    var roomID = data.roomID;
    console.log('Player name:', $('#playerName').val());
    console.log('Room ID:', roomID);
    $('#currentUsers').empty();
    $.each(users, function (id, name) {
        $('#currentUsers').append('<p>' + name + '</p>');
    });
    console.log('Joined room:', roomID);
    // Hide form and display game section
    // Update player name display
    var playerName = $('#playerName').val();
    $('#playerNameDisplay').text('Player: ' + playerName);
    $('#roomIDDisplay').text('Room ID: ' + roomID);
    $('#roomForm').hide();
    $('#gameSection').show();
});

// Handle game state update
socket.on('update_game_state', function (gameState) {
    $('#gameState').empty();
    $.each(gameState, function (sid, userState) {
        $('#gameState').append('<p>' + userState.name + ': ' + userState.response + '</p>');
    });
});

// Send response to server
function sendResponse(response) {
    var roomID = $('#roomID').val();
    socket.emit('response', { response: response, room_id: roomID });
}

// Check if room ID exists in local storage
if (localStorage.getItem('roomId')) {
    var roomId = localStorage.getItem('roomId');
    socket.emit('join_custom_room', { name: $('#playerName').val(), room_id: roomId });
} else {
    // If no room ID exists, show join room form
    $('#roomForm').show();
    $('#joinRoomButton').show();
}
