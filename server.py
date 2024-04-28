import uuid
from flask import Flask, render_template, request
from flask_socketio import SocketIO, join_room, leave_room, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "vnkdjnfjknfl1232#"
socketio = SocketIO(app)

rooms = {}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/rooms/<uuid:room_id>")
def room(room_id):
    return render_template("room.html", room_id=room_id)


@socketio.on("connect")
def connect():
    print("Client connected:", request.sid)


@socketio.on("disconnect")
def disconnect():
    print("Client disconnected:", request.sid)
    for room_id, room in rooms.items():
        if request.sid in room["users"]:
            room["users"].remove(request.sid)
            emit("update_users", room["users"], room=room_id)
            print("User disconnected:", request.sid)
            print("Current users in room:", room["users"])
        break


@socketio.on("create_room")
def create_room(data):
    # data -> {name: "playerName"}
    room_id = str(uuid.uuid4())
    print("Room created:", room_id)
    rooms[room_id] = {"users": [], "game_state": {}}
    emit("room_created", room_id)
    emit("auto_join_room", room_id, room=request.sid)


@socketio.on("join_custom_room")
def join_custom_room(data):
    # data -> {name: "playerName", room_id: "roomID"}
    room_id = data["room_id"]
    user_name = data["name"]
    join_room(room_id)
    rooms[room_id]["users"].append(request.sid)
    rooms[room_id]["game_state"][request.sid] = {"name": user_name, "response": None}
    emit("update_users", rooms[room_id]["users"], room=room_id)
    emit("update_game_state", rooms[room_id]["game_state"], room=room_id)
    print("User joined room:", room_id)
    print("Current users in room:", rooms[room_id]["users"])
    print("Game state:", rooms[room_id]["game_state"])


@socketio.on("sign_in")
def sign_in(data):
    room_id = data["room_id"]
    user_name = data["name"]
    rooms[room_id]["game_state"][request.sid] = {"name": user_name, "response": None}
    emit("update_game_state", rooms[room_id]["game_state"], room=room_id)
    print("User signed in:", user_name)


@socketio.on("response")
def response(data):
    room_id = data["room_id"]
    response = data["response"]
    rooms[room_id]["game_state"][request.sid]["response"] = response
    emit("update_game_state", rooms[room_id]["game_state"], room=room_id)
    print("Response received:", response)


if __name__ == "__main__":
    socketio.run(app, debug=True)
