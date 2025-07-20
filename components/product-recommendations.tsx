"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Star, ShoppingBag, MapPin, Shield, Truck, Info } from "lucide-react"

interface Product {
  id: string
  name: string
  brand: string
  price?: string | number
  rating?: number
  reviewCount?: number
  sold?: string
  shopeeUrl?: string
  image?: string
  description?: string
  shop?: string
  shopBadge?: string
  location?: string
  freeShipping?: boolean
  shopeeVerified?: boolean
  category?: string
  productType?: string
  tags?: string[]
  originalProductLink?: string
  websiteLink?: string
}

interface ProductRecommendationsProps {
  onClose: () => void
}

export function ProductRecommendations({ onClose }: ProductRecommendationsProps) {
  const [skinType, setSkinType] = useState("")
  const [concern, setConcern] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [apiSource, setApiSource] = useState("")

  const fetchProducts = async () => {
    if (!skinType || !concern) return
    setLoading(true)

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skinType, concern }),
      })

      const data = await response.json()
      setProducts(data.products || [])
      setApiSource(data.source || "unknown")
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [skinType, concern])

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Skincare Product Recommendations
          </DialogTitle>
          {apiSource === "skincare-api" && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Info className="w-4 h-4" />
              Data from Skincare API - Click to search on Shopee
            </div>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skinType">Skin Type</Label>
              <Select value={skinType} onValueChange={setSkinType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your skin type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oily">Oily</SelectItem>
                  <SelectItem value="dry">Dry</SelectItem>
                  <SelectItem value="combination">Combination</SelectItem>
                  <SelectItem value="sensitive">Sensitive</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="concern">Main Concern</Label>
              <Select value={concern} onValueChange={setConcern}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your concern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="acne">Acne</SelectItem>
                  <SelectItem value="aging">Anti-aging</SelectItem>
                  <SelectItem value="hydration">Hydration</SelectItem>
                  <SelectItem value="brightening">Brightening</SelectItem>
                  <SelectItem value="pores">Large Pores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-gray-600">Finding perfect products for you...</p>
            </div>
          )}

          {products.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="p-4">
                    <div className="relative">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-40 object-cover rounded-lg mb-2"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/placeholder.svg"
                        }}
                      />
                      {product.productType && (
                        <Badge className="absolute top-2 left-2 bg-pink-500 text-white text-xs">
                          {product.productType}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm line-clamp-2">
                      <span className="font-semibold text-pink-600">{product.brand}</span>
                      <br />
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">{product.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-orange-600 text-lg">
                        {typeof product.price === "string"
                          ? product.price
                          : `Rp ${Number(product.price || 0).toLocaleString("id-ID")}`}
                      </span>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating ?? 0}</span>
                        <span className="text-gray-500">
                          ({typeof product.reviewCount === "number"
                            ? product.reviewCount.toLocaleString("id-ID")
                            : 0})
                        </span>
                      </div>
                      <span className="text-gray-500">{product.sold ?? ""}</span>
                    </div>

                    {/* Tags */}
                    {product.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Shop Info */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <span className="font-medium">{product.shop}</span>
                        {product.shopBadge && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {product.shopBadge}
                          </Badge>
                        )}
                      </div>
                      {product.shopeeVerified && <Shield className="w-3 h-3 text-blue-500" />}
                    </div>

                    {/* Location & Shipping */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{product.location}</span>
                      </div>
                      {product.freeShipping && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Truck className="w-3 h-3" />
                          <span>Free Shipping</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        onClick={() => product.shopeeUrl && window.open(product.shopeeUrl, "_blank")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Cari di Shopee
                      </Button>

                      {product.originalProductLink && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => window.open(product.originalProductLink, "_blank")}
                        >
                          <Info className="w-3 h-3 mr-1" />
                          Product Details
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {skinType && concern && products.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No products found for your selection. Try different criteria.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
