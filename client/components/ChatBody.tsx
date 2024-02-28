import { Message } from '@/app/room/page'
import { UserInfo } from '@/modules/AuthContextProvider'
import React from 'react'

interface ChatBodyProps {
  user: UserInfo
  data: Message[]
  historyMessages: Message[]
}

function formatTimestamp(timestamp: Date) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  return `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
}

function ChatBody({ user, data, historyMessages }: ChatBodyProps) {
  return (
    <div style={{ position: 'relative', overflowY: 'auto', maxHeight: '100vh' }}>
      <img
        src='background.jpg'
        alt='bg'
        style={{
          width: '100%',
          height: '100%',
          position: 'fixed',
          top: 115,
          zIndex: -1,
          objectFit: 'cover',
        }}
      />

      {historyMessages &&
        historyMessages.reverse()
          .map((message: Message, index: number) => {
            if (user.username == message.username) {
              return (
                <div key={index} className='flex flex-col mt-2 px-3 w-full h-full text-right justify-end'>
                  <div>
                    <div className='bg-dark-primary px-10 inline-block max-w-72 rounded-lg justify-end'>
                      <div className='text-sm text-red'>{message.username}</div>
                      <div className='text-white'>{message.content}</div>
                      <div className='text-red text-xs mt-2'>{formatTimestamp(message.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )
            } else {
              return (
                <div key={index} className='flex flex-col mt-2 px-3 w-full text-left justify-start'>
                  <div>
                    <div className='bg-orange px-10 inline-block max-w-72 rounded-lg justify-start'>
                      <div className='text-sm text-purple'>{message.username}</div>
                      <div className='text-white'>{message.content}</div>
                      <div className='text-purple text-xs mt-2'>{formatTimestamp(message.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )
            }
          })}
      {data.map((message: Message, index: number) => {
        if (message.type == 'self') {
          return (
            <div key={index} className='flex flex-col mt-2 px-3 w-full text-right justify-end'>
              <div>
                <div className='bg-dark-primary px-10 inline-block max-w-72 rounded-lg justify-end'>
                  <div className='text-sm text-red'>{message.username}</div>
                  <div className='text-white'>{message.content}</div>
                  <div className='text-red text-xs mt-2'>{formatTimestamp(message.createdAt)}</div>
                </div>
              </div>
            </div>
          )
        } else if (message.type == 'recv') {
          return (
            <div key={index} className='flex flex-col mt-2 px-3 w-full text-left justify-start'>
              <div>
                <div className='bg-orange px-10 inline-block max-w-72 rounded-lg justify-start'>
                  <div className='text-sm text-purple'>{message.username}</div>
                  <div className='text-white'>{message.content}</div>
                  <div className='text-purple text-xs mt-2'>{formatTimestamp(message.createdAt)}</div>
                </div>
              </div>
            </div>
          )
        }
      })}
    </div>
  )
}

export default ChatBody
