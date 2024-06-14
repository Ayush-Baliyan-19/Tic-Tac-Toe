import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  userName: string;
  setUserName: (name: string) => void;
  roomId: string;
  setRoomID: (id: string) => void;
  symbol: string;
  setSymbol: (symbol: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const useSocket = (): Socket | any => {
  return useContext(SocketContext)!; // Use non-null assertion after type check
};

export const SocketProvider = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userName, setUserName] = useState("");
  const [roomId, setRoomID] = useState("");
  const [symbol, setSymbol] = useState('O');

  useEffect(() => {
    const newSocket = io("https://tic-tac-toe-gamma-gilt.vercel.app/",{
    upgrade: true,
    });
    setSocket(newSocket);

    // Clean up function for disconnecting socket when unmounting
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    const handleConnectError = async (err: Error) => {
      console.error("Connection Error:", err);
      console.log("Connection Error, attempting reconnection")
      // Handle the error or attempt reconnection here
      await fetch("/api/socket");
    };

    if (socket) {
      socket.on("connect_error", handleConnectError);
    }

    return () => {
      if (socket) {
        socket.off("connect_error", handleConnectError);
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, userName, setUserName,roomId,setRoomID,symbol,setSymbol }}>
      {children}
    </SocketContext.Provider>
  );
};
