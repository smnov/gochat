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
    <div className='container mx-auto p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center'>
          <img className='h-20 w-20 rounded-full object-fill mr-2' src='src.png' alt='User Avatar' />
          <div className='text-xl font-bold'>{user.username}</div>
        </div>
        <button className='px-4 py-2 rounded-md bg-blue text-white' onClick={logoutHandler}>
          Logout
        </button>
      </div>
      <div className='flex flex-col'>
        <div className='flex items-center my-4'>
          <input
            className='p-2 border rounded-md mr-4 focus:outline-none focus:border-blue'
            placeholder='Enter room name'
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <button
            type='submit'
            className='bg-blue text-white rounded-md p-2'
            onClick={submitHandler}
          >
            Create room
          </button>
        </div>
        <div>
          <div className='text-xl mb-2'>Available rooms:</div>
          {rooms.map((room, index) => (
            <div key={index} className='flex items-center my-4'>
              <div className='border rounded-md p-2 mr-2 w-1/2'>{room.name}</div>
              <button
                className='p-3 rounded-md bg-blue text-white'
                onClick={() => joinRoom(room.id)}
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>

  )
}
