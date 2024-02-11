import { Message } from '@/app/room/page'
import React, { useRef } from 'react'

function ChatBody({ data }: { data: Array<Message> }) {
  return (
    <>
      {data.map((message: Message, index: number) => {
        if (message.type == 'recv') {
          return (
            <div key={index} className='bg-blue'>
              <div>{message.username}</div>
              <div>{message.content}</div>
            </div>
          )
        } else {
          return (
            <div key={index} className='bg-grey'>
              <div>{message.username}</div>
              <div>{message.content}</div>
            </div>
          )
        }
      })}
    </>
  )
}

export default ChatBody
