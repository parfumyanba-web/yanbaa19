'use client'

import React, { useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'
import { Download, TrendingUp, ShoppingBag, Users } from 'lucide-react'
import { exportToExcel } from '@/lib/utils/exportUtils'

export const AnalyticsDashboard = ({ initialSalesData }: { initialSalesData: any[] }) => {
  
  const chartData = useMemo(() => {
    const daily: any = {}
    initialSalesData.forEach(s => {
      const date = new Date(s.created_at).toLocaleDateString()
      daily[date] = (daily[date] || 0) + Number(s.total_price)
    })
    return Object.keys(daily).map(date => ({ date, amount: daily[date] }))
  }, [initialSalesData])

  const stats = [
    { label: 'Total Revenue', value: `${chartData.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()} DZD`, icon: <TrendingUp size={20} />, color: 'text-gold' },
    { label: 'Orders Count', value: initialSalesData.length, icon: <ShoppingBag size={20} />, color: 'text-blue-400' },
    { label: 'Avg Order Value', value: `${(chartData.reduce((acc, curr) => acc + curr.amount, 0) / (initialSalesData.length || 1)).toFixed(0).toLocaleString()} DZD`, icon: <Users size={20} />, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="glass-card p-6 flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-white/5 ${s.color}`}>
              {s.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40">{s.label}</p>
              <h3 className="text-xl font-bold text-white/90">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold">Revenue Growth</h3>
          <button 
            onClick={() => exportToExcel(chartData, 'Revenue_Report')}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-xl hover:border-gold transition-all text-xs text-white/50"
          >
             <Download size={14} /> Export Report
          </button>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="date" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#000', border: '1px solid #ffffff10', borderRadius: '12px' }}
                itemStyle={{ color: '#D4AF37' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#D4AF37" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
