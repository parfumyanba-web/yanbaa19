import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/admin/analytics/AnalyticsDashboard'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  
  // Fetch data for analytics (simplified for demo)
  const { data: salesData } = await supabase
    .from('orders')
    .select('created_at, total_price, status')
    .neq('status', 'cancelled')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-3xl font-bold text-white/90">Analytics & Insights</h1>
        <p className="text-white/40 text-sm">Visualize business performance and sales trends</p>
      </header>

      <AnalyticsDashboard initialSalesData={salesData || []} />
    </div>
  )
}
