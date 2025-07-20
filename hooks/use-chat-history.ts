import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "./use-auth"

interface Conversation {
  id: string
  title: string
  created_at: string
  message_count: number
}

interface StoredMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export function useChatHistory() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user])

  const loadConversations = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (error: any) {
      console.error("❌ Error loading conversations:", error?.message || error)
    }
  }

  const startNewConversation = async (): Promise<string | null> => {
    if (!user) return null
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert({ user_id: user.id, title: "New Conversation" })
        .select()
        .single()

      if (error) throw error
      return data.id
    } catch (error: any) {
      console.error("❌ Error creating conversation:", error?.message || error)
      return null
    }
  }

  const saveMessages = async (
    msgs: { role: "user" | "assistant"; content: string }[]
  ) => {
    if (!user) {
      const guestMessages = JSON.parse(localStorage.getItem("guestMessages") || "[]")
      guestMessages.push(...msgs)
      localStorage.setItem("guestMessages", JSON.stringify(guestMessages))
      return
    }

    try {
      let conversationId = currentConversationId

      if (!conversationId) {
        conversationId = await startNewConversation()
        if (!conversationId) throw new Error("Conversation ID not available.")
        setCurrentConversationId(conversationId)
        await loadConversations()
      }

      const { data: existing, error: checkError } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", conversationId)
        .single()

      if (checkError || !existing) {
        console.error("❌ Conversation not found:", conversationId)
        throw new Error("Conversation ID not found in conversations table")
      }

      const payload = msgs.map((msg) => ({
        user_id: user.id,
        role: msg.role,
        content: msg.content,
        conversation_id: conversationId,
      }))

      const { error } = await supabase.from("messages").insert(payload)
      if (error) throw error
    } catch (error: any) {
      console.error("❌ Error saving messages:", error?.message || error)
    }
  }

  const loadMessages = async (conversationId: string): Promise<StoredMessage[]> => {
    if (!user) return []
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, role, content, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      return data || []
    } catch (error: any) {
      console.error("❌ Error loading messages:", error?.message || error)
      return []
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!user) return
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId)
        .eq("user_id", user.id)

      if (error) throw error
      await loadConversations()
    } catch (error: any) {
      console.error("❌ Error deleting conversation:", error?.message || error)
    }
  }

  return {
    conversations,
    currentConversationId,
    startNewConversation,
    saveMessages,
    loadMessages,
    deleteConversation,
    setCurrentConversationId,
  }
}
