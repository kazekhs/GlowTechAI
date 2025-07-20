import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import type { NextRequest } from "next/server"

export const maxDuration = 30

const SKINCARE_SYSTEM_PROMPT = `Kamu adalah GlowTech, konsultan skincare berbasis AI yang bicara seperti teman sendiri—nggak kaku, nggak terlalu formal, dan nggak pakai formatting aneh kayak bold (**teks tebal**) atau bullet list.

Tujuanmu: bantu pengguna cari produk skincare yang cocok dengan menyebutkan nama brand dan produk secara natural.

Gaya bahasa kamu:
- Santai, seperti ngobrol di DM
- Jawaban ngalir, bukan list
- Hindari markdown formatting (kayak **bold** atau *italic*)
- Hindari jawaban yang dimulai dengan "Hi there!" atau struktur template
- Jangan terlalu textbook, kasih opini jujur kayak manusia

Kalau kasih rekomendasi:
- Sebutkan nama produk + brand
- Bisa sebut kisaran harga kalau relevan, tapi jangan overdetail
- Jelaskan kenapa kamu merekomendasikan produk itu, tapi dengan bahasa santai
- Kalau bisa, bandingin beberapa pilihan tanpa bikin tabel atau list

Contoh gaya jawaban (jangan disalin mentah-mentah, cuma contoh gaya):
"Kalau kulit kamu kombinasi dan jerawatan, mending mulai dari cleanser yang punya salicylic acid. CeraVe Renewing SA Cleanser itu bagus banget, murah juga. Kalau mau yang lebih kalem, Paula's Choice juga enak dipakai, tapi harganya agak di atas. Nah buat pelembap, Glossier Balance itu ringan banget, cocok buat yang zona T-nya gampang berminyak."

Tugas kamu bantu kasih saran yang beneran kepake. Jangan bahas hal di luar skincare ya.
`
const FALLBACK_RESPONSES = {
  greeting: `Hi! I'm GlowTech, your AI skincare consultant! 🌟

I can help you with:
• Specific product recommendations with brand names
• Skincare routines for different skin types
• Ingredient explanations
• Where to buy products

What skincare questions do you have for me?`,

  products: `Here are some great product recommendations:

**🧼 Cleansers:**
• **CeraVe Foaming Facial Cleanser** (~$12) - Great for oily/combination skin
• **Cetaphil Gentle Skin Cleanser** (~$10) - Perfect for sensitive skin
• **The Ordinary Squalane Cleanser** (~$8) - Gentle, hydrating cleanser

**💧 Moisturizers:**
• **CeraVe Daily Moisturizing Lotion** (~$15) - Contains ceramides and hyaluronic acid
• **Neutrogena Hydro Boost** (~$18) - Lightweight, gel-based
• **The Ordinary Natural Moisturizing Factors** (~$7) - Budget-friendly option

**🧴 Serums:**
• **The Ordinary Niacinamide 10% + Zinc** (~$7) - Controls oil and pores
• **Good Molecules Hyaluronic Acid Serum** (~$6) - Intense hydration
• **Paula's Choice 2% BHA Liquid Exfoliant** (~$30) - Great for acne

**☀️ Sunscreens:**
• **EltaMD UV Clear** (~$37) - Dermatologist favorite
• **La Roche-Posay Anthelios** (~$20) - Gentle, effective
• **Neutrogena Ultra Sheer** (~$8) - Budget drugstore option

All available at drugstores, Target, or online! Always patch test first! 💕`,

  routine: `Here's a complete routine with specific products:

**Morning Routine:**
1. **CeraVe Foaming Cleanser** (~$12)
2. **The Ordinary Niacinamide Serum** (~$7)
3. **CeraVe Daily Moisturizer** (~$15)
4. **EltaMD UV Clear SPF 46** (~$37)

**Evening Routine:**
1. **CeraVe Foaming Cleanser** (~$12)
2. **Paula's Choice 2% BHA** (~$30) - 2-3x/week
3. **The Ordinary Hyaluronic Acid** (~$7)
4. **CeraVe PM Facial Moisturizer** (~$16)

**Total Cost:** ~$124 for complete routine
**Where to buy:** Target, CVS, Amazon, or brand websites

Start slowly with active ingredients and always patch test!`,

  default: `I'm here to give you specific product recommendations! 

**I can recommend:**
• Exact brand names and products
• Where to buy them
• Price ranges
• Multiple options for different budgets

**Popular Topics:**
• Complete skincare routines with products
• Acne solutions with specific treatments
• Anti-aging products that actually work
• Sensitive skin product recommendations

What specific products are you looking for?`,
}

function getRelevantResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  if (message.includes("product") || message.includes("recommend") || message.includes("brand")) {
    return FALLBACK_RESPONSES.products
  }
  if (message.includes("routine") || message.includes("steps")) {
    return FALLBACK_RESPONSES.routine
  }
  if (message.includes("hi") || message.includes("hello") || message.includes("hey")) {
    return FALLBACK_RESPONSES.greeting
  }

  return FALLBACK_RESPONSES.default
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ""

    console.log("Google API Key exists:", !!process.env.GOOGLE_GENERATIVE_AI_API_KEY)
    console.log("Messages received:", messages?.length)

    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.log("No Google API key found")
      return Response.json({
        role: "assistant",
        content: `${getRelevantResponse(lastMessage)}

⚠️ **Google Gemini API Key Missing**: To unlock my full AI potential, please add your Google AI API key to the .env.local file:

\`\`\`
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
\`\`\`

Get your free API key at: https://makersuite.google.com/app/apikey

Then restart the server with \`npm run dev\``,
      })
    }

    console.log("Making Google Gemini API call...")

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: SKINCARE_SYSTEM_PROMPT,
      messages,
      temperature: 0.8,
      maxTokens: 800,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Gemini API error:", error)

    const { messages } = await req.json().catch(() => ({ messages: [] }))
    const lastMessage = messages[messages.length - 1]?.content || ""

    return Response.json({
      role: "assistant",
      content: `🔧 **API Issue** - But I can still help with specific products!

${getRelevantResponse(lastMessage)}

Please check your Google AI API key configuration and try again!`,
    })
  }
}
