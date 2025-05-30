import React from 'react'

const Header = () => {
  return (<>
  <div className='flex fixed top-0 right-0 left-0 text-white items-center place-content-between w-full bg-gray-800 border-t border-gray-700 '>
  <div>
      <img className='w-[60px]' src="https://i.ibb.co/pDFdf2y/icons8-menu-64.png" />
  </div>

  <div className='flex items-center place-content-between h-full w-[60%]'>
    <h1 className=" text-2xl"> ChaturAi </h1>
  <h1 className='text-xl bg-gray-700 px-2 py-px rounded mx-2'>New Chat</h1>
 </div>
  </div>
</>
  )
}

export default Header