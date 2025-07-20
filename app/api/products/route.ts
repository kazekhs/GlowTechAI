import { type NextRequest, NextResponse } from "next/server"
import rawDummyData from "../../api/data/dummy_skincare_products.json" // pastikan path ini sesuai lokasi file kamu

interface SkincareProduct {
  id: string
  name: string
  brand: string
  price: string
  rating: number
  image: string
  shopeeUrl: string
  description: string
  skinType: string
  concern: string
}

// ✅ Convert JSON ke typed object
const dummyData = rawDummyData as Record<string, SkincareProduct[]>

const SKINCARE_TYPES = ["cleanser", "serum", "moisturizer", "treatment", "mask", "toner", "essence"]

function isSkincare(product: any): boolean {
  const type = product.product_type?.toLowerCase()
  return type && SKINCARE_TYPES.some((t) => type.includes(t))
}

function formatPrice(price: string | null): string {
  const parsed = parseFloat(price || "")
  return isNaN(parsed) ? "Rp - " : `Rp ${Math.round(parsed * 16000).toLocaleString("id-ID")}`
}

function generateShopeeUrl(productName: string, brand: string): string {
  const searchQuery = `${brand} ${productName} skincare`.toLowerCase().replace(/\s+/g, "-")
  return `https://shopee.co.id/search?keyword=${encodeURIComponent(searchQuery)}`
}

export async function POST(req: NextRequest) {
  const { query, skinType, concern } = await req.json()

  try {
    const response = await fetch("https://makeup-api.herokuapp.com/api/v1/products.json")
    const data = await response.json()

    const filtered = data.filter((product: any) => {
      if (!isSkincare(product)) return false

      const matchesQuery = query
        ? product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase())
        : true

      return matchesQuery
    })

    const transformed: SkincareProduct[] = filtered.slice(0, 12).map((p: any) => ({
      id: String(p.id),
      name: p.name,
      brand: p.brand,
      price: formatPrice(p.price),
      rating: Number(p.rating) || 4.3,
      image: p.image_link || "/placeholder.svg",
      shopeeUrl: generateShopeeUrl(p.name, p.brand),
      description: p.description || `${p.brand} ${p.product_type}`,
      skinType: skinType || "all",
      concern: concern || "general",
    }))

    const finalProducts =
      transformed.length >= 3 ? transformed : getDummyProducts(skinType, concern)

    return NextResponse.json({ products: finalProducts, total: finalProducts.length })
  } catch (err) {
    console.error("API error:", err)
    const fallback = getDummyProducts(skinType, concern)
    return NextResponse.json({ products: fallback, total: fallback.length })
  }
}

function getDummyProducts(skinType: string, concern: string): SkincareProduct[] {
  const key = `${skinType}_${concern.replace(/\s+/g, "").toLowerCase()}`
  return dummyData[key] || dummyData["default"] || []
}
