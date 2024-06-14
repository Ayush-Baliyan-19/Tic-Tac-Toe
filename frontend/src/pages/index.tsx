"use client";
import Image from "next/image";
import HomePageImg from "./Images/HomePageImg.svg";
import HomeButtonCircle from "./Images/HomeButtonCircle.svg";
import HomeButtonCross from "./Images/HomeButtonCross.svg";
import { Button } from "@/components/ui/button";
import { Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { use, useEffect, useState } from "react";
import { useUser as useUserFromClerk } from "@clerk/nextjs";
import { useSocket } from "@/context/socket";

const poppins = Poppins({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

export default function Home() {
  const Router = useRouter();
  const { user, isSignedIn } = useUserFromClerk();
  const [selectedSymbol, setSelectedSymbol] = useState<'X' | 'O'>('O');
  const { roomId, setRoomID, setUserName, socket,symbol,setSymbol } = useSocket();
  const userId: any = user?.id;

  useEffect(() => {
    setUserName(userId);
  }, [setUserName, userId]);

  const handlePlayGame = () => {
    if (!isSignedIn && !userId) {
      console.log("Is signed in: ",isSignedIn)
      console.log("Is user: ",user)
      console.log("User not logged in");
      document.getElementById("NotUserModal")?.click();
      return;
    }
    const gameId = v4().split("-")[0];
    setRoomID(gameId);
    // socket.emit('join-room', gameId, userId);
    // socket.emit('symbol-choice', gameId, userId, selectedSymbol);
    Router.push(`/game/waiting-lobby`);
    navigator.clipboard.writeText(gameId);
  };
  
  const handleJoinRoom = () => {
    if (!isSignedIn && !userId) {
      console.log("User not logged in");
      document.getElementById("NotUserModal")?.click();
      return;
    }
    document.getElementById("JoinGameModal")?.click();
  };

  return (
    <main className="h-screen w-screen flex justify-center items-center ">
      <NotUserModal />
      <JoinGameModal {...{ roomId, setRoomID }} />
      <div className="left-side flex justify-center items-center w-1/2 h-full">
        <Image
          src={HomePageImg}
          alt="HomePageImg"
          width={100}
          height={200}
          className=" w-80 aspect-square"
        />
      </div>
      <div className="divider-vertical w-[4px] h-80 rounded-3xl bg-white"></div>
      <div className={`right-side w-1/2 justify-center items-center flex flex-col ${poppins.className}`}>
        <div className="flex justify-center items-start flex-col">
          <h1 className="font-black text-6xl">Tic Tac Toe</h1>
          <p className=" text-left text-sm pt-1">A new way to play the game</p>
          <div className="playerSymbols flex justify-center items-center py-10">
            <div className="player1-Left text-sm flex justify-center items-start flex-col gap-3">
              <p>Player Symbol</p>
              <div className="PlayerSelectionButtons flex justify-center items-center gap-4">
                <button onClick={() => {setSelectedSymbol('O')
                  setSymbol('O')
                }}>
                  <Image
                    src={HomeButtonCircle}
                    alt="HomeButtonCircle"
                    width={100}
                    height={100}
                    className={`w-20 ${selectedSymbol === 'O' && "border border-white rounded-lg"}`}
                  />
                </button>
                <button onClick={() => {setSelectedSymbol('X') 
                setSymbol('X')}}>
                  <Image
                    src={HomeButtonCross}
                    alt="HomeButtonCross"
                    width={100}
                    height={100}
                    className={`w-20 ${selectedSymbol === 'X' && "border border-white rounded-lg"}`}
                  />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-5">
            <Button variant={"newButton"} onClick={handlePlayGame}>Start New Game</Button>
            <Button className="hover:bg-transparent" variant={"ghost"} onClick={handleJoinRoom}>Join An Existing Game</Button>
          </div>
        </div>
      </div>
    </main>
  );
}

const NotUserModal = () => {
  const Router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger id="NotUserModal" className="hidden">Open</AlertDialogTrigger>
      <AlertDialogContent className=" bg-darkbBlack">
        <AlertDialogHeader>
          <AlertDialogTitle>You are Not Logged In</AlertDialogTitle>
          <AlertDialogDescription>You need to login to play games</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => Router.push("/sign-in")}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const JoinGameModal = ({ roomId, setRoomID }: { roomId: string; setRoomID: (roomID: string) => void; }) => {
  const Router = useRouter();
  return (
    <AlertDialog>
      <AlertDialogTrigger id="JoinGameModal" className="hidden">Open</AlertDialogTrigger>
      <AlertDialogContent className=" bg-darkbBlack">
        <AlertDialogHeader>
          <AlertDialogTitle>Room Id:</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Input onChange={(e) => setRoomID(e.target.value)} value={roomId} />
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => Router.push(`/game/waiting-lobby`)}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};