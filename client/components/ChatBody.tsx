import { Message } from '@/app/room/page'
import React, { useRef } from 'react'

function ChatBody({ data }: { data: Array<Message> }) {
  return (
    <>
      {data.map((message: Message, index: number) => {
        if (message.type == 'self') {
          return (
            <div key={index} className='flex flex-col mt-2 w-full text-right justify-end'>
              <div className='text-sm'>{message.username}</div>
              <div>
                <div className='bg-blue text-white px-4 py-1 rounded-md inline-block mt-1'>{message.content}</div>
              </div>
            </div>
          )
        } else {
          return (
            <div key={index} className='flex flex-col w-full text-left justify-start'>
              <div className='text-sm'>{message.username}</div>
              <div className='bg-grey text-white px-4 py-1 rounded-md inline-block mt-1'>{message.content}</div>
            </div>
          )
        }
      })}
    </>
  )
}

export default ChatBody
