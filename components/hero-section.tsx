import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles, Calendar, ShoppingBag } from "lucide-react"

export function HeroSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Personal{" "}
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              AI Skincare
            </span>{" "}
            Consultant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized skincare advice, product recommendations, and routine planning powered by advanced AI
            technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="bg-gradient-to-r from-pink-500 to-purple-600">
              <Link href="/chat">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start Chatting
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signup">
                <Sparkles className="w-5 h-5 mr-2" />
                Create Account
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold mb-2">AI Chat Assistant</h3>
              <p className="text-gray-600 text-sm">Get instant answers to all your skincare questions</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="font-semibold mb-2">Product Recommendations</h3>
              <p className="text-gray-600 text-sm">Discover the perfect products for your skin type</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-semibold mb-2">Routine Scheduling</h3>
              <p className="text-gray-600 text-sm">Never miss your skincare routine with smart reminders</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
