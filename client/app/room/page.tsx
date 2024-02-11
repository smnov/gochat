'use client'
import ChatBody from '@/components/ChatBody'
import { API_URL, WEBSOCKET_URL } from '@/constants'
import { AuthContext } from '@/modules/AuthContextProvider'
import { WebsocketContext } from '@/modules/WSProvider'
import autosize from 'autosize'
import { useRouter } from 'next/navigation'
import React, { useContext, useEffect, useRef, useState } from 'react'

export type Message = {

  content: string
  client_id: string
  username: string
  roomId: string
  type: 'recv' | 'self'
}

export default function Room() {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const { conn } = useContext(WebsocketContext)
  const router = useRouter()
  const [users, setUsers] = useState<Array<{ username: string }>>([])
  const { user } = useContext(AuthContext)
  const [message, setMessage] = useState<Array<Message>>([
  ])

  useEffect(() => {
    if (conn === null) {
      router.push('/')
      return
    }

    const roomId = conn.url.split('/')[5]
    async function getUsers() {
      try {
        const res = await fetch(`${API_URL}/ws/getUsers/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const data = await res.json()
        console.log(JSON.stringify(data))
        setUsers(data)
      } catch (err) {
        console.error(err)
      }
    }
    getUsers()
  }, [])

  useEffect(() => {

    if (textarea.current) {
      autosize(textarea.current)
    }
    if (conn === null) {
      router.push('/')
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data)
      if (m.content == 'A new user has joined the room') {
        setUsers([...users, { username: m.username }])
      }

      if (m.content == 'user left the chat') {
        const deleteUser = users.filter((user) => user.username != m.username)
        setUsers([...deleteUser])
        setMessage([...message, m])
        return
      }

      user?.username == m.username ? (m.type = 'self') : (m.type = 'recv')
      setMessage([...message, m])
    }
  }, [textarea, message, conn, users])


  const sendMessage = () => {
    if (!textarea.current?.value) return
    // check connection
    if (conn === null) {
      router.push('/')
      return
    }

    conn.send(textarea.current.value)
    textarea.current.value = ''
  }
  return (
    <div className='bg-grey'>
      <div>
        <ChatBody data={message} />
      </div>
      <div className='flex flex-col w-full'>
        <div className='fixed bottom-0 mt-4 w-full'>
          <div className='flex md:flex-row px-4 py-2 bg-grey md:mx-4 rounded-md'>

            <textarea ref={textarea} className='border border-grey rounded-md m-2 w-full h-10 p-2 focus:outline-none'
              placeholder='enter your message here'
              style={{ resize: 'none' }}
            />
            <button className='bg-blue text-white rounded-md p-2' onClick={sendMessage}>send</button>
          </div>
        </div>
      </div>
    </div>
  )
}
