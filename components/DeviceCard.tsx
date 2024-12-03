'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"
import { Device } from "../types"

interface DeviceCardProps {
  device: Device
  onDelete: (id: string) => void
}

export default function DeviceCard({ device, onDelete }: DeviceCardProps) {
  const router = useRouter()

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/devices/${device.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete device')
      }

      onDelete(device.id)
    } catch (error) {
      console.error('Error deleting device:', error)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>{device.name}</CardTitle>
        <CardDescription>Last accessed: {new Date(device.lastAccessed).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Device ID: {device.id}</p>
        <p className="text-sm text-muted-foreground">Browser: {device.browser}</p>
        <p className="text-sm text-muted-foreground">OS: {device.os}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button
          variant="destructive"
          onClick={handleDelete}
        >
          Remove Device
        </Button>
      </CardFooter>
    </Card>
  )
}
