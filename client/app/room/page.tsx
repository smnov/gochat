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
  createdAt: Date
  type: 'recv' | 'self'

}

export default function Room() {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const { conn } = useContext(WebsocketContext)
  const router = useRouter()
  const [users, setUsers] = useState<Array<{ username: string }>>([])
  const { user } = useContext(AuthContext)
  const [historyMessages, setHistoryMessages] = useState<Array<Message>>([])
  const [messages, setMessages] = useState<Array<Message>>([
  ])

  useEffect(() => {
    if (conn === null) {
      router.push('/')
      return
    }

    const roomId = conn.url.split('/')[5]

    async function getUsers() {
      try {
        const res = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const data: Array<Message> = await res.json()
        setMessages(data)
        setUsers(data)
      } catch (err) {
        console.error(err)
      }
    }

    async function getMessages() {
      try {
        const res = await fetch(`${API_URL}/ws/getMessages/${roomId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        })
        const data: Array<Message> = await res.json()
        setHistoryMessages(data)
      } catch (err) {
        console.error(err)
      }
    }
    getUsers()
    getMessages()
  }, [])

  useEffect(() => {
    if (conn === null) {
      router.push('/')
      return
    }

    if (textarea.current) {
      autosize(textarea.current)
    }

    conn.onmessage = (message) => {
      const m: Message = JSON.parse(message.data)
      if (m.content == 'A new user has joined the room') {
        setUsers([...users, { username: m.username }])
      }

      if (m.content == 'user left the chat') {
        const updatedUsers = users.filter((user) => user.username !== m.username);
        setUsers([...updatedUsers]);

        setMessages([...messages, m]);
        return
      }

      user?.username == m.username ? (m.type = 'self') : (m.type = 'recv')
      setMessages([...messages, m])
    }
    conn.onclose = () => { }
    conn.onerror = () => { }
    conn.onopen = () => { }
  }, [textarea, messages, conn, users])


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

  const backHandler = () => {
    if (conn !== null) {
      conn.close()
    }
    router.push('/')
  }
  return (
    <>
      <div className='flex flex-col min-h-screen bg-gray-100'>
        <div className='flex-shrink-0 flex items-center bg-blue-500 text-black p-4'>
          <button className='rounded-md p-2 bg-dark-primary text-white' onClick={backHandler}>
            Back
          </button>
          <div className='mx-10 text-lg font-semibold'>Users:</div>
          <div className='flex items-stretch'>
            {users.map((user, index) => (
              <div key={index} className='flex flex-col mx-2 mb-2'>
                <img
                  className='h-12 w-12 rounded-full object-cover mr-2 border border-solid border-black'
                  src='src.png'
                  alt='User Avatar'
                />
                <span className='font-medium'>{user.username}</span>
              </div>
            ))}
          </div>
        </div>
        <hr className='border-b-1 border-gray-200' />
        <div>
          <div className='flex-1 overflow-y-auto max-h-[calc(100vh-190px)]'>
            <ChatBody user={user} data={messages} historyMessages={historyMessages} />
          </div>
          <hr className='border-b-1 border-gray-200' />
          <div className='flex md:flex-row px-4 py-2 bg-gray-200 md:mx-4'>
            <textarea
              ref={textarea}
              className='w-full h-full focus:outline-none resize-none'
              placeholder='Enter your message here'
            />
            <button
              className='bg-dark-primary text-white rounded-md p-2 transition duration-300 ease-in-out hover:bg-blue-600'
              type='submit'
              onClick={sendMessage}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>

  )
}
