'use client'

import React, { useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

interface AnalyticsDashboardProps {
  orderData: any[]
  revenueData: any[]
}

const AnalyticsDashboard = ({ orderData, revenueData }: AnalyticsDashboardProps) => {
  // 1. Process Daily Revenue for Area Chart
  const chartData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split('T')[0]
    }).reverse()

    return last7Days.map(date => {
      const dailyRev = revenueData
        .filter(r => r.created_at.startsWith(date))
        .reduce((sum, r) => sum + (Number(r.total_price) || 0), 0)
      
      const dailyOrders = orderData
        .filter(o => o.created_at.startsWith(date))
        .length

      return {
        date: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
        revenue: dailyRev,
        orders: dailyOrders
      }
    })
  }, [orderData, revenueData])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Revenue Trend Area Chart */}
      <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8">
        <div className="flex justify-between items-center">
           <h3 className="text-xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase">Revenue Insights</h3>
           <div className="flex gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-gold" /> Sales</span>
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white/10" /> Projected</span>
           </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#ffffff20', fontSize: 10}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#ffffff20', fontSize: 10}}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '15px'}}
                itemStyle={{color: '#D4AF37', fontSize: '12px'}}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#D4AF37" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Volume Bar Chart */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8">
        <h3 className="text-xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase">Volume</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#ffffff20', fontSize: 10}}
                dy={10}
              />
              <Tooltip 
                cursor={{fill: '#ffffff05'}}
                contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '15px'}}
              />
              <Bar dataKey="orders" radius={[10, 10, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#D4AF37' : '#ffffff10'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
