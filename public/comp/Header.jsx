import React, { useState, useEffect } from 'react';

const Header = () => {
  const [showMsg, setShowMsg] = useState(false);

  const handleClick = () => {
    setShowMsg(true);
  };

  // Automatically hide message after 3 seconds
  useEffect(() => {
    if (showMsg) {
      const timer = setTimeout(() => setShowMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showMsg]);

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex fixed top-0 right-0 left-0 text-white items-center justify-between w-full bg-gray-800 border-t border-gray-700 p-3 z-50 h-[60px]">

        {/* Menu icon */}
        <div>
          <img
            onClick={handleClick}
            className="w-[60px] cursor-pointer"
            src="https://i.ibb.co/pDFdf2y/icons8-menu-64.png"
            alt="menu icon"
          />
        </div>

        {/* Title and New Chat */}
        <div className='flex items-center place-content-between h-full w-[60%]'>
          <h1 className="text-2xl">ChaturAi</h1>
          <h1
            onClick={handleClick}
            className='text-xl bg-gray-700 px-2 py-px rounded mx-2 cursor-pointer'
          >
            New Chat
          </h1>
        </div>
      </div>

      {/* Notification overlay */}
      <div
        className={`
          fixed top-3 left-3 bg-green-600 text-white px-4 py-2 rounded shadow-lg 
          transform transition-all duration-300 ease-in-out
          ${showMsg ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10 pointer-events-none'}
          z-60
        `}
      >
        Coming Soon
      </div>
    </div>
  );
};

export default Header;