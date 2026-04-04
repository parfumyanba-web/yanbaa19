'use client'

import React, { useMemo, useState } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'
import { useLanguage } from '@/context/LanguageContext'
import { clsx } from 'clsx'

interface AnalyticsDashboardProps {
  orderData: any[]
  revenueData: any[]
}

type TimeRange = '7d' | '30d' | '90d' | '12m'

const AnalyticsDashboard = ({ orderData, revenueData }: AnalyticsDashboardProps) => {
  const { t } = useLanguage()
  const [range, setRange] = useState<TimeRange>('7d')

  // 1. Process Data based on Range
  const chartData = useMemo(() => {
    let days = 7
    let interval = 'day'
    
    if (range === '30d') days = 30
    if (range === '90d') days = 90
    if (range === '12m') {
      days = 12
      interval = 'month'
    }

    const labels = [...Array(days)].map((_, i) => {
      const d = new Date()
      if (interval === 'month') {
        d.setMonth(d.getMonth() - i)
        return d.toISOString().substring(0, 7) // YYYY-MM
      } else {
        d.setDate(d.getDate() - i)
        return d.toISOString().split('T')[0] // YYYY-MM-DD
      }
    }).reverse()

    return labels.map(label => {
      const filteredRevenue = revenueData.filter(r => r.created_at.startsWith(label))
      const filteredOrders = orderData.filter(o => o.created_at.startsWith(label))
      
      const revenue = filteredRevenue.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0)
      const orders = filteredOrders.length

      let displayDate = label
      if (interval === 'month') {
        displayDate = new Date(label + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
      } else {
        displayDate = new Date(label).toLocaleDateString('fr-FR', { 
            day: range === '7d' ? '2-digit' : '2-digit', 
            weekday: range === '7d' ? 'short' : undefined,
            month: range !== '7d' ? 'short' : undefined 
        })
      }

      return {
        date: displayDate,
        revenue,
        orders,
        fullDate: label
      }
    })
  }, [orderData, revenueData, range])

  return (
    <div className="space-y-8">
      {/* Range Selector */}
      <div className="flex justify-center sm:justify-end">
        <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
          {(['7d', '30d', '90d', '12m'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={clsx(
                "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                range === r ? "bg-gold text-black shadow-lg shadow-gold/20" : "text-white/40 hover:text-white"
              )}
            >
              {t(`range_${r}`) || r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase">{t('revenue_insights')}</h3>
               <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1 ml-4">{t('revenue_trend_subtitle')}</p>
            </div>
            <div className="hidden sm:flex gap-4 text-[10px] font-bold text-white/20 uppercase tracking-widest">
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
                  interval={range === '90d' ? 6 : range === '30d' ? 2 : 0}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#ffffff20', fontSize: 10}}
                  tickFormatter={(value) => value >= 1000 ? `${value / 1000}k` : value}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '15px'}}
                  itemStyle={{color: '#D4AF37', fontSize: '12px'}}
                  labelStyle={{color: '#ffffff40', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#D4AF37" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Volume Bar Chart */}
        <div className="glass-card p-8 rounded-[2.5rem] border border-white/5 space-y-8">
          <div>
            <h3 className="text-xl font-bold font-arabic tracking-tight border-l-4 border-gold pl-4 uppercase">{t('volume')}</h3>
            <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1 ml-4">{t('order_volume_subtitle')}</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#ffffff20', fontSize: 10}}
                  dy={10}
                  interval={range === '90d' ? 10 : range === '30d' ? 4 : 0}
                />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #ffffff10', borderRadius: '15px'}}
                  labelStyle={{color: '#ffffff40', fontSize: '10px', marginBottom: '8px', textTransform: 'uppercase'}}
                />
                <Bar dataKey="orders" radius={[10, 10, 0, 0]} animationDuration={2000}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#D4AF37' : '#ffffff10'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
