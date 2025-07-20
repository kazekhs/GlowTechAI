import Link from "next/link"
import { Sparkles } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white border-t border-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles className="w-5 h-5 text-pink-500" />
            <span className="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              GlowTech
            </span>
          </div>

          <div className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-pink-500 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-pink-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-pink-500 transition-colors">
              Contact
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-pink-100 text-center text-sm text-gray-500">
          © 2025 GlowTech. All rights reserved. Advanced care for modern skin.
        </div>
      </div>
    </footer>
  )
}
