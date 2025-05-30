import React, { useState } from 'react'

const Header = () => {
  const [showMsg, setShowMsg] = useState(false);

  // Click handler jo message toggle karega
  const handleClick = () => {
    setShowMsg(true);

    // 3 second ke baad message chhup jaye
    setTimeout(() => setShowMsg(false), 3000);
  };

  return (
    <>
      <div className='flex fixed top-0 right-0 left-0 text-white items-center justify-between w-full bg-gray-800 border-t border-gray-700 p-2'>

        {/* Left side message */}
        <div className='w-[150px]'>
          {showMsg && (
            <div className='bg-green-600 text-white px-3 py-1 rounded flex fixed top-0 right-0 left-0'>
              Coming Soon
            </div>
          )}
        </div>

        {/* Image */}
        <div>
          <img
            onClick={handleClick}
            className='w-[60px] cursor-pointer'
            src="https://i.ibb.co/pDFdf2y/icons8-menu-64.png"
            alt="menu icon"
          />
        </div>

        {/* Title and New Chat */}
        <div className='flex items-center h-full w-[60%]'>
          <h1 className="text-2xl">ChaturAi</h1>
          <h1
            onClick={handleClick}
            className='text-xl bg-gray-700 px-2 py-px rounded mx-2 cursor-pointer'
          >
            New Chat
          </h1>
        </div>
      </div>
    </>
  )
}

export default Header