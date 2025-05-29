import React from 'react'

const Aichats = ({ text }) => {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-gray-700 text-white p-3 rounded-lg max-w-[70%]">
        <p>{text}</p>
      </div>
    </div>
  )
}

export default Aichats;