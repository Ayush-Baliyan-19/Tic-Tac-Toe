import { useSocket } from "@/context/socket";
import { useUsers, userType } from "@/context/usersContext";
import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import usePlayer from "@/hooks/usePlayer";

const Page: React.FC = () => {
  const { socket, roomId, userName, symbol } = useSocket();
  const { users, setUsers } = useUsers();
  const router = useRouter();
  const myId = userName;
  const { players, setPlayers } = usePlayer(myId, roomId);
  const isJoinedRef = useRef(false);
  const [symbolForPlayer, setSymbolForPlayer] = React.useState<string|any>('');
  useEffect(() => {
    if (!socket || myId.length <= 0) return;

    const handleUserConnected = (userId: string) => {
      console.log(`User connected in room with userId ${userId}`);
      
      setUsers((prev: userType[]) => [...prev, { id: userId, symbol: symbolForPlayer }]);
      setPlayers((prev: any) => ({
        ...prev,
        [userId]: { id: userId, symbol: symbolForPlayer},
      }));
    };

    const handleCurrentUsers = (users: any) => {
      console.log(users)
      const userMap: any = users.map((user:any) => ({ id: user.id, symbol: user.symbol }));
      setUsers(userMap);
    };

    socket.on("user-connected", handleUserConnected);
    socket.on("current-users", handleCurrentUsers);

    return () => {
      socket.off("user-connected", handleUserConnected);
      socket.off("current-users", handleCurrentUsers);
    };
  }, [myId, setPlayers, setUsers, socket, symbol, symbolForPlayer, users]);

  useEffect(() => {
    if (!socket || myId.length <= 0) return;
    if (isJoinedRef.current) return;
    isJoinedRef.current = true;
    console.log("Users are:",users)
    console.log("Symbol is :",symbol)
    socket.emit("join-room", roomId, userName, symbol,5);
  }, [socket, myId, roomId, userName, symbol, users]);

  useEffect(() => {
    if (!socket || myId.length <= 0 || roomId.length <= 0) return;
    if (users && users.length >= 2) {
      router.push(`/game/${roomId}`);
    }
  }, [myId, roomId, router, socket, users]);

  useEffect(() => {
    console.log(users);
  }, [users]);

  useEffect(() => {
    console.log(players);
  }, [players]);

  return (
    <div className="w-full h-full">
      Please Wait While Other Player Is Connecting... {roomId}
    </div>
  );
};

export default Page;
