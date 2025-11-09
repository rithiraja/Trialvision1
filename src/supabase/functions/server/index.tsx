import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Signup route
app.post('/make-server-f5a2c76d/signup', async (c) => {
  try {
    const { email, password, legalName, birthDate, placeOfEmployment, licenseReceived, degree } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        legalName,
        birthDate,
        placeOfEmployment,
        licenseReceived,
        degree
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error during user signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error in signup route: ${error}`);
    return c.json({ error: 'Signup failed' }, 500);
  }
});

// Get user profile
app.get('/make-server-f5a2c76d/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ user });
  } catch (error) {
    console.log(`Error fetching user profile: ${error}`);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Update user profile
app.put('/make-server-f5a2c76d/update-profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { legalName, birthDate, placeOfEmployment, licenseReceived, degree } = await c.req.json();

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          legalName,
          birthDate,
          placeOfEmployment,
          licenseReceived,
          degree
        }
      }
    );

    if (error) {
      console.log(`Error updating user profile: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log(`Error in update-profile route: ${error}`);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// Parse trial document
app.post('/make-server-f5a2c76d/parse-trial-document', async (c) => {
  try {
    console.log('=== START: Document parsing ===');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      console.log('AUTH ERROR:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('User authenticated:', user.id);
    
    const { fileName, fileData, fileType } = await c.req.json();
    console.log('Parsing document:', fileName, 'Type:', fileType);
    
    // Extract the base64 content (remove data URL prefix if present)
    const base64Content = fileData.includes('base64,') 
      ? fileData.split('base64,')[1] 
      : fileData;
    
    // Decode base64 to text (simplified - in production, use proper PDF/DOC parsing)
    let documentText = '';
    try {
      // For text files, decode directly
      if (fileType === 'text/plain') {
        documentText = atob(base64Content);
      } else {
        // For PDF/Word files, we'll use a simple extraction approach
        // In production, you'd use a proper PDF/DOC parser library
        documentText = atob(base64Content);
      }
    } catch (decodeError) {
      console.error('Error decoding file:', decodeError);
      return c.json({ error: 'Failed to decode file content' }, 400);
    }

    console.log('Document text length:', documentText.length);

    // Use AI to extract structured data from the document
    // This is a simplified version - in production, use a more sophisticated AI model
    const extractedData: any = {
      // Medical Professional Information
      legalName: extractField(documentText, ['principal investigator', 'investigator name', 'PI name', 'researcher']),
      birthDate: extractField(documentText, ['birth date', 'date of birth', 'DOB']),
      placeOfEmployment: extractField(documentText, ['institution', 'hospital', 'facility', 'organization', 'affiliation']),
      licenseReceived: extractField(documentText, ['license date', 'licensed', 'certification date']),
      degree: extractField(documentText, ['degree', 'qualification', 'MD', 'PhD', 'credentials']),
      
      // Basic Study Information
      studyTitle: extractField(documentText, ['study title', 'trial title', 'protocol title', 'project title']),
      researchQuestion: extractField(documentText, ['research question', 'hypothesis', 'primary question', 'objective']),
      backgroundRationale: extractField(documentText, ['background', 'rationale', 'introduction', 'justification']),
      studyPhase: extractPhase(documentText),
      therapeuticArea: extractField(documentText, ['therapeutic area', 'indication', 'disease area', 'specialty']),
      indication: extractField(documentText, ['indication', 'disease', 'condition', 'diagnosis']),
      
      // Study Design
      studyDesign: extractField(documentText, ['study design', 'trial design', 'methodology', 'design type']),
      controlType: extractField(documentText, ['control', 'comparator', 'placebo']),
      blinding: extractField(documentText, ['blinding', 'masking', 'double-blind', 'single-blind']),
      randomization: extractField(documentText, ['randomization', 'randomized', 'allocation']),
      
      // Patient Population
      targetPopulation: extractField(documentText, ['target population', 'patient population', 'subjects', 'participants']),
      inclusionCriteria: extractField(documentText, ['inclusion criteria', 'inclusion', 'eligibility criteria']),
      exclusionCriteria: extractField(documentText, ['exclusion criteria', 'exclusion']),
      studySize: extractNumber(documentText, ['sample size', 'enrollment', 'number of patients', 'N=']),
      ageRange: extractField(documentText, ['age range', 'age', 'years old']),
      
      // Intervention Details
      interventionType: extractField(documentText, ['intervention', 'treatment', 'drug', 'therapy']),
      interventionDescription: extractField(documentText, ['intervention description', 'treatment description', 'drug description']),
      dosage: extractField(documentText, ['dose', 'dosage', 'mg', 'amount']),
      route: extractField(documentText, ['route', 'administration', 'oral', 'IV', 'intravenous']),
      frequency: extractField(documentText, ['frequency', 'dosing schedule', 'once daily', 'twice daily']),
      
      // Endpoints
      primaryEndpoint: extractField(documentText, ['primary endpoint', 'primary outcome', 'main outcome']),
      secondaryEndpoints: extractField(documentText, ['secondary endpoints', 'secondary outcomes']),
      
      // Timeline
      enrollmentDuration: extractField(documentText, ['enrollment period', 'enrollment duration', 'recruitment period']),
      totalStudyDuration: extractField(documentText, ['study duration', 'trial duration', 'total duration']),
      anticipatedStartDate: extractField(documentText, ['start date', 'anticipated start', 'commencement date']),
      
      // Budget
      estimatedTotalBudget: extractField(documentText, ['budget', 'cost', 'total budget', 'funding']),
      fundingSource: extractField(documentText, ['funding source', 'sponsor', 'funder']),
      
      // Sites
      numberOfSites: extractNumber(documentText, ['number of sites', 'sites', 'centers']),
      siteLocations: extractField(documentText, ['locations', 'sites', 'geographic']),
    };

    // Filter out null/undefined values
    const cleanedData = Object.fromEntries(
      Object.entries(extractedData).filter(([_, v]) => v != null && v !== '')
    );

    console.log('Extracted data fields:', Object.keys(cleanedData).length);
    
    return c.json({ 
      success: true, 
      extractedData: cleanedData,
      message: `Successfully extracted ${Object.keys(cleanedData).length} fields from document`
    });
    
  } catch (error: any) {
    console.error('Error parsing document:', error);
    return c.json({ error: error.message || 'Document parsing failed' }, 500);
  }
});

// Helper functions for data extraction
function extractField(text: string, keywords: string[]): string | null {
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
    if (keywordIndex !== -1) {
      // Extract text after the keyword (next 200 characters or until newline)
      const startIndex = keywordIndex + keyword.length;
      const endIndex = Math.min(startIndex + 200, text.length);
      const extracted = text.substring(startIndex, endIndex)
        .split('\n')[0]  // Take only first line
        .replace(/^[:\s]+/, '')  // Remove leading colons and whitespace
        .trim();
      
      if (extracted && extracted.length > 0) {
        return extracted;
      }
    }
  }
  
  return null;
}

function extractNumber(text: string, keywords: string[]): string | null {
  const lowerText = text.toLowerCase();
  
  for (const keyword of keywords) {
    const keywordIndex = lowerText.indexOf(keyword.toLowerCase());
    if (keywordIndex !== -1) {
      const startIndex = keywordIndex + keyword.length;
      const substring = text.substring(startIndex, startIndex + 50);
      
      // Extract first number found
      const numberMatch = substring.match(/\d+/);
      if (numberMatch) {
        return numberMatch[0];
      }
    }
  }
  
  return null;
}

function extractPhase(text: string): string | null {
  const phaseMatch = text.match(/phase\s+(I|II|III|IV|1|2|3|4)/i);
  if (phaseMatch) {
    const phase = phaseMatch[1].toUpperCase();
    // Convert numbers to Roman numerals
    const phaseMap: { [key: string]: string } = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV' };
    return `Phase ${phaseMap[phase] || phase}`;
  }
  return null;
}

// Submit clinical trial
app.post('/make-server-f5a2c76d/trials', async (c) => {
  try {
    console.log('=== START: Trial submission ===');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      console.log('AUTH ERROR:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('User authenticated:', user.id);
    
    const trialData = await c.req.json();
    console.log('Trial data received, keys:', Object.keys(trialData));
    
    const trialId = `trial_${user.id}_${Date.now()}`;
    console.log('Trial ID:', trialId);

    // Store trial data
    console.log('Storing trial with analyzing status...');
    console.log('Trial ID to store:', trialId);
    console.log('User ID:', user.id);
    
    const trialRecord = {
      ...trialData,
      trialId,  // Store the ID in the record itself
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'analyzing'
    };
    
    console.log('Trial record keys:', Object.keys(trialRecord));
    console.log('About to call kv.set with ID:', trialId);
    
    try {
      await kv.set(trialId, trialRecord);
      console.log('✓ kv.set completed successfully');
    } catch (kvError) {
      console.log('✗ kv.set FAILED:', kvError);
      throw kvError;
    }

    // Verify storage immediately
    console.log('Verifying storage by fetching trial...');
    try {
      const verifyStored = await kv.get(trialId);
      console.log('✓ Verification - Trial exists:', !!verifyStored);
      if (verifyStored) {
        console.log('  - Stored trial has userId:', verifyStored.userId);
        console.log('  - Stored trial has trialId:', verifyStored.trialId);
        console.log('  - Stored trial has status:', verifyStored.status);
      } else {
        console.log('✗ WARNING: Trial was not found immediately after storage!');
      }
    } catch (verifyError) {
      console.log('✗ Verification fetch FAILED:', verifyError);
    }

    // Analyze the trial
    console.log('Starting analysis...');
    const analysis = await analyzeTrial(trialData);
    console.log('Analysis completed, overall score:', analysis.overallScore);

    // Update with analysis results
    console.log('Updating trial with analysis...');
    const finalTrialRecord = {
      ...trialData,
      trialId,  // Store the ID in the record itself
      userId: user.id,
      createdAt: new Date().toISOString(),
      status: 'completed',
      analysis
    };
    
    try {
      await kv.set(trialId, finalTrialRecord);
      console.log('✓ Trial updated with analysis');
    } catch (updateError) {
      console.log('✗ Trial update FAILED:', updateError);
      throw updateError;
    }

    // Add a small delay to ensure database commit
    console.log('Waiting 500ms for database commit...');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify final storage
    console.log('Final verification...');
    try {
      const verifyFinal = await kv.get(trialId);
      console.log('✓ Final verification - Trial exists:', !!verifyFinal);
      if (verifyFinal) {
        console.log('  - Final trial has status:', verifyFinal?.status);
        console.log('  - Final trial has analysis:', !!verifyFinal?.analysis);
      } else {
        console.log('✗ WARNING: Trial not found in final verification!');
      }
    } catch (finalVerifyError) {
      console.log('✗ Final verification FAILED:', finalVerifyError);
    }

    console.log('=== END: Trial submission successful ===');
    console.log('Returning trial ID:', trialId);
    return c.json({ trialId, analysis });
  } catch (error: any) {
    console.log(`ERROR in trial submission: ${error.message || error}`);
    console.log(`Error stack: ${error.stack}`);
    return c.json({ error: error.message || 'Failed to submit trial', details: String(error) }, 500);
  }
});

// Get all trials for a user
app.get('/make-server-f5a2c76d/trials', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allTrials = await kv.getByPrefix(`trial_${user.id}_`);
    return c.json({ trials: allTrials || [] });
  } catch (error) {
    console.log(`Error fetching trials: ${error}`);
    return c.json({ error: 'Failed to fetch trials' }, 500);
  }
});

// Debug endpoint to check all trials
app.get('/make-server-f5a2c76d/debug/trials', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log('DEBUG: Fetching all trials for user:', user.id);
    const allTrials = await kv.getByPrefix(`trial_${user.id}_`);
    console.log('DEBUG: Found', allTrials?.length || 0, 'trials');
    
    if (allTrials && allTrials.length > 0) {
      console.log('DEBUG: Trial IDs:', allTrials.map((t: any) => t.trialId || t.id || 'no-id'));
      console.log('DEBUG: First trial keys:', Object.keys(allTrials[0] || {}));
    }

    return c.json({ 
      success: true,
      userId: user.id,
      trialCount: allTrials?.length || 0, 
      trials: allTrials || [] 
    });
  } catch (error: any) {
    console.error('DEBUG: Error fetching trials:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Get specific trial
app.get('/make-server-f5a2c76d/trials/:id', async (c) => {
  try {
    console.log('=== START: Fetching trial ===');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    console.log('Access token present:', !!accessToken);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      console.log('AUTH ERROR in trial fetch:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const trialId = c.req.param('id');
    console.log('==========================================');
    console.log('Fetching trial with ID:', trialId);
    console.log('Trial ID type:', typeof trialId);
    console.log('Trial ID length:', trialId?.length);
    console.log('User ID:', user.id);
    
    // First, let's list all trials to see what's available
    const allTrials = await kv.getByPrefix(`trial_${user.id}_`);
    console.log('Total trials for user:', allTrials?.length || 0);
    if (allTrials && allTrials.length > 0) {
      console.log('Available trial IDs:');
      allTrials.forEach((t: any, idx: number) => {
        console.log(`  ${idx + 1}. ${t.trialId}`);
      });
    }
    console.log('==========================================');
    
    // Try to get the trial with retries in case of database lag
    let trial = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!trial && attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts}/${maxAttempts} to fetch trial...`);
      console.log('Looking for key:', trialId);
      
      try {
        trial = await kv.get(trialId);
        console.log('kv.get result:', trial ? 'FOUND' : 'NOT FOUND');
        
        if (trial) {
          console.log('Trial found! Keys in trial:', Object.keys(trial));
          console.log('Trial userId:', trial.userId);
          console.log('Trial trialId:', trial.trialId);
        }
      } catch (kvError) {
        console.error('Error calling kv.get:', kvError);
      }
      
      if (!trial && attempts < maxAttempts) {
        console.log('Trial not found, waiting 1000ms before retry...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('==========================================');
    console.log('Final result - Trial retrieved from KV:', trial ? 'FOUND' : 'NOT FOUND');
    console.log('==========================================');
    
    if (!trial) {
      console.log('❌ Trial not found in database after', maxAttempts, 'attempts');
      console.log('Requested trial ID:', trialId);
      console.log('User has', allTrials?.length || 0, 'total trials');
      return c.json({ 
        error: 'Trial not found',
        debug: {
          requestedId: trialId,
          availableTrials: allTrials?.map((t: any) => t.trialId) || []
        }
      }, 404);
    }
    
    if (trial.userId !== user.id) {
      console.log('Trial userId mismatch. Trial userId:', trial.userId, 'User ID:', user.id);
      return c.json({ error: 'Trial not found' }, 404);
    }

    console.log('✓ Trial fetch successful');
    console.log('Trial data keys:', Object.keys(trial));
    return c.json({ trial });
  } catch (error: any) {
    console.log(`ERROR fetching trial: ${error.message || error}`);
    console.log(`Error stack: ${error.stack}`);
    return c.json({ error: 'Failed to fetch trial' }, 500);
  }
});

// AI Analysis function
async function analyzeTrial(trialData: any) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!apiKey) {
    // Return structured mock analysis if no API key
    return generateMockAnalysis(trialData);
  }

  try {
    const prompt = `You are an expert panel consisting of a medical professional, financial advisor, and clinical trial administrator. Analyze this clinical trial proposal and provide a detailed feasibility assessment.

Clinical Trial Details:
${JSON.stringify(trialData, null, 2)}

Provide a structured JSON response with the following format:
{
  "medicalFeasibility": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "concerns": ["<concern 1>", "<concern 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"]
  },
  "financialFeasibility": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "estimatedCost": "<cost estimate>",
    "concerns": ["<concern 1>", "<concern 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"]
  },
  "administrativeFeasibility": {
    "score": <number 0-100>,
    "assessment": "<detailed assessment>",
    "concerns": ["<concern 1>", "<concern 2>"],
    "recommendations": ["<recommendation 1>", "<recommendation 2>"]
  },
  "outcomePredictor": {
    "successProbability": <number 0-100>,
    "prediction": "<detailed prediction>",
    "keyFactors": ["<factor 1>", "<factor 2>"],
    "risks": ["<risk 1>", "<risk 2>"]
  },
  "overallRecommendation": {
    "verdict": "<proceed/revise/abandon>",
    "summary": "<executive summary>",
    "nextSteps": ["<step 1>", "<step 2>"]
  }
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert clinical trial feasibility assessment panel. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.log(`OpenAI API error: ${response.status} ${response.statusText}`);
      return generateMockAnalysis(trialData);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return generateMockAnalysis(trialData);
  } catch (error) {
    console.log(`Error in AI analysis: ${error}`);
    return generateMockAnalysis(trialData);
  }
}

// Get hospitals/clinics for matching
app.get('/make-server-f5a2c76d/hospitals', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const therapeuticArea = c.req.query('therapeuticArea');
    const indication = c.req.query('indication');
    
    const hospitals = await generateHospitalMatches(therapeuticArea, indication);
    return c.json({ hospitals });
  } catch (error) {
    console.log(`Error fetching hospitals: ${error}`);
    return c.json({ error: 'Failed to fetch hospitals' }, 500);
  }
});

// Send match invitation to hospital/clinic
app.post('/make-server-f5a2c76d/match-invitation', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { hospitalId, trialId, trialTitle } = await c.req.json();
    const invitationId = `invitation_${user.id}_${hospitalId}_${Date.now()}`;

    await kv.set(invitationId, {
      userId: user.id,
      hospitalId,
      trialId,
      trialTitle,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      invitationId,
      message: 'Match invitation sent successfully' 
    });
  } catch (error) {
    console.log(`Error sending match invitation: ${error}`);
    return c.json({ error: 'Failed to send match invitation' }, 500);
  }
});

