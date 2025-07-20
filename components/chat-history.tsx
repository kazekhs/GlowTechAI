"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { useChatHistory } from "@/hooks/use-chat-history"
import { MessageCircle, Trash2, Clock } from "lucide-react"
import type { Message as SDKMessage } from "@ai-sdk/react"

interface ChatHistoryProps {
  setMessages: (messages: SDKMessage[]) => void
}

export function ChatHistory({ setMessages }: ChatHistoryProps) {
  const { user } = useAuth()
  const {
    conversations,
    deleteConversation,
    loadMessages,
    setCurrentConversationId,
  } = useChatHistory()

  return (
    <Card className="h-[calc(100vh-140px)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Chat History
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-2 p-4">
          {!user && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Sign in to save your chat history</p>
            </div>
          )}

          {user && conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No conversations yet</p>
            </div>
          )}

          {user &&
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer group"
                onClick={async () => {
                  setCurrentConversationId(conversation.id)
                  const msgs = await loadMessages(conversation.id)

                  const filtered: SDKMessage[] = msgs.map((m) => ({
                    id: m.id, // ✅ Ensure 'id' is included
                    role: m.role,
                    content: m.content,
                  }))

                  setMessages(filtered)
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">
                      {conversation.title || "Skincare Chat"}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {conversation.message_count} messages
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
