import React from 'react'

const Userchat = ({ usertext }) => {
  return (
    <div className="flex justify-end mb-3">
      <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[70%]">
        <p>{usertext}</p>
      </div>
    </div>
  )
}

export default Userchat;