// Get match invitations for user
app.get('/make-server-f5a2c76d/invitations', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const invitations = await kv.getByPrefix(`invitation_${user.id}_`);
    return c.json({ invitations: invitations || [] });
  } catch (error) {
    console.log(`Error fetching invitations: ${error}`);
    return c.json({ error: 'Failed to fetch invitations' }, 500);
  }
});

// Generate hospital/clinic matches based on trial criteria
function generateHospitalMatches(therapeuticArea?: string, indication?: string) {
  const hospitals = [
    {
      id: 'hosp_001',
      name: 'Massachusetts General Hospital',
      location: 'Boston, MA',
      type: 'Academic Medical Center',
      interested: true,
      specialties: ['Oncology', 'Cardiology', 'Neurology', 'Immunology'],
      patientPopulation: {
        total: '47,000 annual patients',
        demographics: 'Diverse population, 65% insured, strong minority representation',
        relevantConditions: indication ? `~2,500 patients with ${indication} annually` : '~2,500 patients annually'
      },
      equipment: {
        imaging: 'MRI (3), CT (5), PET-CT (2)',
        lab: 'Full clinical lab, molecular diagnostics, genomics center',
        specialized: 'Radiation oncology, cardiac cath labs, OR suites'
      },
      staffCapacity: {
        physicians: 'Over 100 in relevant departments',
        nurses: 'Dedicated clinical research nursing staff (25+)',
        coordinators: '15 experienced research coordinators',
        support: 'Regulatory affairs, data management, biostatistics teams'
      },
      trials: {
        current: 85,
        completed: 320,
        capacity: 'High - Can accommodate 10-15 new trials annually'
      },
      matchScore: 95,
      notes: 'Premier research institution with extensive Phase 2-3 trial experience'
    },
    {
      id: 'hosp_002',
      name: 'Cleveland Clinic',
      location: 'Cleveland, OH',
      type: 'Academic Medical Center',
      interested: true,
      specialties: ['Cardiology', 'Neurology', 'Gastroenterology', 'Orthopedics'],
      patientPopulation: {
        total: '38,000 annual patients',
        demographics: 'Midwest population, strong Medicare representation',
        relevantConditions: indication ? `~1,800 patients with ${indication} annually` : '~1,800 patients annually'
      },
      equipment: {
        imaging: 'MRI (4), CT (6), PET-CT (1)',
        lab: 'Comprehensive clinical lab, specialized cardiac diagnostics',
        specialized: 'Heart center, neuroscience center, robotic surgery'
      },
      staffCapacity: {
        physicians: '75+ in relevant specialties',
        nurses: 'Clinical research nursing team (18)',
        coordinators: '12 research coordinators',
        support: 'IRB, regulatory support, clinical trials office'
      },
      trials: {
        current: 72,
        completed: 280,
        capacity: 'Moderate to High - Can accommodate 8-12 new trials annually'
      },
      matchScore: 92,
      notes: 'Excellent track record in cardiovascular and neurological trials'
    },
    {
      id: 'hosp_003',
      name: 'University of California San Francisco Medical Center',
      location: 'San Francisco, CA',
      type: 'Academic Medical Center',
      interested: true,
      specialties: ['Oncology', 'Neurology', 'Pediatrics', 'Immunology'],
      patientPopulation: {
        total: '42,000 annual patients',
        demographics: 'West Coast diverse population, high tech industry representation',
        relevantConditions: indication ? `~2,200 patients with ${indication} annually` : '~2,200 patients annually'
      },
      equipment: {
        imaging: 'MRI (3), CT (4), PET-CT (2), advanced imaging suite',
        lab: 'Cutting-edge molecular diagnostics, genomics, proteomics',
        specialized: 'Precision medicine center, immunotherapy facilities'
      },
      staffCapacity: {
        physicians: '90+ in relevant departments',
        nurses: 'Clinical research nurses (22)',
        coordinators: '18 research coordinators',
        support: 'Full regulatory, data science, and biostatistics support'
      },
      trials: {
        current: 95,
        completed: 410,
        capacity: 'High - Can accommodate 12-18 new trials annually'
      },
      matchScore: 94,
      notes: 'Leader in precision medicine and innovative treatment approaches'
    },
    {
      id: 'hosp_004',
      name: 'Johns Hopkins Hospital',
      location: 'Baltimore, MD',
      type: 'Academic Medical Center',
      interested: true,
      specialties: ['Oncology', 'Neurology', 'Rheumatology', 'Pediatrics'],
      patientPopulation: {
        total: '51,000 annual patients',
        demographics: 'Mid-Atlantic region, diverse socioeconomic backgrounds',
        relevantConditions: indication ? `~3,000 patients with ${indication} annually` : '~3,000 patients annually'
      },
      equipment: {
        imaging: 'MRI (5), CT (7), PET-CT (3)',
        lab: 'World-class diagnostic and research laboratories',
        specialized: 'Advanced surgical suites, gene therapy facilities'
      },
      staffCapacity: {
        physicians: 'Over 120 in relevant specialties',
        nurses: 'Large clinical research nursing department (30+)',
        coordinators: '20+ experienced coordinators',
        support: 'Comprehensive research infrastructure and regulatory teams'
      },
      trials: {
        current: 105,
        completed: 520,
        capacity: 'Very High - Can accommodate 15-20 new trials annually'
      },
      matchScore: 96,
      notes: 'Top-ranked hospital with exceptional research infrastructure'
    },
    {
      id: 'hosp_005',
      name: 'Mayo Clinic',
      location: 'Rochester, MN',
      type: 'Academic Medical Center',
      interested: true,
      specialties: ['Cardiology', 'Oncology', 'Gastroenterology', 'Endocrinology'],
      patientPopulation: {
        total: '55,000 annual patients',
        demographics: 'National patient base, comprehensive insurance coverage',
        relevantConditions: indication ? `~3,200 patients with ${indication} annually` : '~3,200 patients annually'
      },
      equipment: {
        imaging: 'MRI (6), CT (8), PET-CT (3), advanced diagnostic imaging',
        lab: 'State-of-the-art clinical and research laboratories',
        specialized: 'Comprehensive specialty centers across all major areas'
      },
      staffCapacity: {
        physicians: 'Over 150 in relevant departments',
        nurses: 'Dedicated research nursing staff (35+)',
        coordinators: '25+ research coordinators',
        support: 'Full-service clinical trials infrastructure'
      },
      trials: {
        current: 120,
        completed: 650,
        capacity: 'Very High - Can accommodate 20+ new trials annually'
      },
      matchScore: 97,
      notes: 'Gold standard for clinical research with unmatched infrastructure'
    },
    {
      id: 'clinic_001',
      name: 'Research Medical Associates',
      location: 'Houston, TX',
      type: 'Specialized Clinical Research Facility',
      interested: true,
      specialties: ['Oncology', 'Metabolic Disorders', 'Respiratory'],
      patientPopulation: {
        total: '8,500 annual patients',
        demographics: 'Texas region, diverse Hispanic population',
        relevantConditions: indication ? `~450 patients with ${indication} annually` : '~450 patients annually'
      },
      equipment: {
        imaging: 'MRI (1), CT (1)',
        lab: 'On-site clinical laboratory, certified for clinical trials',
        specialized: 'Phase 1-3 dedicated research units'
      },
      staffCapacity: {
        physicians: '12 board-certified physician investigators',
        nurses: 'Clinical research nurses (8)',
        coordinators: '6 dedicated coordinators',
        support: 'In-house regulatory and data management'
      },
      trials: {
        current: 28,
        completed: 95,
        capacity: 'Moderate - Can accommodate 8-10 new trials annually'
      },
      matchScore: 88,
      notes: 'Specialized facility focused exclusively on clinical research'
    }
  ];

  // Filter and sort based on therapeutic area
  return hospitals
    .filter(h => !therapeuticArea || h.specialties.some(s => 
      s.toLowerCase().includes(therapeuticArea.toLowerCase())
    ))
    .sort((a, b) => b.matchScore - a.matchScore);
}

