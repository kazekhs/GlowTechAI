"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar } from "lucide-react"

interface RoutineSchedulerProps {
  onClose: () => void
}

export function RoutineScheduler({ onClose }: RoutineSchedulerProps) {
  const [routineName, setRoutineName] = useState("")
  const [steps, setSteps] = useState("")
  const [time, setTime] = useState("")
  const [frequency, setFrequency] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSchedule = async () => {
    if (!routineName || !steps || !time || !frequency) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          routine: {
            name: routineName,
            steps: steps.split("\n").filter((step) => step.trim()),
            scheduledTime: new Date(`${new Date().toDateString()} ${time}`).toISOString(),
            frequency,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        })
        onClose()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule routine",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Skincare Routine
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="routineName">Routine Name</Label>
            <Input
              id="routineName"
              placeholder="e.g., Morning Skincare"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="steps">Routine Steps</Label>
            <Textarea
              id="steps"
              placeholder="Enter each step on a new line:&#10;1. Cleanser&#10;2. Toner&#10;3. Serum&#10;4. Moisturizer"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={loading} className="flex-1">
              {loading ? "Scheduling..." : "Schedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
