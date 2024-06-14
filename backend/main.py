from fastapi import FastAPI, WebSocket
from socketio import AsyncServer, ASGIApp
import asyncio

app = FastAPI()

sio = AsyncServer(async_mode="asgi")
socketio_app = ASGIApp(sio)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print(f"Client connected: {websocket.client_addr}")

    # Handle incoming messages
    async for message in websocket.itertext():
        print(f"Received message: {message}")
        await websocket.send_text(f"You sent: {message}")

    # Handle disconnection gracefully
    print(f"Client disconnected: {websocket.client_addr}")

# Mount the Socket.IO app under the `/ws` path
app.mount("/ws", socketio_app)

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def disconnect(sid):
    print(f"Client {sid} disconnected")

# Add event handlers for specific events (optional)
@sio.event
async def custom_event(sid, data):
    # Process custom event data
    print(f"Received custom event: {data} from {sid}")
    await sio.emit('response_event', f"Received your custom event: {data}", room=sid)

if __name__ == "__main__":
    import uvicorn
    asyncio.run(uvicorn.run(app, host="0.0.0.0", port=8000))