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
        console.log('data: ', data)
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
        const deleteUser = users.filter((user) => user.username != m.username)
        setUsers([...deleteUser])
        setMessages([...messages, m])
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
  return (
    <>
      <div className='flex flex-col h-screen'>
        <div className='flex-shrink-0 bg-gray-200 p-4'>
          <button
            className='bg-blue text-white rounded-md p-2'
            onClick={() => router.push('/')}
          >
            Back
          </button>
        </div>
        <div className='flex-1 overflow-y-auto'>
          <ChatBody user={user} data={messages} historyMessages={historyMessages} />
        </div>
        <div className='fixed bottom-0 mt-4 w-full'>
          <div className='flex md:flex-row px-4 py-2 bg-gray-200 md:mx-4 rounded-md'>
            <textarea
              ref={textarea}
              className='border border-gray-400 rounded-md m-2 w-full h-10 p-2 focus:outline-none'
              placeholder='Enter your message here'
              style={{ resize: 'none' }}
            />
            <button
              className='bg-blue text-white rounded-md p-2'
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
