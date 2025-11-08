import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';
import { Building2, Users, Microscope, Stethoscope, CheckCircle, Loader2, MapPin, Award } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Hospital {
  id: string;
  name: string;
  location: string;
  type: string;
  interested: boolean;
  specialties: string[];
  patientPopulation: {
    total: string;
    demographics: string;
    relevantConditions: string;
  };
  equipment: {
    imaging: string;
    lab: string;
    specialized: string;
  };
  staffCapacity: {
    physicians: string;
    nurses: string;
    coordinators: string;
    support: string;
  };
  trials: {
    current: number;
    completed: number;
    capacity: string;
  };
  matchScore: number;
  notes: string;
}

interface HospitalMatchingProgramProps {
  accessToken: string;
  trialId: string;
  trialTitle: string;
  therapeuticArea?: string;
  indication?: string;
}

export function HospitalMatchingProgram({ 
  accessToken, 
  trialId, 
  trialTitle, 
  therapeuticArea, 
  indication 
}: HospitalMatchingProgramProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingInvites, setSendingInvites] = useState<Set<string>>(new Set());
  const [sentInvites, setSentInvites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadHospitals();
  }, [therapeuticArea, indication]);

  const loadHospitals = async () => {
    try {
      const params = new URLSearchParams();
      if (therapeuticArea) params.append('therapeuticArea', therapeuticArea);
      if (indication) params.append('indication', indication);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/hospitals?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load hospitals');
      }

      setHospitals(data.hospitals);
    } catch (err: any) {
      console.error('Error loading hospitals:', err);
      toast.error('Failed to load hospital matches');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMatchInvitation = async (hospital: Hospital) => {
    setSendingInvites(prev => new Set(prev).add(hospital.id));

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/match-invitation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            hospitalId: hospital.id,
            trialId,
            trialTitle
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation');
      }

      setSentInvites(prev => new Set(prev).add(hospital.id));
      toast.success(`Match invitation sent to ${hospital.name}!`, {
        description: 'The site will receive your trial details and can respond with their interest.'
      });
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      toast.error('Failed to send invitation', {
        description: err.message || 'Please try again'
      });
    } finally {
      setSendingInvites(prev => {
        const newSet = new Set(prev);
        newSet.delete(hospital.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="mt-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-green-700" />
            <CardTitle>Hospital/Clinic Matching Program</CardTitle>
          </div>
          <CardDescription>
            Finding suitable research sites for your clinical trial...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6 text-green-700" />
          <CardTitle>Hospital/Clinic Matching Program</CardTitle>
        </div>
        <CardDescription>
          Based on your trial's high feasibility score (85%+), we've identified hospitals and clinics interested in hosting clinical trials that match your research criteria. Click "Match" to send an invitation to the site.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hospitals.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No matching hospitals or clinics found for the specified criteria.
          </p>
        ) : (
          <div className="space-y-6">
            {hospitals.map((hospital) => {
              const isSending = sendingInvites.has(hospital.id);
              const isSent = sentInvites.has(hospital.id);

              return (
                <Card key={hospital.id} className="border border-gray-200 hover:border-green-300 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{hospital.name}</CardTitle>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            {hospital.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {hospital.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {hospital.type}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => sendMatchInvitation(hospital)}
                        disabled={isSending || isSent}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : isSent ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Invited
                          </>
                        ) : (
                          'Match'
                        )}
                      </Button>
                    </div>
                    {hospital.notes && (
                      <p className="text-sm text-green-800 bg-green-50 p-2 rounded border border-green-200 mt-3">
                        {hospital.notes}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Specialties */}
                    <div>
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-green-600" />
                        Specialties
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {hospital.specialties.map((specialty, idx) => (
                          <Badge key={idx} variant="outline" className="bg-white">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Patient Population */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2 text-blue-900">
                        <Users className="w-4 h-4" />
                        Available Patient Population
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Total:</span> {hospital.patientPopulation.total}</p>
                        <p><span className="font-medium">Demographics:</span> {hospital.patientPopulation.demographics}</p>
                        <p className="text-blue-800 font-medium">
                          <span className="font-medium">Relevant Patients:</span> {hospital.patientPopulation.relevantConditions}
                        </p>
                      </div>
                    </div>

                    {/* Equipment & Facilities */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2 text-purple-900">
                        <Microscope className="w-4 h-4" />
                        Equipment & Facilities
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Imaging:</span> {hospital.equipment.imaging}</p>
                        <p><span className="font-medium">Laboratory:</span> {hospital.equipment.lab}</p>
                        <p><span className="font-medium">Specialized:</span> {hospital.equipment.specialized}</p>
                      </div>
                    </div>

                    {/* Staff Capacity */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h5 className="text-sm font-semibold mb-2 flex items-center gap-2 text-green-900">
                        <Building2 className="w-4 h-4" />
                        Staff Capacity
                      </h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Physicians:</span> {hospital.staffCapacity.physicians}</p>
                        <p><span className="font-medium">Clinical Research Nurses:</span> {hospital.staffCapacity.nurses}</p>
                        <p><span className="font-medium">Research Coordinators:</span> {hospital.staffCapacity.coordinators}</p>
                        <p><span className="font-medium">Support Staff:</span> {hospital.staffCapacity.support}</p>
                      </div>
                    </div>

                    {/* Trial Experience */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white border border-gray-200 rounded p-3 text-center">
                        <p className="text-2xl text-green-700">{hospital.trials.current}</p>
                        <p className="text-xs text-gray-600">Current Trials</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded p-3 text-center">
                        <p className="text-2xl text-green-700">{hospital.trials.completed}</p>
                        <p className="text-xs text-gray-600">Completed Trials</p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded p-3 text-center">
                        <p className="text-xs text-gray-600 mb-1">Capacity</p>
                        <p className="text-sm font-medium text-green-700">{hospital.trials.capacity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
