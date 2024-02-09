import { API_URL } from '@/constants'
import React, { useEffect, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function HomePage() {
  const [rooms, setRooms] = useState<{ id: string, name: string }[]>([])

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
      console.log(err)
    }

  }

  const [roomName, setRoomName] = useState('')

  const getRooms = async () => {
    try {
      const res = await fetch(`${API_URL}/ws/getRooms`, {
        method: 'GET',
      })

      const data = await res.json()
      if (res.ok) {
        setRooms(data)
      }
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getRooms()
  }, [])
  return (
    <div className='my-8 px-4 md:mx-32 w-full h-full'>
      <div className='flex justify-center mt-3 p-5'>
        <input type='text'
          className='border border-grey p-2 rounded-md focus:outline-none focus:border-blue'
          placeholder='room name'
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
        />
        <button type='submit' className='bg-blue border text-white rounded-md p-2 md:ml-4' onClick={submitHandler}>Create room</button>
        <div>
          <div>Available rooms</div>
          <div>
            {rooms.map((room, index) => (

              <div key={index}>
                <div>
                  <div>
                    room
                  </div>
                  <div>{room.name}</div>
                </div>
                <div>
                  <button>join</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
