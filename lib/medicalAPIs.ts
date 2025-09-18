/**
 * Medical and Healthcare API Integrations for SimpleLMS Platform
 * These APIs can enhance the platform with real-world medical data and services
 */

// ============================================
// MEDICAL REFERENCE & DRUG INFORMATION
// ============================================

/**
 * 1. NLM (National Library of Medicine) APIs
 * Free, government-provided medical information
 */
export const NLM_APIs = {
  // PubMed API - Medical literature search
  PubMed: {
    baseUrl: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/',
    endpoints: {
      search: 'esearch.fcgi',
      fetch: 'efetch.fcgi',
      summary: 'esummary.fcgi'
    },
    documentation: 'https://www.ncbi.nlm.nih.gov/books/NBK25497/',
    features: [
      'Search medical literature',
      'Get article abstracts',
      'Citation information',
      'Related articles'
    ],
    apiKey: 'Register at https://www.ncbi.nlm.nih.gov/account/',
    rateLimit: '3 requests/second without key, 10 with key'
  },

  // ClinicalTrials.gov API
  ClinicalTrials: {
    baseUrl: 'https://clinicaltrials.gov/api/v2/',
    endpoints: {
      studies: 'studies',
      fields: 'studies/fields',
      stats: 'stats/size'
    },
    documentation: 'https://clinicaltrials.gov/api/gui',
    features: [
      'Search clinical trials',
      'Trial status and results',
      'Enrollment information',
      'Study protocols'
    ],
    apiKey: 'No key required',
    rateLimit: 'Reasonable use'
  },

  // RxNorm API - Drug normalization
  RxNorm: {
    baseUrl: 'https://rxnav.nlm.nih.gov/REST/',
    endpoints: {
      search: 'rxcui.json',
      properties: 'rxcui/{rxcui}/properties.json',
      interactions: 'interaction/interaction.json'
    },
    documentation: 'https://lhncbc.nlm.nih.gov/RxNav/APIs/',
    features: [
      'Drug name normalization',
      'Generic/brand relationships',
      'Drug classes',
      'NDC mappings'
    ],
    apiKey: 'No key required',
    rateLimit: 'No stated limit'
  },

  // MedlinePlus Connect
  MedlinePlus: {
    baseUrl: 'https://apps.nlm.nih.gov/medlineplus/services/',
    endpoints: {
      healthTopics: 'v1/healthTopics.json',
      drugInfo: 'druginfo/v1/'
    },
    documentation: 'https://medlineplus.gov/connect/',
    features: [
      'Patient-friendly information',
      'Health topics',
      'Drug information',
      'Multiple languages'
    ],
    apiKey: 'No key required'
  }
};

// ============================================
// DRUG INTERACTION & SAFETY
// ============================================

/**
 * 2. OpenFDA - FDA Data
 */
export const OpenFDA = {
  baseUrl: 'https://api.fda.gov/',
  endpoints: {
    drugEvents: 'drug/event.json',
    drugLabel: 'drug/label.json',
    deviceEvents: 'device/event.json',
    recalls: 'drug/enforcement.json'
  },
  documentation: 'https://open.fda.gov/apis/',
  features: [
    'Adverse event reports',
    'Drug labels and warnings',
    'Medical device reports',
    'Recall information'
  ],
  apiKey: 'Optional - increases rate limit',
  rateLimit: '240 calls/minute with key, 40 without',
  exampleQuery: 'https://api.fda.gov/drug/label.json?search=openfda.brand_name:"aspirin"'
};

// ============================================
// DISEASE SURVEILLANCE & PUBLIC HEALTH
// ============================================

/**
 * 3. CDC APIs - Disease Surveillance
 */
