'use client'
import { API_URL, WEBSOCKET_URL } from '@/constants'
import { AuthContext } from '@/modules/AuthContextProvider'
import { WebsocketContext } from '@/modules/WSProvider'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function HomePage() {
  const [rooms, setRooms] = useState<{ id: string, name: string }[]>([])
  const [roomName, setRoomName] = useState('')
  const { user } = useContext(AuthContext)
  const { setConn } = useContext(WebsocketContext)

  const router = useRouter()

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    try {
      setRoomName('')
      const res = await fetch(`${API_URL}/ws/createRoom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: uuidv4(),
          name: roomName,
        }),
      })
      if (res.ok) {
        getRooms()
      }
    } catch (err) {
      console.error(err)
    }

  }


  const logoutHandler = (e: React.SyntheticEvent) => {
    e.preventDefault()
    window.localStorage.clear()
    router.push('/login')
    return
  }

  const getRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/ws/getRooms`, {
        method: 'GET',
      })

      const data = await res.json()
      if (res.ok) {
        console.log(data)
        setRooms(data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const joinRoom = async (roomId: string) => {
    const ws = new WebSocket(`${WEBSOCKET_URL}/ws/joinRoom/${roomId}?userId=${user.id}&username=${user.username}`)
    if (ws.OPEN) {
      setConn(ws)
      router.push('/room')
      return
    }
  }


  useEffect(() => {
    getRooms()
  }, [])
  return (
    <div className='my-8 px-4 md:mx-32 w-full h-full'>
      <div className='flex flex-row justify-center'>
        <div>{user.username}</div>
        <br />
        <button
          className='mx-4 px-4 py-2 rounded-md bg-blue text-white'
          onClick={logoutHandler}

        >Logout</button>
      </div>
      <div>
        <div className='flex flex-col'>
          <div className='my-4'>
            <input
              className='p-2 border border-grey rounded-md'
              placeholder='room name'
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <button type='submit' className='bg-blue border text-white rounded-md p-2 md:ml-4' onClick={submitHandler}>Create room</button>
          </div>
          <div>
            <div className='text-xl'>Available rooms:</div>
            <div>
              {rooms.map((room, index) => (
                <div key={index} className='flex flex-row my-4'>
                  <div className='border border-grey rounded-md p-2 w-20'>
                    <div>{room.name}</div>
                  </div>
                  <div>
                    <button
                      className='p-3 mx-4 rounded-md bg-blue text-white'
                      onClick={() => joinRoom(room.id)}>join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
