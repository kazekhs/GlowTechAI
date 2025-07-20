"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { Message } from "@ai-sdk/react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { useAuth } from "@/hooks/use-auth"
import { useChatHistory } from "@/hooks/use-chat-history"

import {
  Send,
  Bot,
  User,
  ShoppingBag,
  Calendar,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react"

import { ProductRecommendations } from "./product-recommendations"
import { RoutineScheduler } from "./routine-scheduler"

interface ChatInterfaceProps {
  externalMessages?: Message[]
}

export function ChatInterface({ externalMessages = [] }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { saveMessages } = useChatHistory()

  const [showProducts, setShowProducts] = useState(false)
  const [showScheduler, setShowScheduler] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
  } = useChat({
    api: "/api/chat",
    initialMessages: externalMessages,
    body: { userId: user?.id },
    onFinish: (message) => {
      if (user && (message.role === "user" || message.role === "assistant")) {
        saveMessages([{ role: message.role, content: message.content }])
      }
      setChatError(null)
    },
    onError: () => {
      setChatError(
        "I'm having trouble responding right now. Please check your Google AI API configuration."
      )
    },
  })

  useEffect(() => {
    if (externalMessages.length > 0) {
      setMessages(externalMessages)
    }
  }, [externalMessages, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const quickActions = [
    {
      label: "Product Recommendations",
      value:
        "Can you recommend specific skincare products for combination skin with acne?",
    },
    {
      label: "Complete Routine",
      value:
        "Give me a complete skincare routine with specific brand names and products",
    },
    {
      label: "Budget Products",
      value: "What are the best budget skincare products under $15 each?",
    },
    {
      label: "Anti-Aging Products",
      value:
        "Recommend specific anti-aging products with retinol and vitamin C",
    },
  ]

  const handleQuickAction = (text: string) => {
    handleInputChange({
      target: { value: text },
    } as React.ChangeEvent<HTMLInputElement>)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Welcome to GlowTech!
            </h3>
            <p className="text-gray-600 mb-6">
              I’m your personal AI skincare consultant here to recommend the best products, complete with brand names and pricing.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {quickActions.map((action) => (
                <Badge
                  key={action.label}
                  variant="secondary"
                  className="cursor-pointer hover:bg-pink-100 transition-colors"
                  onClick={() => handleQuickAction(action.value)}
                >
                  {action.label}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(error || chatError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{chatError || "An error occurred while chatting."}</span>
              <Button variant="outline" size="sm" onClick={() => reload()}>
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === "user"
                    ? "bg-pink-500 text-white"
                    : "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                }`}
              >
                {message.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <Card
                className={`${
                  message.role === "user" ? "bg-pink-50" : "bg-white"
                }`}
              >
                <CardContent className="p-3">
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <Card>
              <CardContent className="p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Actions */}
      <div className="px-4 py-2 border-t">
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowProducts(true)}
            className="flex items-center gap-1"
          >
            <ShoppingBag className="w-3 h-3" />
            Products
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowScheduler(true)}
            className="flex items-center gap-1"
          >
            <Calendar className="w-3 h-3" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask for specific product recommendations with brand names..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Modal Components */}
      {showProducts && (
        <ProductRecommendations onClose={() => setShowProducts(false)} />
      )}
      {showScheduler && (
        <RoutineScheduler onClose={() => setShowScheduler(false)} />
      )}
    </div>
  )
}