export const CDC_APIs = {
  // CDC Wonder API
  Wonder: {
    baseUrl: 'https://wonder.cdc.gov/controller/datarequest/',
    documentation: 'https://wonder.cdc.gov/wonder/help/WONDER-API.html',
    features: [
      'Mortality data',
      'Birth data',
      'Cancer statistics',
      'Vaccine adverse events'
    ],
    authentication: 'Agreement acceptance required'
  },

  // FluView API
  FluView: {
    baseUrl: 'https://gis.cdc.gov/grasp/fluview/',
    features: [
      'Influenza surveillance',
      'Weekly flu activity',
      'Hospitalization rates',
      'Vaccination coverage'
    ]
  },

  // COVID Data Tracker
  COVIDDataTracker: {
    baseUrl: 'https://covid.cdc.gov/covid-data-tracker/',
    features: [
      'COVID-19 case data',
      'Vaccination rates',
      'Hospital capacity',
      'Variant tracking'
    ]
  }
};

/**
 * 4. WHO APIs - Global Health Data
 */
export const WHO_APIs = {
  // Global Health Observatory
  GHO: {
    baseUrl: 'https://ghoapi.azureedge.net/api/',
    endpoints: {
      indicators: 'Indicator',
      dimensions: 'Dimension',
      data: 'Data'
    },
    documentation: 'https://www.who.int/data/gho/info/gho-odata-api',
    features: [
      'Global health indicators',
      'Disease statistics',
      'Country health profiles',
      'SDG health targets'
    ],
    apiKey: 'No key required'
  },

  // ICD-11 API
  ICD11: {
    baseUrl: 'https://id.who.int/icd/',
    documentation: 'https://icd.who.int/icdapi',
    features: [
      'Disease classification',
      'Diagnostic codes',
      'Medical terminology',
      'Multiple languages'
    ],
    authentication: 'OAuth2 required',
    registrationUrl: 'https://icd.who.int/icdapi/Account/Register'
  }
};

// ============================================
// MEDICAL IMAGING & DIAGNOSTICS
// ============================================

/**
 * 5. Medical Imaging APIs
 */
export const ImagingAPIs = {
  // Google Cloud Healthcare API
  GoogleHealthcare: {
    baseUrl: 'https://healthcare.googleapis.com/v1/',
    features: [
      'DICOM store management',
      'FHIR resources',
      'HL7v2 messages',
      'De-identification'
    ],
    documentation: 'https://cloud.google.com/healthcare-api/docs',
    pricing: 'Pay-per-use'
  },

  // Microsoft Azure Health Bot
  AzureHealthBot: {
    features: [
      'Medical Q&A',
      'Symptom checker',
      'Triage protocols',
      'Integration ready'
    ],
    documentation: 'https://docs.microsoft.com/en-us/healthbot/',
    pricing: 'Free tier available'
  }
};

// ============================================
// MEDICAL KNOWLEDGE & DECISION SUPPORT
// ============================================

/**
 * 6. Clinical Decision Support APIs
 */
export const ClinicalDecisionAPIs = {
  // UpToDate API
  UpToDate: {
    vendor: 'Wolters Kluwer',
    features: [
      'Evidence-based content',
      'Clinical recommendations',
      'Drug information',
      'Patient education'
    ],
    contact: 'Enterprise sales required',
    website: 'https://www.uptodate.com'
  },

  // IBM Watson Health
  WatsonHealth: {
    features: [
      'Clinical insights',
      'Drug discovery',
      'Oncology support',
      'Imaging analysis'
    ],
    documentation: 'https://www.ibm.com/watson-health',
    pricing: 'Enterprise'
  },

  // Infermedica API
  Infermedica: {
    baseUrl: 'https://api.infermedica.com/v3/',
    features: [
      'Symptom checker',
      'Triage',
      'Risk assessment',
      'Differential diagnosis'
    ],
    documentation: 'https://developer.infermedica.com/',
    pricing: 'Free tier (100 calls/month)',
    authentication: 'API key + App ID required'
  }
};

// ============================================
// MEDICAL TERMINOLOGY & CODING
// ============================================

/**
 * 7. Medical Coding APIs
 */
