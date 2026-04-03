export interface Brand {
  id: string
  name: string
  image_url?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price_dzd: number
  image_url: string
  brand_id?: string
  brands?: { name: string }
  product_tags?: { tags: { name: string } }[]
}

export interface ProductFilters {
  categoryId?: string
  brandId?: string
  tag?: string
  limit?: number
}
