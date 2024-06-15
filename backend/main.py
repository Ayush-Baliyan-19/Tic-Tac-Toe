import socket
from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from socketio import AsyncServer, ASGIApp
from starlette.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI()

# Add CORS middleware
# app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

sio = AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socketio_app = ASGIApp(sio)


@app.get("/hello")
def hello():
    return {"Hello": "World"}

@app.get('/api/socket')
async def get_socketio_endpoint():
    return socketio_app

app.mount("/", socketio_app)


rooms = {}
room_moves = {}



@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")
    for room_id in rooms:
        rooms[room_id] = [user for user in rooms[room_id] if user['id'] != sid]
        await sio.emit("current-users", rooms[room_id], room=room_id)

@sio.on('join-room')
async def join_room(sid, room_id, user_id, symbol, size):
    print(f"New user joined room with roomId and userId: {room_id}, {user_id}, {symbol}")
    if room_id not in rooms:
        rooms[room_id] = []
        room_moves[room_id] = [""] * (size * size)

    if not any(user['id'] == user_id for user in rooms[room_id]):
        rooms[room_id].append({"id": user_id, "symbol": symbol, "score": 0})

    print(rooms[room_id])
    await sio.save_session(sid, {'room': room_id, 'user': user_id})
    await sio.emit("current-users", rooms[room_id], room=room_id)
    await sio.emit("room-map", room_moves[room_id], rooms[room_id][0]['symbol'], room=room_id)

@sio.on('make-move')
async def make_move(sid, room_id, move):
    if room_moves[room_id][move['index']] == "":
        room_moves[room_id][move['index']] = move['symbol']
        await sio.emit("move-made", move, room=room_id)

        if check_winner(room_moves[room_id], move['symbol']):
            winning_user = next(user for user in rooms[room_id] if user['symbol'] == move['symbol'])
            if winning_user:
                winning_user['score'] += 10
                await sio.emit("game-won", winning_user, room=room_id)
            room_moves[room_id] = [""] * len(room_moves[room_id])

        await sio.emit("room-map", room_moves[room_id], "O" if move['symbol'] == "X" else "X", room=room_id)
    else:
        await sio.emit("invalid-move", "Cell already occupied", to=sid)

@sio.event
async def use_powerup(sid, room_id, powerup, index):
    if powerup == "clear-cell":
        room_moves[room_id][index] = ""
        await sio.emit("room-map", room_moves[room_id], rooms[room_id][0]['symbol'], room=room_id)
    # Add more power-ups as needed

def check_winner(board, symbol):
    size = int(len(board) ** 0.5)
    win_patterns = [
        [i * size + j for j in range(size)] for i in range(size) ] + [
        [j * size + i for j in range(size)] for i in range(size) ] + [
        [i * (size + 1) for i in range(size)],
        [(i + 1) * (size - 1) for i in range(size)] ]

    return any(all(board[index] == symbol for index in pattern) for pattern in win_patterns)

if __name__ == "__main__":
    import uvicorn
    asyncio.run(uvicorn.run(app, port=8000))