export const CodingAPIs = {
  // SNOMED CT
  SNOMEDCT: {
    baseUrl: 'https://browser.ihtsdotools.org/snowstorm/snomed-ct/',
    features: [
      'Clinical terminology',
      'Concept relationships',
      'International standards',
      'Semantic search'
    ],
    documentation: 'https://confluence.ihtsdotools.org/display/DOCEXTAPI',
    authentication: 'License required for production'
  },

  // ICD-10 API
  ICD10: {
    baseUrl: 'http://www.icd10api.com/',
    features: [
      'ICD-10 code lookup',
      'Code descriptions',
      'Parent-child relationships',
      'Search functionality'
    ],
    authentication: 'Token required',
    pricing: 'Free tier available'
  },

  // LOINC
  LOINC: {
    baseUrl: 'https://loinc.org/api/',
    features: [
      'Lab test codes',
      'Clinical observations',
      'Document types',
      'Survey instruments'
    ],
    documentation: 'https://loinc.org/kb/users-guide/',
    authentication: 'Account required'
  }
};

// ============================================
// HEALTHCARE INTEROPERABILITY
// ============================================

/**
 * 8. FHIR (Fast Healthcare Interoperability Resources)
 */
export const FHIRServers = {
  // Public Test Servers
  HAPI_FHIR: {
    baseUrl: 'http://hapi.fhir.org/baseR4/',
    features: [
      'Full FHIR R4 support',
      'Test patient data',
      'Free for testing',
      'REST API'
    ],
    documentation: 'https://hapifhir.io/'
  },

  // SMART on FHIR
  SMART: {
    baseUrl: 'https://launch.smarthealthit.org/',
    features: [
      'OAuth2 authentication',
      'App launch framework',
      'Synthetic patient data',
      'Sandbox environment'
    ],
    documentation: 'https://docs.smarthealthit.org/'
  },

  // Open Health APIs
  OpenHealthHub: {
    features: [
      'Patient records',
      'Appointments',
      'Prescriptions',
      'Lab results'
    ],
    standard: 'FHIR R4'
  }
};

// ============================================
// MEDICAL EDUCATION & CME
// ============================================

/**
 * 9. Medical Education APIs
 */
export const EducationAPIs = {
  // ACCME (Accreditation Council for CME)
  ACCME: {
    features: [
      'CME provider data',
      'Accreditation status',
      'Activity reporting',
      'Credit verification'
    ],
    website: 'https://www.accme.org/',
    access: 'Provider accounts only'
  },

  // NBME (National Board of Medical Examiners)
  NBME: {
    features: [
      'Self-assessments',
      'Score reporting',
      'Performance feedback',
      'Subject examinations'
    ],
    website: 'https://www.nbme.org/',
    access: 'Institutional accounts'
  },

  // Osmosis API
  Osmosis: {
    features: [
      'Medical videos',
      'Study materials',
      'Flashcards',
      'Question banks'
    ],
    documentation: 'Contact for API access',
    website: 'https://www.osmosis.org/'
  }
};

// ============================================
// IMPLEMENTATION FUNCTIONS
// ============================================

/**
 * Example implementation for PubMed search
 */
export async function searchPubMed(query: string, maxResults: number = 10) {
  const baseUrl = NLM_APIs.PubMed.baseUrl;
  const searchUrl = `${baseUrl}esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json`;

  try {
    const response = await fetch(searchUrl);
    const data = await response.json();
    return data.esearchresult.idlist;
  } catch (error) {
    console.error('Error searching PubMed:', error);
    throw error;
  }
}

/**
 * Example implementation for OpenFDA drug search
 */
