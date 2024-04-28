var socket = io.connect('http://' + document.domain + ':' + location.port);

// Ensure socket connection
socket.on('connect', function() {
    console.log('Connected to SocketIO server.');
});

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
    // update room ID in form
    $('#roomID').val(roomID);
    socket.emit('join_custom_room', { name: playerName, room_id: roomID });
});

// Join a room
$('#joinRoomForm').submit(function (event) {
    event.preventDefault();
    var playerName = $('#playerName').val();
    var roomID = $('#roomID').val();
    socket.emit('join_custom_room', { name: playerName, room_id: roomID });
});

// Display room ID when created
socket.on('room_created', function (roomID) {
    $('#roomIdDisplay').text('Room ID: ' + roomID);
});

// Update current users and display game section when joining room
socket.on('update_users', function (users, roomID) {
    $('#currentUsers').empty();
    $.each(users, function (id, name) {
        $('#currentUsers').append('<p>' + name + '</p>');
    });
    console.log('Joined room:', roomID);
    // Hide form and display game section
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
// Send response to server
function sendResponse(response) {
    var roomID = $('#roomID').val();
    socket.emit('response', { response: response, room_id: roomID });
}
