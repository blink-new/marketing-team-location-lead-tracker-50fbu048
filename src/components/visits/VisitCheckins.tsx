import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Camera, MapPin, Clock, Plus, Image } from 'lucide-react'
import { Visit } from '@/types'
import { blink } from '@/blink/client'

interface VisitCheckinsProps {
  visits: Visit[]
  onVisitAdded: () => void
}

export function VisitCheckins({ visits, onVisitAdded }: VisitCheckinsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    locationName: '',
    notes: '',
    photo: null as File | null
  })

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, photo: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.locationName) return

    setIsSubmitting(true)
    try {
      const user = await blink.auth.me()
      
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      let photoUrl = ''
      if (formData.photo) {
        const { publicUrl } = await blink.storage.upload(
          formData.photo,
          `visits/${Date.now()}-${formData.photo.name}`,
          { upsert: true }
        )
        photoUrl = publicUrl
      }

      // Create visit record
      await blink.db.visits.create({
        id: `visit_${Date.now()}`,
        userId: user.id,
        teamMemberId: user.id, // For demo, using current user as team member
        locationName: formData.locationName,
        locationLat: position.coords.latitude,
        locationLng: position.coords.longitude,
        photoUrl,
        notes: formData.notes,
        visitTime: new Date().toISOString()
      })

      // Create activity record
      await blink.db.activities.create({
        id: `activity_${Date.now()}`,
        userId: user.id,
        teamMemberId: user.id,
        activityType: 'visit',
        title: `Visit to ${formData.locationName}`,
        description: formData.notes || 'Visit completed with photo verification',
        relatedId: `visit_${Date.now()}`
      })

      setFormData({ locationName: '', notes: '', photo: null })
      setIsDialogOpen(false)
      onVisitAdded()
    } catch (error) {
      console.error('Error creating visit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visit Check-ins</h2>
          <p className="text-gray-600">Photo-verified visits from your marketing team</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Visit Check-in
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Visit Check-in</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="location">Location Name</Label>
                <Input
                  id="location"
                  value={formData.locationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                  placeholder="e.g., ABC Company Office"
                  required
                />
              </div>

              <div>
                <Label htmlFor="photo">Photo Verification</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="photo"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('photo')?.click()}
                    className="w-full"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    {formData.photo ? 'Photo Captured' : 'Take Photo'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes about this visit..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Recording...' : 'Record Visit'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visits.map((visit) => (
          <Card key={visit.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{visit.locationName}</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Verified
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {visit.photoUrl && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={visit.photoUrl} 
                    alt="Visit photo"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  {new Date(visit.visitTime).toLocaleString()}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  {visit.locationLat.toFixed(4)}, {visit.locationLng.toFixed(4)}
                </div>
              </div>

              {visit.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{visit.notes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <MapPin className="mr-2 h-3 w-3" />
                  View Location
                </Button>
                {visit.photoUrl && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Image className="mr-2 h-3 w-3" />
                    View Photo
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {visits.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No visits recorded</h3>
            <p className="text-gray-600 text-center">
              Start recording visit check-ins with photo verification to track team activities.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}