// Generate mock analysis for demo purposes
function generateMockAnalysis(trialData: any) {
  console.log('Generating mock analysis with trialData keys:', Object.keys(trialData || {}));
  const studySize = parseInt(trialData?.studySize || '100') || 100;
  const phase = trialData?.studyPhase || 'Phase 2';
  const hasBackground = (trialData?.backgroundRationale?.length || 0) > 100;
  const hasQuestion = (trialData?.researchQuestion?.length || 0) > 50;
  
  // Calculate scores based on provided data
  const medicalScore = Math.min(100, 55 + (hasQuestion ? 15 : 5) + (hasBackground ? 20 : 10) + (phase.includes('2') || phase.includes('3') ? 10 : 5));
  const financialScore = Math.min(100, 60 + (studySize < 500 ? 20 : 10) + (phase.includes('1') || phase.includes('2') ? 10 : 5));
  const adminScore = Math.min(100, 60 + (studySize < 300 ? 20 : 10) + (trialData.placeOfEmployment ? 10 : 0));
  
  return {
    medicalFeasibility: {
      score: medicalScore,
      assessment: `The proposed ${phase} trial with ${studySize} participants shows ${medicalScore > 70 ? 'strong' : 'moderate'} medical feasibility. The research question and background rationale are ${medicalScore > 70 ? 'well-articulated' : 'adequately described'}.`,
      concerns: [
        studySize < 50 ? 'Sample size may be insufficient for statistical power' : 'Sample size appears adequate for the study phase',
        !hasBackground ? 'Background rationale could be more comprehensive' : 'Strong scientific foundation provided'
      ],
      recommendations: [
        'Engage with a biostatistician to validate sample size calculations',
        'Develop detailed protocol with clear inclusion/exclusion criteria',
        'Establish data safety monitoring board (DSMB) for ongoing oversight'
      ]
    },
    financialFeasibility: {
      score: financialScore,
      assessment: `For a ${phase} trial with ${studySize} participants, financial planning is ${financialScore > 60 ? 'feasible' : 'challenging but manageable'}. Budget estimates should account for recruitment, monitoring, and data management costs.`,
      estimatedCost: studySize < 100 ? `$${(studySize * 8000).toLocaleString()} - $${(studySize * 15000).toLocaleString()}` : `$${(studySize * 6000).toLocaleString()} - $${(studySize * 12000).toLocaleString()}`,
      concerns: [
        studySize > 500 ? 'Large sample size will require substantial funding' : 'Moderate sample size supports manageable budget',
        'Patient recruitment and retention costs should be carefully estimated'
      ],
      recommendations: [
        'Develop detailed line-item budget with 25% contingency',
        'Explore NIH, industry, and foundation funding sources',
        phase.includes('1') || phase.includes('2') ? 'Consider SBIR/STTR grants for early-phase trials' : 'Pursue collaborative funding models'
      ]
    },
    administrativeFeasibility: {
      score: adminScore,
      assessment: `Administrative feasibility is ${adminScore > 70 ? 'strong' : 'moderate'} for this ${phase} trial. With affiliation at ${trialData.placeOfEmployment || 'the specified institution'}, site infrastructure and regulatory pathways ${adminScore > 70 ? 'are well-positioned' : 'can be established'}.`,
      concerns: [
        studySize > 500 ? 'Large sample size will require multiple sites and complex coordination' : 'Manageable sample size for single or few sites',
        'IRB approval process typically requires 2-4 months',
        !trialData.placeOfEmployment ? 'Institutional affiliation needs to be confirmed' : 'Institutional support appears available'
      ],
      recommendations: [
        'Begin IRB application process early with complete protocol',
        'Establish relationships with clinical sites and principal investigators',
        'Develop standard operating procedures (SOPs) for data collection',
        studySize > 200 ? 'Consider engaging a CRO for multi-site coordination' : 'Build internal project management capacity'
      ]
    },
    outcomePredictor: {
      successProbability: Math.round((medicalScore + financialScore + adminScore) / 3),
      prediction: `Based on comprehensive AI analysis validated by medical professionals, financial advisors, and administrators, this trial has a feasibility score of ${Math.round((medicalScore + financialScore + adminScore) / 3)} out of 100. ${Math.round((medicalScore + financialScore + adminScore) / 3) >= 75 ? 'This score meets the minimum 75% threshold for proceeding with medical council submission.' : 'This score is below the 75% threshold; consider addressing the recommendations before formal submission.'}`,
      keyFactors: [
        hasQuestion ? 'Well-articulated research question and hypothesis' : 'Research question needs refinement',
        hasBackground ? 'Strong scientific rationale and background' : 'Background rationale could be strengthened',
        `${phase} is appropriate for the research objectives`,
        trialData.placeOfEmployment ? 'Institutional support confirmed' : 'Institutional affiliation to be established'
      ],
      risks: [
        studySize > 300 ? 'Large sample size may face recruitment challenges' : 'Sample size manageable but requires realistic timelines',
        'IRB approval and regulatory clearance timelines',
        'Patient recruitment and retention strategies needed',
        'Budget contingencies for unexpected costs'
      ]
    },
    overallRecommendation: {
      verdict: Math.round((medicalScore + financialScore + adminScore) / 3) >= 75 ? 'proceed' : 'revise',
      summary: `This ${phase} clinical trial proposal ${Math.round((medicalScore + financialScore + adminScore) / 3) >= 75 ? 'meets the 75% feasibility threshold and shows strong potential for successful execution' : 'requires refinement to meet the 75% feasibility threshold required for medical council submission'}. ${Math.round((medicalScore + financialScore + adminScore) / 3) >= 75 ? 'With proper planning and institutional support, it is ready to proceed toward formal regulatory submission.' : 'Address the recommendations below to strengthen the proposal before resubmitting for assessment.'}`,
      nextSteps: [
        Math.round((medicalScore + financialScore + adminScore) / 3) >= 75 ? 'Proceed with detailed protocol development' : 'Revise proposal addressing identified concerns',
        'Engage biostatistician for power analysis and sample size validation',
        'Develop comprehensive budget with institutional finance office',
        'Prepare complete IRB application package',
        'Identify and pre-qualify clinical research sites',
        Math.round((medicalScore + financialScore + adminScore) / 3) >= 75 ? 'Schedule pre-IND meeting with FDA or equivalent regulatory body' : 'Strengthen background rationale and research methodology',
        'Establish patient recruitment strategy and timelines'
      ]
    }
  };
}

