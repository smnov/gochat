'use client'
import { API_URL } from '@/constants'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function SignUp() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const router = useRouter()

  const submitHandler = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
      }
      )
      if (res.ok) {
        return router.push('/login')
      }
    } catch (error) {
      alert(error)
      console.log(error)
    }
  }
  return (
    <div className='flex items-center justify-center min-w-full min-h-screen'>
      <form className='flex flex-col md:w-1/5'>
        <div className='text-3xl font-bold text-center'>Create an account:</div>
        <input placeholder='email'
          className='p-3 mt-8 rounded-md border-2 border-grey focus:outline-none focus: border-blue'
          value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <input type='text'
          placeholder='username'
          className='p-3 mt-4 rounded-md border-2 border-grey focus:outline-none focus: border-blue'
          value={username}
          onChange={(e) => setUsername(e.target.value)} />
        <input type='password'
          placeholder='password'
          className='p-3 mt-4 rounded-md border-2 border-grey focus:outline-none focus: border-blue'
          value={password}
          onChange={(e) => setPassword(e.target.value)} />
        <button className='p-3 mt-6 rounded-md bg-blue font-bold text-white'
          type='submit'
          onClick={submitHandler}
        >login</button>
        <div className='mt-2'>
          <h3>Already have an account? <a href='/login'>Login!</a></h3>
        </div>
      </form>
    </div>
  )
}

export default SignUp
