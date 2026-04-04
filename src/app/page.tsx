import HomeClient from '@/components/home/HomeClient'
import { getProducts } from '@/lib/services/catalog'

export default async function Home() {
  const [featuredProducts, newest] = await Promise.all([
    getProducts({ limit: 4 }), // Default featured/sellers
    getProducts({ tag: 'جديد', limit: 4 })
  ])
  
  const newArrivals = newest.length > 0 ? newest : featuredProducts.slice(0, 4)

  return (
    <HomeClient 
      featuredProducts={featuredProducts} 
      newArrivals={newArrivals} 
    />
  )
}
