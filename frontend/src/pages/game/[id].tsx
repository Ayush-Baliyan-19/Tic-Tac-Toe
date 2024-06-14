"use client"
import Grid from '../components/grid/grid'
import React, { useState } from 'react'
import { useEffect } from 'react'
import {useSocket} from '@/context/socket';
const Page = () => {
  const {socket,userName} = useSocket();
  const [users, setUsers] = useState([]);
  const myId = userName;
  useEffect(() => {
    if (!socket || myId.length <= 0) return;
    const handleUserConnected = (newUser:string) => {
      console.log(`user connected in room with userId ${newUser}`);
        setUsers((prev) => ({
          ...prev,
          newUser
        }))
      ;
    };
    socket.on("user-connected", handleUserConnected);

    return () => {
      socket.off("user-connected", handleUserConnected);
    };
  }, [myId, socket]);
  return (
    <div className='h-screen w-screen py-5'>
        {/* <div className="headings flex justify-center items-center">
            <h1 className='font-black text-5xl'>Tic Tac Toe</h1>
        </div> */}
        <div className='Grid flex justify-center items-center'>
        <Grid n={5}/>
        </div>
    </div>
  )
}

export default Page