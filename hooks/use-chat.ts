import { useState } from "react"
import { useChatHistory } from "@/hooks/use-chat-history"

export function useChat() {
  const { loadMessages } = useChatHistory()
  const [messages, setMessages] = useState<any[]>([])

  const openConversation = async (conversationId: string) => {
    const msgs = await loadMessages(conversationId)
    setMessages(msgs)
  }

  return {
    messages,
    setMessages,
    openConversation,
  }
}