export async function searchDrugLabel(drugName: string) {
  const url = `${OpenFDA.baseUrl}drug/label.json?search=openfda.brand_name:"${drugName}"&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.results?.[0];
  } catch (error) {
    console.error('Error searching OpenFDA:', error);
    throw error;
  }
}

/**
 * Example implementation for WHO ICD-11 search
 */
export async function searchICD11(term: string, token: string) {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'API-Version': 'v2',
    'Accept-Language': 'en'
  };

  const url = `${WHO_APIs.ICD11.baseUrl}entity/search?q=${encodeURIComponent(term)}`;

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data.destinationEntities;
  } catch (error) {
    console.error('Error searching ICD-11:', error);
    throw error;
  }
}

/**
 * Example implementation for disease surveillance data
 */
export async function getCDCFluData(region: string = 'National') {
  // This would connect to CDC FluView API
  // Implementation depends on specific data needs
  const mockData = {
    region,
    weeklyRate: 2.8,
    trend: 'increasing',
    severity: 'moderate'
  };
  return mockData;
}

/**
 * Example implementation for drug interactions check
 */
export async function checkDrugInteractions(drugList: string[]) {
  const rxcuis = []; // Would need to convert drug names to RxCUIs first
  const url = `${NLM_APIs.RxNorm.baseUrl}interaction/list.json?rxcuis=${rxcuis.join('+')}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.fullInteractionTypeGroup;
  } catch (error) {
    console.error('Error checking drug interactions:', error);
    throw error;
  }
}

// ============================================
// API KEY MANAGEMENT
// ============================================

/**
 * Centralized API key configuration
 * Store these in environment variables
 */
export const APIKeys = {
  // Add to .env.local
  PUBMED_API_KEY: process.env.NEXT_PUBLIC_PUBMED_API_KEY,
  OPENFDA_API_KEY: process.env.NEXT_PUBLIC_OPENFDA_API_KEY,
  WHO_CLIENT_ID: process.env.NEXT_PUBLIC_WHO_CLIENT_ID,
  WHO_CLIENT_SECRET: process.env.WHO_CLIENT_SECRET,
  INFERMEDICA_APP_ID: process.env.NEXT_PUBLIC_INFERMEDICA_APP_ID,
  INFERMEDICA_API_KEY: process.env.NEXT_PUBLIC_INFERMEDICA_API_KEY,
};

// ============================================
// RATE LIMITING & CACHING
// ============================================

/**
 * Simple rate limiter for API calls
 */
class APIRateLimiter {
  private callCounts: Map<string, { count: number; resetTime: number }> = new Map();

  async checkLimit(apiName: string, limit: number = 10, windowMs: number = 60000): Promise<boolean> {
    const now = Date.now();
    const record = this.callCounts.get(apiName);

    if (!record || now > record.resetTime) {
      this.callCounts.set(apiName, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }
}

export const rateLimiter = new APIRateLimiter();

/**
 * Response caching for expensive API calls
 */
class APICache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();

  set(key: string, data: any, ttlMs: number = 3600000) {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  clear() {
    this.cache.clear();
  }
}

export const apiCache = new APICache();

// ============================================
// EXPORT SUMMARY
// ============================================

export const RECOMMENDED_APIs = {
  essential: [
    'NLM PubMed - Free medical literature',
    'OpenFDA - Drug safety data',
    'RxNorm - Drug normalization',
    'CDC APIs - Disease surveillance',
    'WHO GHO - Global health data'
  ],
  advanced: [
    'Infermedica - Symptom checking',
    'FHIR Servers - Healthcare interoperability',
    'ICD-11 - Disease classification',
    'Clinical Trials - Research data'
  ],
  enterprise: [
    'UpToDate - Clinical decision support',
    'Watson Health - AI insights',
    'Google Healthcare - Medical imaging',
    'ACCME - CME verification'
  ]
};

export default {
  NLM_APIs,
  OpenFDA,
  CDC_APIs,
  WHO_APIs,
  ImagingAPIs,
  ClinicalDecisionAPIs,
  CodingAPIs,
  FHIRServers,
  EducationAPIs,
  searchPubMed,
  searchDrugLabel,
  checkDrugInteractions,
  rateLimiter,
  apiCache,
  RECOMMENDED_APIs
};