import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { projectId } from '../utils/supabase/info';
import { getFreshAccessToken } from '../utils/supabase/auth';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle } from 'lucide-react';

interface ClinicalTrialFormProps {
  accessToken: string;
  medicalProfessionalData: any;
  onBack: () => void;
  onSubmitSuccess: (trialId: string) => void;
  onShowTerms: () => void;
  initialData?: any;
}

export function ClinicalTrialForm({ accessToken, medicalProfessionalData, onBack, onSubmitSuccess, onShowTerms, initialData }: ClinicalTrialFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dataReviewPermission, setDataReviewPermission] = useState(false);
  const [feedbackConsent, setFeedbackConsent] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Study Information
    studyTitle: initialData?.studyTitle || '',
    researchQuestion: initialData?.researchQuestion || '',
    backgroundRationale: initialData?.backgroundRationale || '',
    studyPhase: initialData?.studyPhase || '',
    therapeuticArea: initialData?.therapeuticArea || '',
    indication: initialData?.indication || '',
    
    // Study Design
    studyDesign: initialData?.studyDesign || '',
    controlType: initialData?.controlType || '',
    blinding: initialData?.blinding || '',
    randomization: initialData?.randomization || '',
    treatmentArms: initialData?.treatmentArms || '',
    
    // Patient Population
    targetPopulation: initialData?.targetPopulation || '',
    inclusionCriteria: initialData?.inclusionCriteria || '',
    exclusionCriteria: initialData?.exclusionCriteria || '',
    studySize: initialData?.studySize || '',
    ageRange: initialData?.ageRange || '',
    gender: initialData?.gender || '',
    
    // Intervention Details
    interventionType: initialData?.interventionType || '',
    interventionDescription: initialData?.interventionDescription || '',
    dosage: initialData?.dosage || '',
    route: initialData?.route || '',
    frequency: initialData?.frequency || '',
    treatmentDuration: initialData?.treatmentDuration || '',
    comparator: initialData?.comparator || '',
    
    // Endpoints and Outcomes
    primaryEndpoint: initialData?.primaryEndpoint || '',
    secondaryEndpoints: initialData?.secondaryEndpoints || '',
    safetyEndpoints: initialData?.safetyEndpoints || '',
    outcomeAssessment: initialData?.outcomeAssessment || '',
    
    // Timeline
    enrollmentDuration: initialData?.enrollmentDuration || '',
    treatmentPeriod: initialData?.treatmentPeriod || '',
    followUpDuration: initialData?.followUpDuration || '',
    totalStudyDuration: initialData?.totalStudyDuration || '',
    anticipatedStartDate: initialData?.anticipatedStartDate || '',
    
    // Budget and Resources
    estimatedTotalBudget: initialData?.estimatedTotalBudget || '',
    perPatientCost: initialData?.perPatientCost || '',
    fundingSource: initialData?.fundingSource || '',
    budgetJustification: initialData?.budgetJustification || '',
    
    // Sites and Infrastructure
    numberOfSites: initialData?.numberOfSites || '',
    siteLocations: initialData?.siteLocations || '',
    siteCapabilities: initialData?.siteCapabilities || '',
    equipmentNeeded: initialData?.equipmentNeeded || '',
    
    // Statistical Considerations
    statisticalMethod: initialData?.statisticalMethod || '',
    powerAnalysis: initialData?.powerAnalysis || '',
    sampleSizeJustification: initialData?.sampleSizeJustification || '',
    interimAnalysis: initialData?.interimAnalysis || '',
    
    // Regulatory and Ethics
    regulatoryPath: initialData?.regulatoryPath || '',
    irbStatus: initialData?.irbStatus || '',
    indStatus: initialData?.indStatus || '',
    dataMonitoring: initialData?.dataMonitoring || '',
    
    // Safety and Monitoring
    adverseEventMonitoring: initialData?.adverseEventMonitoring || '',
    stoppingRules: initialData?.stoppingRules || '',
    dataSafetyMonitoring: initialData?.dataSafetyMonitoring || '',
    riskMitigation: initialData?.riskMitigation || '',
    
    // Data Management
    dataCollectionMethod: initialData?.dataCollectionMethod || '',
    dataStorageSecurity: initialData?.dataStorageSecurity || '',
    qualityControl: initialData?.qualityControl || '',
    
    // Additional Information
    previousStudies: initialData?.previousStudies || '',
    scientificRationale: initialData?.scientificRationale || '',
    clinicalSignificance: initialData?.clinicalSignificance || '',
    feasibilityConcerns: initialData?.feasibilityConcerns || '',
    additionalNotes: initialData?.additionalNotes || ''
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dataReviewPermission) {
      setError('You must grant permission for employee data review to submit the form.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      console.log('=== CLIENT: Submitting trial ===');
      
      // Get fresh access token
      const freshToken = await getFreshAccessToken();
      if (!freshToken) {
        throw new Error('Unable to get valid access token. Please log in again.');
      }
      console.log('Fresh token obtained for submission');
      
      const completeData = {
        ...medicalProfessionalData,
        ...formData,
        feedbackConsent
      };
      console.log('Complete data keys:', Object.keys(completeData));

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f5a2c76d/trials`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${freshToken}`
          },
          body: JSON.stringify(completeData)
        }
      );

      console.log('Submit response status:', response.status);
      const data = await response.json();
      console.log('Submit response data:', data);

      if (!response.ok) {
        console.error('Server error response:', data);
        throw new Error(data.error || 'Failed to submit trial');
      }

      console.log('Trial submitted successfully! Trial ID:', data.trialId);
      console.log('Calling onSubmitSuccess with trial ID:', data.trialId);
      onSubmitSuccess(data.trialId);
    } catch (err: any) {
      console.error('=== CLIENT ERROR submitting trial ===');
      console.error('Error submitting trial:', err);
      console.error('Complete error object:', JSON.stringify(err, null, 2));
      setError(err.message || 'Failed to submit trial for assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pb-44">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={onBack} className="mb-6 text-green-700 hover:text-green-900 hover:bg-green-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">New Clinical Trial Assessment</h1>
              <p className="text-gray-600">Step 2 of 2: Clinical Trial Information</p>
            </div>
            <div className="flex gap-2">
              <div className="w-12 h-2 bg-green-600 rounded"></div>
              <div className="w-12 h-2 bg-green-600 rounded"></div>
            </div>
          </div>
        </div>

        {initialData && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>Document Parsed Successfully!</strong> The form has been pre-filled with data extracted from your uploaded document. 
              Please review all fields and complete any missing information before submitting.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Study Information */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Basic Study Information</CardTitle>
              <CardDescription>Core details about your clinical trial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="studyTitle">Study Title *</Label>
                <Input
                  id="studyTitle"
                  placeholder="A Phase II Study of..."
                  value={formData.studyTitle}
                  onChange={(e) => handleChange('studyTitle', e.target.value)}
                  required
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyPhase">Study Phase *</Label>
                  <Select value={formData.studyPhase} onValueChange={(value) => handleChange('studyPhase', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phase 1">Phase 1</SelectItem>
                      <SelectItem value="Phase 2">Phase 2</SelectItem>
                      <SelectItem value="Phase 3">Phase 3</SelectItem>
                      <SelectItem value="Phase 4">Phase 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="therapeuticArea">Therapeutic Area *</Label>
                  <Select value={formData.therapeuticArea} onValueChange={(value) => handleChange('therapeuticArea', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oncology">Oncology</SelectItem>
                      <SelectItem value="Cardiology">Cardiology</SelectItem>
                      <SelectItem value="Neurology">Neurology</SelectItem>
                      <SelectItem value="Immunology">Immunology</SelectItem>
                      <SelectItem value="Infectious Disease">Infectious Disease</SelectItem>
                      <SelectItem value="Endocrinology">Endocrinology</SelectItem>
                      <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                      <SelectItem value="Respiratory">Respiratory</SelectItem>
                      <SelectItem value="Hematology">Hematology</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="indication">Indication/Disease *</Label>
                  <Input
                    id="indication"
                    placeholder="e.g., NSCLC, Type 2 Diabetes"
                    value={formData.indication}
                    onChange={(e) => handleChange('indication', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="researchQuestion">Research Question/Hypothesis *</Label>
                <Textarea
                  id="researchQuestion"
                  placeholder="What is the primary research question your trial aims to answer?"
                  value={formData.researchQuestion}
                  onChange={(e) => handleChange('researchQuestion', e.target.value)}
                  required
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundRationale">Background and Rationale *</Label>
                <Textarea
                  id="backgroundRationale"
                  placeholder="Provide the scientific background, rationale, and preliminary data supporting your study..."
                  value={formData.backgroundRationale}
                  onChange={(e) => handleChange('backgroundRationale', e.target.value)}
                  required
                  rows={6}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Study Design */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Study Design</CardTitle>
              <CardDescription>Methodology and design parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studyDesign">Study Design *</Label>
                  <Select value={formData.studyDesign} onValueChange={(value) => handleChange('studyDesign', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select design" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Randomized Controlled Trial">Randomized Controlled Trial</SelectItem>
                      <SelectItem value="Open Label">Open Label</SelectItem>
                      <SelectItem value="Single Arm">Single Arm</SelectItem>
                      <SelectItem value="Crossover">Crossover</SelectItem>
                      <SelectItem value="Adaptive">Adaptive Design</SelectItem>
                      <SelectItem value="Basket Trial">Basket Trial</SelectItem>
                      <SelectItem value="Umbrella Trial">Umbrella Trial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="controlType">Control Type *</Label>
                  <Select value={formData.controlType} onValueChange={(value) => handleChange('controlType', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select control" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Placebo">Placebo</SelectItem>
                      <SelectItem value="Active Comparator">Active Comparator</SelectItem>
                      <SelectItem value="Standard of Care">Standard of Care</SelectItem>
                      <SelectItem value="Historical Control">Historical Control</SelectItem>
                      <SelectItem value="No Control">No Control</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blinding">Blinding *</Label>
                  <Select value={formData.blinding} onValueChange={(value) => handleChange('blinding', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select blinding" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Double Blind">Double Blind</SelectItem>
                      <SelectItem value="Single Blind">Single Blind</SelectItem>
                      <SelectItem value="Triple Blind">Triple Blind</SelectItem>
                      <SelectItem value="Open Label">Open Label</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="randomization">Randomization</Label>
                  <Input
                    id="randomization"
                    placeholder="e.g., 1:1, stratified by age"
                    value={formData.randomization}
                    onChange={(e) => handleChange('randomization', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="treatmentArms">Treatment Arms</Label>
                <Input
                  id="treatmentArms"
                  placeholder="e.g., Arm A: Experimental, Arm B: Control"
                  value={formData.treatmentArms}
                  onChange={(e) => handleChange('treatmentArms', e.target.value)}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient Population */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Patient Population</CardTitle>
              <CardDescription>Target population and eligibility criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="targetPopulation">Target Population *</Label>
                <Textarea
                  id="targetPopulation"
                  placeholder="Describe the target patient population..."
                  value={formData.targetPopulation}
                  onChange={(e) => handleChange('targetPopulation', e.target.value)}
                  required
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inclusionCriteria">Inclusion Criteria *</Label>
                <Textarea
                  id="inclusionCriteria"
                  placeholder="List key inclusion criteria (one per line)..."
                  value={formData.inclusionCriteria}
                  onChange={(e) => handleChange('inclusionCriteria', e.target.value)}
                  required
                  rows={5}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exclusionCriteria">Exclusion Criteria *</Label>
                <Textarea
                  id="exclusionCriteria"
                  placeholder="List key exclusion criteria (one per line)..."
                  value={formData.exclusionCriteria}
                  onChange={(e) => handleChange('exclusionCriteria', e.target.value)}
                  required
                  rows={5}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studySize">Target Sample Size *</Label>
                  <Input
                    id="studySize"
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.studySize}
                    onChange={(e) => handleChange('studySize', e.target.value)}
                    required
                    min="1"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ageRange">Age Range</Label>
                  <Input
                    id="ageRange"
                    placeholder="e.g., 18-75 years"
                    value={formData.ageRange}
                    onChange={(e) => handleChange('ageRange', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Intervention Details */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Intervention Details</CardTitle>
              <CardDescription>Treatment and intervention specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="interventionType">Intervention Type *</Label>
                <Select value={formData.interventionType} onValueChange={(value) => handleChange('interventionType', value)} required>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Drug">Drug/Medication</SelectItem>
                    <SelectItem value="Biological">Biological/Vaccine</SelectItem>
                    <SelectItem value="Device">Device</SelectItem>
                    <SelectItem value="Procedure">Procedure/Surgery</SelectItem>
                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                    <SelectItem value="Combination">Combination Therapy</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="interventionDescription">Intervention Description *</Label>
                <Textarea
                  id="interventionDescription"
                  placeholder="Detailed description of the intervention..."
                  value={formData.interventionDescription}
                  onChange={(e) => handleChange('interventionDescription', e.target.value)}
                  required
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage/Dose Level</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 100mg"
                    value={formData.dosage}
                    onChange={(e) => handleChange('dosage', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="route">Route of Administration</Label>
                  <Select value={formData.route} onValueChange={(value) => handleChange('route', value)}>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="IV">Intravenous (IV)</SelectItem>
                      <SelectItem value="IM">Intramuscular (IM)</SelectItem>
                      <SelectItem value="SC">Subcutaneous (SC)</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Inhalation">Inhalation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Once daily"
                    value={formData.frequency}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treatmentDuration">Treatment Duration</Label>
                  <Input
                    id="treatmentDuration"
                    placeholder="e.g., 12 weeks"
                    value={formData.treatmentDuration}
                    onChange={(e) => handleChange('treatmentDuration', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comparator">Comparator/Control Treatment</Label>
                  <Input
                    id="comparator"
                    placeholder="e.g., Standard of care, placebo"
                    value={formData.comparator}
                    onChange={(e) => handleChange('comparator', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endpoints and Outcomes */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Endpoints and Outcomes</CardTitle>
              <CardDescription>Primary and secondary outcome measures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="primaryEndpoint">Primary Endpoint *</Label>
                <Textarea
                  id="primaryEndpoint"
                  placeholder="Clearly define the primary endpoint and how it will be measured..."
                  value={formData.primaryEndpoint}
                  onChange={(e) => handleChange('primaryEndpoint', e.target.value)}
                  required
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondaryEndpoints">Secondary Endpoints</Label>
                <Textarea
                  id="secondaryEndpoints"
                  placeholder="List secondary endpoints (one per line)..."
                  value={formData.secondaryEndpoints}
                  onChange={(e) => handleChange('secondaryEndpoints', e.target.value)}
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyEndpoints">Safety Endpoints</Label>
                <Textarea
                  id="safetyEndpoints"
                  placeholder="List safety endpoints and monitoring parameters..."
                  value={formData.safetyEndpoints}
                  onChange={(e) => handleChange('safetyEndpoints', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcomeAssessment">Outcome Assessment Methods</Label>
                <Textarea
                  id="outcomeAssessment"
                  placeholder="Describe how outcomes will be assessed and measured..."
                  value={formData.outcomeAssessment}
                  onChange={(e) => handleChange('outcomeAssessment', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Timeline</CardTitle>
              <CardDescription>Study duration and key milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDuration">Enrollment Duration *</Label>
                  <Input
                    id="enrollmentDuration"
                    placeholder="e.g., 6 months"
                    value={formData.enrollmentDuration}
                    onChange={(e) => handleChange('enrollmentDuration', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatmentPeriod">Treatment Period</Label>
                  <Input
                    id="treatmentPeriod"
                    placeholder="e.g., 12 weeks"
                    value={formData.treatmentPeriod}
                    onChange={(e) => handleChange('treatmentPeriod', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="followUpDuration">Follow-up Duration</Label>
                  <Input
                    id="followUpDuration"
                    placeholder="e.g., 3 months"
                    value={formData.followUpDuration}
                    onChange={(e) => handleChange('followUpDuration', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalStudyDuration">Total Study Duration *</Label>
                  <Input
                    id="totalStudyDuration"
                    placeholder="e.g., 24 months"
                    value={formData.totalStudyDuration}
                    onChange={(e) => handleChange('totalStudyDuration', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anticipatedStartDate">Anticipated Start Date</Label>
                <Input
                  id="anticipatedStartDate"
                  type="date"
                  value={formData.anticipatedStartDate}
                  onChange={(e) => handleChange('anticipatedStartDate', e.target.value)}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Budget and Resources */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Budget and Resources</CardTitle>
              <CardDescription>Financial planning and resource requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTotalBudget">Estimated Total Budget *</Label>
                  <Input
                    id="estimatedTotalBudget"
                    placeholder="e.g., $2,000,000"
                    value={formData.estimatedTotalBudget}
                    onChange={(e) => handleChange('estimatedTotalBudget', e.target.value)}
                    required
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perPatientCost">Per Patient Cost Estimate</Label>
                  <Input
                    id="perPatientCost"
                    placeholder="e.g., $15,000"
                    value={formData.perPatientCost}
                    onChange={(e) => handleChange('perPatientCost', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fundingSource">Funding Source *</Label>
                <Select value={formData.fundingSource} onValueChange={(value) => handleChange('fundingSource', value)} required>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select funding source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NIH Grant">NIH Grant</SelectItem>
                    <SelectItem value="Industry Sponsor">Industry Sponsor</SelectItem>
                    <SelectItem value="Foundation Grant">Foundation Grant</SelectItem>
                    <SelectItem value="Institutional Funding">Institutional Funding</SelectItem>
                    <SelectItem value="Multiple Sources">Multiple Sources</SelectItem>
                    <SelectItem value="To Be Determined">To Be Determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budgetJustification">Budget Justification</Label>
                <Textarea
                  id="budgetJustification"
                  placeholder="Provide justification for major budget items..."
                  value={formData.budgetJustification}
                  onChange={(e) => handleChange('budgetJustification', e.target.value)}
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Sites and Infrastructure */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Sites and Infrastructure</CardTitle>
              <CardDescription>Clinical sites and facility requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfSites">Number of Sites *</Label>
                  <Input
                    id="numberOfSites"
                    type="number"
                    placeholder="e.g., 5"
                    value={formData.numberOfSites}
                    onChange={(e) => handleChange('numberOfSites', e.target.value)}
                    required
                    min="1"
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteLocations">Site Locations</Label>
                  <Input
                    id="siteLocations"
                    placeholder="e.g., US, Europe, Asia"
                    value={formData.siteLocations}
                    onChange={(e) => handleChange('siteLocations', e.target.value)}
                    className="border-green-200 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteCapabilities">Site Capabilities Required</Label>
                <Textarea
                  id="siteCapabilities"
                  placeholder="Describe required site capabilities, certifications, and infrastructure..."
                  value={formData.siteCapabilities}
                  onChange={(e) => handleChange('siteCapabilities', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipmentNeeded">Special Equipment/Resources Needed</Label>
                <Textarea
                  id="equipmentNeeded"
                  placeholder="List any special equipment, laboratory facilities, or resources required..."
                  value={formData.equipmentNeeded}
                  onChange={(e) => handleChange('equipmentNeeded', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Statistical Considerations */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Statistical Considerations</CardTitle>
              <CardDescription>Statistical methods and analysis plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="statisticalMethod">Statistical Methods *</Label>
                <Textarea
                  id="statisticalMethod"
                  placeholder="Describe the statistical methods and tests to be used..."
                  value={formData.statisticalMethod}
                  onChange={(e) => handleChange('statisticalMethod', e.target.value)}
                  required
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerAnalysis">Power Analysis</Label>
                <Textarea
                  id="powerAnalysis"
                  placeholder="Describe the power analysis and assumptions (effect size, alpha, power)..."
                  value={formData.powerAnalysis}
                  onChange={(e) => handleChange('powerAnalysis', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleSizeJustification">Sample Size Justification *</Label>
                <Textarea
                  id="sampleSizeJustification"
                  placeholder="Provide detailed justification for the chosen sample size..."
                  value={formData.sampleSizeJustification}
                  onChange={(e) => handleChange('sampleSizeJustification', e.target.value)}
                  required
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interimAnalysis">Interim Analysis Plan</Label>
                <Textarea
                  id="interimAnalysis"
                  placeholder="Describe any planned interim analyses and stopping rules..."
                  value={formData.interimAnalysis}
                  onChange={(e) => handleChange('interimAnalysis', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Regulatory and Ethics */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Regulatory and Ethics</CardTitle>
              <CardDescription>Regulatory pathway and ethical approvals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="regulatoryPath">Regulatory Pathway *</Label>
                  <Select value={formData.regulatoryPath} onValueChange={(value) => handleChange('regulatoryPath', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select pathway" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IND">IND (Investigational New Drug)</SelectItem>
                      <SelectItem value="IDE">IDE (Investigational Device Exemption)</SelectItem>
                      <SelectItem value="IND/IDE">IND/IDE Combination</SelectItem>
                      <SelectItem value="Exempt">Exempt</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irbStatus">IRB Status *</Label>
                  <Select value={formData.irbStatus} onValueChange={(value) => handleChange('irbStatus', value)} required>
                    <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not submitted">Not Submitted</SelectItem>
                      <SelectItem value="In preparation">In Preparation</SelectItem>
                      <SelectItem value="Submitted">Submitted</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Approved with modifications">Approved with Modifications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indStatus">IND/IDE Status</Label>
                <Select value={formData.indStatus} onValueChange={(value) => handleChange('indStatus', value)}>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Not applicable">Not Applicable</SelectItem>
                    <SelectItem value="Pre-IND meeting planned">Pre-IND Meeting Planned</SelectItem>
                    <SelectItem value="In preparation">In Preparation</SelectItem>
                    <SelectItem value="Submitted">Submitted</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataMonitoring">Data Monitoring Committee</Label>
                <Select value={formData.dataMonitoring} onValueChange={(value) => handleChange('dataMonitoring', value)}>
                  <SelectTrigger className="border-green-200 focus:border-green-500 focus:ring-green-500">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Required - will establish">Required - Will Establish</SelectItem>
                    <SelectItem value="Required - already established">Required - Already Established</SelectItem>
                    <SelectItem value="Not required">Not Required</SelectItem>
                    <SelectItem value="To be determined">To Be Determined</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Safety and Monitoring */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Safety and Monitoring</CardTitle>
              <CardDescription>Safety protocols and monitoring plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="adverseEventMonitoring">Adverse Event Monitoring *</Label>
                <Textarea
                  id="adverseEventMonitoring"
                  placeholder="Describe how adverse events will be monitored, documented, and reported..."
                  value={formData.adverseEventMonitoring}
                  onChange={(e) => handleChange('adverseEventMonitoring', e.target.value)}
                  required
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stoppingRules">Stopping Rules</Label>
                <Textarea
                  id="stoppingRules"
                  placeholder="Define criteria for early termination of the study..."
                  value={formData.stoppingRules}
                  onChange={(e) => handleChange('stoppingRules', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataSafetyMonitoring">Data Safety Monitoring Plan</Label>
                <Textarea
                  id="dataSafetyMonitoring"
                  placeholder="Describe the data safety monitoring plan and frequency of reviews..."
                  value={formData.dataSafetyMonitoring}
                  onChange={(e) => handleChange('dataSafetyMonitoring', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="riskMitigation">Risk Mitigation Strategies</Label>
                <Textarea
                  id="riskMitigation"
                  placeholder="Describe strategies to mitigate potential risks to participants..."
                  value={formData.riskMitigation}
                  onChange={(e) => handleChange('riskMitigation', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Data Management</CardTitle>
              <CardDescription>Data collection, storage, and quality control</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="dataCollectionMethod">Data Collection Methods *</Label>
                <Textarea
                  id="dataCollectionMethod"
                  placeholder="Describe how data will be collected (EDC, paper CRFs, etc.)..."
                  value={formData.dataCollectionMethod}
                  onChange={(e) => handleChange('dataCollectionMethod', e.target.value)}
                  required
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataStorageSecurity">Data Storage and Security</Label>
                <Textarea
                  id="dataStorageSecurity"
                  placeholder="Describe data storage, security measures, and compliance with regulations..."
                  value={formData.dataStorageSecurity}
                  onChange={(e) => handleChange('dataStorageSecurity', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualityControl">Quality Control Measures</Label>
                <Textarea
                  id="qualityControl"
                  placeholder="Describe quality control and quality assurance procedures..."
                  value={formData.qualityControl}
                  onChange={(e) => handleChange('qualityControl', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-900">Additional Information</CardTitle>
              <CardDescription>Supporting details and considerations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="previousStudies">Previous Studies/Preliminary Data</Label>
                <Textarea
                  id="previousStudies"
                  placeholder="Summarize relevant previous studies or preliminary data..."
                  value={formData.previousStudies}
                  onChange={(e) => handleChange('previousStudies', e.target.value)}
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scientificRationale">Scientific Rationale</Label>
                <Textarea
                  id="scientificRationale"
                  placeholder="Provide additional scientific rationale and mechanistic basis..."
                  value={formData.scientificRationale}
                  onChange={(e) => handleChange('scientificRationale', e.target.value)}
                  rows={4}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalSignificance">Clinical Significance</Label>
                <Textarea
                  id="clinicalSignificance"
                  placeholder="Describe the potential clinical impact and significance of the study..."
                  value={formData.clinicalSignificance}
                  onChange={(e) => handleChange('clinicalSignificance', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feasibilityConcerns">Feasibility Concerns</Label>
                <Textarea
                  id="feasibilityConcerns"
                  placeholder="List any anticipated challenges or concerns regarding feasibility..."
                  value={formData.feasibilityConcerns}
                  onChange={(e) => handleChange('feasibilityConcerns', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  placeholder="Any other relevant information..."
                  value={formData.additionalNotes}
                  onChange={(e) => handleChange('additionalNotes', e.target.value)}
                  rows={3}
                  className="border-green-200 focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Employee Data Review Permission */}
          <Card className="bg-yellow-50 border-yellow-300">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 mb-4">
                <Checkbox 
                  id="dataReviewPermission" 
                  checked={dataReviewPermission}
                  onCheckedChange={(checked) => setDataReviewPermission(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="dataReviewPermission" className="cursor-pointer">
                    <p className="font-medium text-gray-900 mb-2">
                      I grant permission for authorized TrialVision employees to review my submitted data *
                    </p>
                    <p className="text-sm text-gray-700">
                      By checking this box, you authorize HIPAA-trained TrialVision employees to access and review 
                      your clinical trial submission for quality assurance, technical support, and algorithm improvement 
                      purposes. All employees with access have signed confidentiality agreements and follow strict 
                      data protection protocols. Your data will never be sold or shared with third parties without 
                      your explicit consent.
                    </p>
                  </Label>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                This permission is required to submit your trial for assessment. For more information about our 
                privacy practices, please see our Privacy & Compliance page.
              </p>
            </CardContent>
          </Card>

          {/* Feedback Consent (Optional) */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id="feedbackConsent" 
                  checked={feedbackConsent}
                  onCheckedChange={(checked) => setFeedbackConsent(checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="feedbackConsent" className="cursor-pointer">
                    <p className="font-medium text-gray-900 mb-2">
                      I consent to TrialVision reaching out after my trial's predicted completion for feedback (Optional)
                    </p>
                    <p className="text-sm text-gray-700">
                      By checking this box, you allow us to contact you after the anticipated duration of your clinical 
                      trial to gather feedback about your experience using TrialVision. This helps us improve our 
                      platform and better serve the medical research community. We will only contact you once via your 
                      registered email, and you can opt out at any time.
                    </p>
                  </Label>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                This is completely optional and does not affect your trial assessment.
              </p>
            </CardContent>
          </Card>

          {/* Terms of Service */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 mb-2">
                By submitting this form, you agree to our{' '}
                <button
                  type="button"
                  onClick={onShowTerms}
                  className="text-green-700 hover:text-green-900 underline font-medium"
                >
                  Terms of Service
                </button>
              </p>
              <p className="text-xs text-gray-600">
                Your trial will be analyzed by AI systems validated by medical professionals, 
                financial advisors, and administrators. Results include a feasibility score (1-100) 
                where 75% is the minimum threshold for proceeding with submission to medical councils.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting} className="border-green-600 text-green-700 hover:bg-green-50">
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || !dataReviewPermission} className="bg-green-700 hover:bg-green-800 text-white disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing Trial...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit for Assessment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
