import { type NextRequest, NextResponse } from "next/server"
import { google } from "googleapis"

interface SkincareRoutine {
  name: string
  steps: string[]
  scheduledTime: string
  frequency: "daily" | "weekly"
  userId?: string
}

interface CalendarEvent {
  summary: string
  description: string
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  recurrence?: string[]
  reminders: {
    useDefault: boolean
    overrides?: {
      method: string
      minutes: number
    }[]
  }
}

export async function POST(req: NextRequest) {
  try {
    const { routine, userId }: { routine: SkincareRoutine; userId?: string } = await req.json()

    if (!routine?.name || !routine?.steps || !routine?.scheduledTime || !routine?.frequency) {
      return NextResponse.json({ error: "Missing required routine information" }, { status: 400 })
    }

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env

    const isGoogleConfigured = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN

    if (!isGoogleConfigured) {
      return NextResponse.json({
        success: true,
        message: "Skincare routine scheduled successfully (demo mode).",
        eventId: "mock_event_" + Date.now(),
        routine,
      })
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/callback"
    )

    oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })

    const calendar = google.calendar({ version: "v3", auth: oauth2Client })

    const eventStartTime = new Date(routine.scheduledTime)
    const eventEndTime = new Date(eventStartTime.getTime() + 30 * 60 * 1000)

    const description = `
🌟 GlowTech Skincare Routine: ${routine.name}

📋 Steps to follow:
${routine.steps.map((step, i) => `${i + 1}. ${step}`).join("\n")}

💡 Tips:
- Take your time with each step
- Use gentle, upward motions
- Don’t forget to patch test new products
- Stay consistent for best results!

✨ Created by GlowTech - Your AI Skincare Assistant
    `.trim()

    const recurrence =
      routine.frequency === "daily"
        ? ["RRULE:FREQ=DAILY"]
        : routine.frequency === "weekly"
        ? ["RRULE:FREQ=WEEKLY"]
        : []

    const calendarEvent: CalendarEvent = {
      summary: `🧴 ${routine.name}`,
      description,
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: "Asia/Jakarta",
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: "Asia/Jakarta",
      },
      recurrence,
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 15 },
          { method: "email", minutes: 60 },
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: calendarEvent,
    })

    if (userId) {
      await saveRoutineToDatabase(routine, userId, response.data.id || "")
    }

    return NextResponse.json({
      success: true,
      message: `Routine "${routine.name}" added to Google Calendar.`,
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      routine,
    })
  } catch (error) {
    console.error("Calendar API error:", error)

    let errorMessage = "Failed to create calendar event"

    if (error instanceof Error) {
      if (/unauthorized/i.test(error.message)) {
        errorMessage = "Please authorize GlowTech to access your Google Calendar."
      } else if (/quota/i.test(error.message)) {
        errorMessage = "Google Calendar API quota exceeded. Try again later."
      } else if (/network/i.test(error.message)) {
        errorMessage = "Network error. Please check your connection and try again."
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        demo: {
          success: true,
          message: `Demo: Skincare routine would be scheduled at ${new Date().toLocaleString()}`,
        },
      },
      { status: 500 }
    )
  }
}

async function saveRoutineToDatabase(routine: SkincareRoutine, userId: string, eventId: string) {
  try {
    const { supabase } = await import("../../../lib/supabase")

    const { error } = await supabase.from("skincare_routines").insert({
      user_id: userId,
      name: routine.name,
      steps: routine.steps,
      scheduled_time: routine.scheduledTime,
      frequency: routine.frequency,
      google_event_id: eventId,
      is_active: true,
    })

    if (error) console.error("Supabase insert error:", error)
  } catch (err) {
    console.error("Supabase saveRoutineToDatabase error:", err)
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 })
    }

    const { supabase } = await import("../../../lib/supabase")

    const { data: routines, error } = await supabase
      .from("skincare_routines")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ routines })
  } catch (error) {
    console.error("GET routines error:", error)
    return NextResponse.json({ error: "Failed to fetch routines" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const routineId = searchParams.get("routineId")
    const userId = searchParams.get("userId")

    if (!routineId || !userId) {
      return NextResponse.json({ error: "Routine ID and User ID required" }, { status: 400 })
    }

    const { supabase } = await import("../../../lib/supabase")

    const { data: routine, error: fetchError } = await supabase
      .from("skincare_routines")
      .select("google_event_id")
      .eq("id", routineId)
      .eq("user_id", userId)
      .single()

    if (fetchError) throw fetchError

    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env

    if (routine?.google_event_id && GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_REFRESH_TOKEN) {
      try {
        const oauth2Client = new google.auth.OAuth2(
          GOOGLE_CLIENT_ID,
          GOOGLE_CLIENT_SECRET,
          GOOGLE_REDIRECT_URI || "http://localhost:3000/auth/callback"
        )
        oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN })
        const calendar = google.calendar({ version: "v3", auth: oauth2Client })

        await calendar.events.delete({
          calendarId: "primary",
          eventId: routine.google_event_id,
        })
      } catch (calendarError) {
        console.error("Google Calendar delete error:", calendarError)
      }
    }

    const { error: deleteError } = await supabase
      .from("skincare_routines")
      .delete()
      .eq("id", routineId)
      .eq("user_id", userId)

    if (deleteError) throw deleteError

    return NextResponse.json({ success: true, message: "Routine deleted successfully" })
  } catch (error) {
    console.error("DELETE routine error:", error)
    return NextResponse.json({ error: "Failed to delete routine" }, { status: 500 })
  }
}