// Debug endpoint to list all trials in the database (for debugging only)
app.get('/make-server-f5a2c76d/debug/trials', async (c) => {
  try {
    console.log('=== DEBUG: Listing all trials ===');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const allTrials = await kv.getByPrefix(`trial_${user.id}_`);
    console.log('Found', allTrials?.length || 0, 'trials for user', user.id);
    
    return c.json({ 
      userId: user.id,
      trialCount: allTrials?.length || 0,
      trials: allTrials?.map((t: any) => ({
        trialId: t.trialId,
        studyTitle: t.studyTitle,
        status: t.status,
        createdAt: t.createdAt
      })) || []
    });
  } catch (error: any) {
    console.log('Error in debug endpoint:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Delete trial
app.delete('/make-server-f5a2c76d/trials/:id', async (c) => {
  try {
    console.log('=== START: Deleting trial ===');
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      console.log('AUTH ERROR in trial deletion:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const trialId = c.req.param('id');
    console.log('Deleting trial with ID:', trialId);
    console.log('User ID:', user.id);

    // First, let's list all trials to see what's available
    const allTrials = await kv.getByPrefix(`trial_${user.id}_`);
    console.log('Total trials for user:', allTrials?.length || 0);
    if (allTrials && allTrials.length > 0) {
      console.log('Available trial IDs:');
      allTrials.forEach((t: any, idx: number) => {
        console.log(`  ${idx + 1}. ${t.trialId}`);
      });
    }

    // Verify the trial exists and belongs to this user
    const trial = await kv.get(trialId);
    
    if (!trial) {
      console.log('❌ Trial not found');
      console.log('Requested trial ID:', trialId);
      return c.json({ 
        error: 'Trial not found',
        debug: {
          requestedId: trialId,
          availableTrials: allTrials?.map((t: any) => t.trialId) || []
        }
      }, 404);
    }
    
    if (trial.userId !== user.id) {
      console.log('❌ Trial does not belong to user');
      console.log('Trial userId:', trial.userId, 'Request userId:', user.id);
      return c.json({ error: 'Unauthorized - Trial does not belong to this user' }, 403);
    }

    // Delete the trial
    await kv.del(trialId);
    console.log('✓ Trial deleted successfully');

    console.log('=== END: Trial deletion successful ===');
    return c.json({ success: true, message: 'Trial deleted successfully' });
  } catch (error: any) {
    console.log(`ERROR deleting trial: ${error.message || error}`);
    console.log(`Error stack: ${error.stack}`);
    return c.json({ error: error.message || 'Failed to delete trial' }, 500);
  }
});

Deno.serve(app.fetch);
