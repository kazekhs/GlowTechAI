import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Clock, Zap } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: Shield,
      title: "Expert Knowledge",
      description: "Trained on dermatologist-approved skincare information and latest research",
    },
    {
      icon: Users,
      title: "Personalized Advice",
      description: "Tailored recommendations based on your unique skin type and concerns",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Get skincare guidance anytime, anywhere, even as a guest user",
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Quick responses with actionable skincare tips and product suggestions",
    },
  ]

  return (
    <section className="py-20 px-4 bg-white/50">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose GlowTech?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Experience the future of skincare consultation with our AI-powered platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
