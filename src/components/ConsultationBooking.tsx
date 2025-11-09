import React, { useState, useEffect } from 'react';
import { Video, Calendar, Clock, Star, CheckCircle, User, ArrowLeft, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ConsultationBookingProps {
  trialId?: string;
  accessToken: string;
  onBack: () => void;
  subscriptionTier: string;
}

export function ConsultationBooking({ trialId, accessToken, onBack, subscriptionTier }: ConsultationBookingProps) {
  const [consultants, setConsultants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsultant, setSelectedConsultant] = useState<any>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [booking, setBooking] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    fetchConsultants();
    fetchBookings();
  }, []);

  const fetchConsultants = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/consultants`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch consultants');
      }

      const data = await response.json();
      setConsultants(data.consultants);
    } catch (error) {
      console.error('Error fetching consultants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/consultations`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const openBookingDialog = (consultant: any) => {
    setSelectedConsultant(consultant);
    setBookingDialogOpen(true);
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleBookConsultation = async () => {
    if (!selectedConsultant || !selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }

    setBooking(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/book-consultation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            consultantId: selectedConsultant.id,
            date: selectedDate,
            time: selectedTime,
            trialId: trialId || 'general'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to book consultation');
      }

      const data = await response.json();
      alert(`Consultation booked successfully!\n\nZoom Link: ${data.zoomLink}\n\nYou will receive a confirmation email with calendar invite.`);
      setBookingDialogOpen(false);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error booking consultation:', error);
      alert('Failed to book consultation. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  // Check if user has Expert tier access
  if (subscriptionTier !== 'expert') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card className="border-2 border-green-500">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>Expert Consultation Booking</CardTitle>
                  <Badge className="bg-green-600 text-white mt-1">Expert Feature</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-gray-700">
                Book 30-minute Zoom consultations with medical professionals by upgrading to our Expert plan.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Expert Plan includes:</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    • 30-minute consultations with 6 medical professionals
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • Personalized trial feedback and recommendations
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • Grant Funding Matchmaker with AI proposals
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • All Pro features including Hospital Matching
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    • Dedicated account manager and white-glove onboarding
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" onClick={onBack} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-800 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading consultants...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-700 text-white p-8 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-8 h-8" />
            <h2>Expert Consultation Booking</h2>
          </div>
          <p className="text-green-100">
            Book a 30-minute Zoom consultation with our medical professional experts to get personalized feedback on your trial
          </p>
        </div>

      {/* Existing Bookings */}
      {bookings.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Your Upcoming Consultations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bookings.map((booking) => {
                const consultant = consultants.find(c => c.id === booking.consultantId);
                return (
                  <div key={booking.bookingId} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {consultant && (
                        <>
                          <ImageWithFallback
                            src={consultant.photo}
                            alt={consultant.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-green-900">{consultant.name}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(booking.date).toLocaleDateString()} at {booking.time}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <Badge className="bg-green-600 text-white">Confirmed</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Consultants */}
      <div>
        <h3 className="text-green-800 mb-4">Available Consultants</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {consultants.map((consultant) => (
            <Card key={consultant.id} className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex gap-4">
                  <ImageWithFallback
                    src={consultant.photo}
                    alt={consultant.name}
                    className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-green-800 mb-1">{consultant.name}</CardTitle>
                    <CardDescription className="mb-2">{consultant.title}</CardDescription>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{consultant.rating}</span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600">{consultant.consultations} consultations</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Specialty</label>
                  <p className="text-sm text-gray-900">{consultant.specialty}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Experience</label>
                  <p className="text-sm text-gray-900">{consultant.experience}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Credentials</label>
                  <p className="text-sm text-gray-900">{consultant.credentials}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Bio</label>
                  <p className="text-sm text-gray-700">{consultant.bio}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    {consultant.expertise.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="border-green-300 text-green-800">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Availability</label>
                  <div className="flex flex-wrap gap-2">
                    {consultant.availability.map((slot: string, idx: number) => (
                      <Badge key={idx} className="bg-green-100 text-green-800">
                        <Clock className="w-3 h-3 mr-1" />
                        {slot}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full"
                  onClick={() => openBookingDialog(consultant)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Consultation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-800">Book Consultation</DialogTitle>
            <DialogDescription>
              Schedule a 30-minute Zoom consultation with {selectedConsultant?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedConsultant && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <ImageWithFallback
                  src={selectedConsultant.photo}
                  alt={selectedConsultant.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-green-900">{selectedConsultant.name}</p>
                  <p className="text-sm text-gray-600">{selectedConsultant.specialty}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="date" className="text-green-800">Select Date</Label>
                <input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-green-800">Select Time Slot</Label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Choose a time...</option>
                  {selectedConsultant.availability.map((slot: string) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900">
                  You'll receive a Zoom link and calendar invite via email after booking.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
              disabled={booking}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBookConsultation}
              disabled={booking || !selectedDate || !selectedTime}
            >
              {booking ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
