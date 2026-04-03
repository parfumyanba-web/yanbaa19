import React from 'react'
import Navbar from '@/components/layout/Navbar'

export default function Loading() {
  return (
    <main className="min-h-screen pt-32 bg-[#121212]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 space-y-12 mb-20 mt-12">
        <div className="space-y-4">
           <div className="h-4 w-24 bg-white/5 rounded-full animate-pulse" />
           <div className="h-12 w-64 bg-white/5 rounded-2xl animate-pulse" />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2rem] border border-white/5 flex flex-col p-8 space-y-6 animate-pulse">
               <div className="flex-1 bg-white/5 rounded-2xl" />
               <div className="space-y-3">
                  <div className="h-5 w-3/4 bg-white/5 rounded-full" />
                  <div className="h-3 w-1/2 bg-white/5 rounded-full" />
               </div>
               <div className="h-10 w-full bg-white/5 rounded-xl pt-4 border-t border-white/5" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
