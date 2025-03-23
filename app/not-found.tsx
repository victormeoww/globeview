'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e14] text-[#f0f2f5] p-4">
      <div className="max-w-md w-full bg-[#141a24] p-6 rounded-lg border border-[#2a3548] shadow-lg">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-[#3a7bd5] bg-opacity-20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-[#3a7bd5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <h1 className="mb-2 text-2xl font-bold text-center text-[#f0f2f5]">404 - Page Not Found</h1>
        
        <p className="mb-4 text-center text-[#c8cdd6]">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="p-3 mb-4 bg-[#1c2433] border border-[#2a3548] rounded-md">
          <p className="text-center text-[#e63946] font-semibold">
            IF YOU ARE LOOKING FOR THE REPORT/ARTICLE, IT MAY NOT BE AVAILABLE JUST YET.
          </p>
        </div>
        
        <div className="flex justify-center">
          <Link href="/" className="px-4 py-2 bg-[#3a7bd5] text-white rounded hover:bg-[#2d62b3] transition-colors duration-300">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 