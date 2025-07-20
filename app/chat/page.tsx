"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ChatInterface } from "@/components/chat-interface"
import { ChatHistory } from "@/components/chat-history"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { History, MessageCircle } from "lucide-react"
import { Message } from "@ai-sdk/react"

export default function ChatPage() {
  const [showHistory, setShowHistory] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 max-w-7xl mx-auto">
          {/* Chat History Sidebar */}
          <div className={`${showHistory ? "block" : "hidden"} lg:block w-80 flex-shrink-0`}>
            <ChatHistory setMessages={setMessages} />
          </div>

          {/* Main Chat Interface */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-lg h-[calc(100vh-140px)]">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-pink-500" />
                  <h1 className="text-lg font-semibold">GlowTech Assistant</h1>
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)} className="lg:hidden">
                  <History className="w-4 h-4" />
                </Button>
              </div>
              <ChatInterface externalMessages={messages} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
