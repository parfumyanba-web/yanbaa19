import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from './DashboardContent'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { count: activeOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('user_id', user.id).not('status', 'in', '("delivered","cancelled")')
  const { data: purchaseData } = await supabase.from('orders').select('total_price').eq('user_id', user.id).eq('status', 'delivered')
  const totalPurchases = purchaseData?.reduce((acc: number, curr: any) => acc + (Number(curr.total_price) || 0), 0) || 0
  
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, invoices(*), order_items(*, products(name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <DashboardContent 
      profile={profile} 
      activeOrdersCount={activeOrdersCount} 
      totalPurchases={totalPurchases} 
      recentOrders={recentOrders} 
    />
  )
}
