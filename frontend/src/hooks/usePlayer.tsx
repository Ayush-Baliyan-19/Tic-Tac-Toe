import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSocket } from '@/context/socket'
const usePlayer = (myId:string,roomId:string) => {
    const {socket} = useSocket()
    const [players, setPlayers] = useState([])
    const router = useRouter()
    const playersCopy:any = {...players}

    const playerHighlighted:any = playersCopy[myId]
    delete playersCopy[myId]

    const leaveMatch = () => {
        socket.emit('user-leave', myId, roomId)
        console.log("leaving room", roomId)
        router.push('/')
    }

    return { players, setPlayers, playerHighlighted, leaveMatch }
}

export default usePlayer;