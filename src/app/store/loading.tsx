import React from 'react'

export default function StoreLoading() {
  return (
    <main className="min-h-screen pt-32 bg-[#121212]">
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <header className="mb-16 space-y-4">
          <div className="h-12 w-64 bg-white/5 rounded-2xl animate-pulse" />
          <div className="h-4 w-48 bg-white/5 rounded-lg animate-pulse" />
        </header>

        {/* Filters Placeholder */}
        <div className="flex flex-wrap gap-4 mb-12">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 w-24 bg-white/5 rounded-full animate-pulse" />
          ))}
        </div>

        {/* Product Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-[4/5] glass-card bg-white/5 animate-pulse rounded-2xl" />
              <div className="space-y-2">
                <div className="h-6 w-3/4 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
