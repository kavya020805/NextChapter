import React from 'react'
import Link from 'next/link'
const page = () => {
  return (
    <>
      <div>Next chapter</div>

      <div>
        <Link href="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
      </div>

      <div>
        <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
      </div>
    </>
  )
}

export default page