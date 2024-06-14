import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";

type UserType = {
  id: string;
  symbol: string;
  score: number;
};

type MoveType = {
  index: number;
  symbol: string;
};

const SocketHandler = (req: NextApiRequest, res:any) => {
  const rooms: { [key: string]: UserType[] } = {};
  const roomMoves: { [key: string]: string[] } = {};

  if (res.socket.server.io) {
    console.log("Socket already running");
  } else {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("New connection");

      socket.on(
        "join-room",
        (roomId: string, userId: string, symbol: string, size: number) => {
          console.log("New user joined room with roomId and userId: ", roomId, userId, symbol);
          if (!rooms[roomId]) {
            rooms[roomId] = [];
            roomMoves[roomId] = Array(size * size).fill("");
          }

          if (!rooms[roomId].some((user) => user.id === userId)) {
            rooms[roomId].push({ id: userId, symbol, score: 0 });
          }

          socket.join(roomId);

          // Notify all clients in the room about the current users
          io.to(roomId).emit("current-users", rooms[roomId]);
          io.to(roomId).emit("room-map", roomMoves[roomId], rooms[roomId][0].symbol);
        }
      );

      socket.on("make-move", (roomId: string, move: MoveType) => {
        if (roomMoves[roomId][move.index] === "") {
          roomMoves[roomId][move.index] = move.symbol;
          io.to(roomId).emit("move-made", move);

          // Check for a winner
          const winner = checkWinner(roomMoves[roomId], move.symbol);
          if (winner) {
            const winningUser = rooms[roomId].find((user) => user.symbol === move.symbol);
            if (winningUser) {
              winningUser.score += 10; // Add points for winning
              io.to(roomId).emit("game-won", winningUser);
            }
            // Reset roomMoves
            roomMoves[roomId] = Array(roomMoves[roomId].length).fill("");
          }

          io.to(roomId).emit("room-map", roomMoves[roomId], move.symbol === "X" ? "O" : "X");
        } else {
          socket.emit("invalid-move", "Cell already occupied");
        }
      });

      socket.on("use-powerup", (roomId: string, powerUp: string, index: number) => {
        switch (powerUp) {
          case "clear-cell":
            roomMoves[roomId][index] = "";
            io.to(roomId).emit("room-map", roomMoves[roomId], rooms[roomId][0].symbol);
            break;
          // Add more power-ups as needed
        }
      });

      socket.on("disconnect", () => {
        for (const roomId in rooms) {
          rooms[roomId] = rooms[roomId].filter((user: any) => user.id !== socket.id);
          io.to(roomId).emit("current-users", rooms[roomId]);
        }
      });
    });
  }
  res.end();
};

const checkWinner = (board: string[], symbol: string) => {
  const size = Math.sqrt(board.length);
  const winPatterns = [
    ...Array(size).fill(0).map((_, i) => Array(size).fill(0).map((_, j) => i * size + j)),
    ...Array(size).fill(0).map((_, i) => Array(size).fill(0).map((_, j) => j * size + i)),
    Array(size).fill(0).map((_, i) => i * (size + 1)),
    Array(size).fill(0).map((_, i) => (i + 1) * (size - 1))
  ];

  return winPatterns.some(pattern => pattern.every(index => board[index] === symbol));
};

export default SocketHandler;
