import { Message } from '@/app/room/page'
import { UserInfo } from '@/modules/AuthContextProvider'
import React from 'react'

interface ChatBodyProps {
  user: UserInfo
  data: Message[]
  historyMessages: Message[]
}

function ChatBody({ user, data, historyMessages }: ChatBodyProps) {
  return (
    <>
      {historyMessages.map((message: Message, index: number) => {
        if (message.content !== 'A new user has joined the room' && message.content !== 'user left the chat') {
          console.log(message.type)
          if (user.username == message.username) {
            return (
              <div key={index} className='flex flex-col mt-2 w-full text-right justify-end'>
                <div className='text-sm'>{message.username}</div>
                <div>
                  <div className='bg-blue text-white px-4 py-1 rounded-md inline-block mt-1 max-w-56'>{message.content}</div>
                </div>
              </div>
            )
          } else {
            return (
              <div key={index} className='flex flex-col w-full text-left justify-start'>
                <div className='text-sm'>{message.username}</div>
                <div>
                  <div className='bg-darkgrey text-white px-4 py-1 rounded-md inline-block mt-1 max-w-56'>{message.content}</div>
                </div>
              </div>
            )
          }
        }
      })}
      {data.map((message: Message, index: number) => {
        if (message.type == 'self') {
          return (
            <div key={index} className='flex flex-col mt-2 w-full text-right justify-end'>
              <div className='text-sm'>{message.username}</div>
              <div>
                <div className='bg-blue text-white px-4 py-1 rounded-md inline-block mt-1 max-w-56'>{message.content}</div>
              </div>
            </div>
          )
        } else {
          return (
            <div key={index} className='flex flex-col w-full text-left justify-start'>
              <div className='text-sm'>{message.username}</div>
              <div>
                <div className='bg-darkgrey text-white px-4 py-1 rounded-md inline-block mt-1 max-w-56'>{message.content}</div>
              </div>
            </div>
          )
        }
      })}
    </>
  )
}

export default ChatBody
