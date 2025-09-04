"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  Stethoscope, 
  Plus,
  Search,
  Filter,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  Calendar,
  FileText,
  Activity,
  Heart,
  Thermometer,
  BarChart3,
  ChevronRight,
  Edit,
  Share2,
  Download,
  Upload,
  Settings,
  Bell,
  Shield,
  Star,
  Eye,
  MessageCircle,
  Target,
  TrendingUp,
  Users,
  Building,
  Badge,
  Clipboard,
  Brain,
  Mic,
  Play,
  Pause,
  RotateCcw,
  Save,
  ChevronLeft,
  MicIcon,
  StopCircle,
  Volume2,
  RefreshCw,
  BookOpen,
  GraduationCap,
  Award,
  Zap,
  PlusCircle,
  MinusCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Wifi,
  WifiOff,
  Video,
  PhoneCall,
  Monitor,
  Camera,
  CameraOff,
  MicOff,
  PhoneOff,
  MessageSquare
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  mrn: string;
  room: string;
  admissionDate: Date;
  diagnosis: string;
  primaryDiagnosis: string;
  status: 'stable' | 'critical' | 'improving' | 'deteriorating';
  assignedTo: string;
  attendingPhysician: string;
  lastRounded: Date;
  roundingStatus: 'pending' | 'in-progress' | 'completed';
  alerts: string[];
  vitals: {
    temperature: number;
    heartRate: number;
    bloodPressure: string;
    respiratoryRate: number;
    oxygenSaturation: number;
    lastUpdated: Date;
  };
  labsOrdered: boolean;
  imagingOrdered: boolean;
  consultsPending: number;
  dischargePlanned: boolean;
  priority: 'high' | 'medium' | 'low';
}

interface PatientData {
  // History of Present Illness
  chiefComplaint: string;
  historyOfPresentIllness: string;
  reviewOfSystems: {
    constitutional: string;
    cardiovascular: string;
    respiratory: string;
    gastrointestinal: string;
    genitourinary: string;
    neurological: string;
    musculoskeletal: string;
    dermatological: string;
    psychiatric: string;
  };
  
  // Past Medical History
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  medications: {
    name: string;
    dose: string;
    frequency: string;
    route: string;
  }[];
  allergies: {
    allergen: string;
    reaction: string;
  }[];
  socialHistory: {
    smoking: string;
    alcohol: string;
    drugs: string;
    occupation: string;
    living: string;
  };
  familyHistory: string;
  
  // Physical Exam
  physicalExam: {
    general: string;
    vitals: string;
    cardiovascular: string;
    respiratory: string;
    abdominal: string;
    neurological: string;
    extremities: string;
    skin: string;
  };
  
  // Diagnostics
  labResults: {
    name: string;
    value: string;
    reference: string;
    abnormal: boolean;
    date: Date;
  }[];
  imagingResults: {
    type: string;
    findings: string;
    date: Date;
  }[];
  
  // Assessment & Plan
  assessment: {
    problem: string;
    reasoning: string;
    plan: string;
  }[];
  
  // Goals & Disposition
  goals: string[];
  disposition: string;
  
  // Notes
  notes: string;
  lastUpdated: Date;
  updatedBy: string;
}

interface HPTemplate {
  id: string;
  patientId: string;
  studentId: string;
  studentName: string;
  submittedDate: Date;
  status: 'draft' | 'submitted' | 'reviewed';
  
  // H&P Content
  chiefComplaint: string;
  hpi: string;
  reviewOfSystems: string;
  pastMedicalHistory: string;
  pastSurgicalHistory: string;
  medications: string;
  allergies: string;
  socialHistory: string;
  familyHistory: string;
  physicalExam: string;
  labsImaging: string;
  assessment: string;
  plan: string;
  
  // Review data
  reviews: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: string;
    grade: number; // 1-10
    comments: string;
    reviewDate: Date;
  }[];
  
  averageGrade?: number;
}

interface ProgressNote {
  id: string;
  patientId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  date: Date;
  type: 'admission' | 'progress' | 'discharge' | 'consult';
  status: 'draft' | 'submitted' | 'reviewed';
  
  content: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  
  reviews: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    reviewerRole: string;
    grade: number;
    comments: string;
    reviewDate: Date;
  }[];
  
  averageGrade?: number;
}

interface TeamMember {
  id: string;
  name: string;
  role: 'attending' | 'resident' | 'student' | 'nurse' | 'pharmacist';
  isOnline: boolean;
  lastSeen: Date;
  avatar?: string;
}

interface RemoteRoundingSession {
  id: string;
  patientId: string;
  hostId: string;
  hostName: string;
  startTime: Date;
  endTime?: Date;
  participants: TeamMember[];
  isActive: boolean;
  recordingUrl?: string;
}

const RoundingToolsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'patient-detail' | 'add-patient' | 'practice-mode' | 'hp-template' | 'progress-note' | 'team-notes' | 'remote-rounding'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'room' | 'priority' | 'status'>('room');
  const [loading, setLoading] = useState(true);
  
  // Practice Mode States
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [aiCritique, setAiCritique] = useState('');
  const [aiQuestions, setAiQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [practiceHistory, setPracticeHistory] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['assessment']));
  
  // Data connectivity status
  const [emrConnected, setEmrConnected] = useState(false);

  // Remote Rounding States
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Team notes state
  const [teamNotes, setTeamNotes] = useState<(HPTemplate | ProgressNote)[]>([]);

  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  // Load patient data from EMR integration
  useEffect(() => {
    const loadPatientData = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        
        // TODO: Replace with actual EMR/EHR integration
        // const patientsQuery = query(
        //   collection(db, 'patients'),
        //   where('assignedTo', '==', user.uid),
        //   orderBy('admissionDate', 'desc')
        // );
        // const patientsSnapshot = await getDocs(patientsQuery);
        // const patientsData = patientsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
        // setPatients(patientsData);

        // const teamMembersQuery = query(
        //   collection(db, 'teamMembers'),
        //   where('serviceId', '==', currentServiceId)
        // );
        // const teamMembersSnapshot = await getDocs(teamMembersQuery);
        // const teamMembersData = teamMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember));
        // setTeamMembers(teamMembersData);

        // const teamNotesQuery = query(
        //   collection(db, 'teamNotes'),
        //   where('userId', '==', user.uid),
        //   orderBy('submittedDate', 'desc')
        // );
        // const teamNotesSnapshot = await getDocs(teamNotesQuery);
        // const teamNotesData = teamNotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HPTemplate | ProgressNote));
        // setTeamNotes(teamNotesData);
        
        // Initialize with empty arrays until EMR integration is set up
        setPatients([]);
        setTeamMembers([]);
        setTeamNotes([]);
      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPatientData();
  }, [user]);

  // Initialize patient data template
  const initializePatientData = (patient: Patient): PatientData => {
    return {
      chiefComplaint: '',
      historyOfPresentIllness: '',
      reviewOfSystems: {
        constitutional: '',
        cardiovascular: '',
        respiratory: '',
        gastrointestinal: '',
        genitourinary: '',
        neurological: '',
        musculoskeletal: '',
        dermatological: '',
        psychiatric: ''
      },
      pastMedicalHistory: [],
      pastSurgicalHistory: [],
      medications: [],
      allergies: [],
      socialHistory: {
        smoking: '',
        alcohol: '',
        drugs: '',
        occupation: '',
        living: ''
      },
      familyHistory: '',
      physicalExam: {
        general: '',
        vitals: `T: ${patient.vitals.temperature}°F, HR: ${patient.vitals.heartRate}, BP: ${patient.vitals.bloodPressure}, RR: ${patient.vitals.respiratoryRate}, O2: ${patient.vitals.oxygenSaturation}%`,
        cardiovascular: '',
        respiratory: '',
        abdominal: '',
        neurological: '',
        extremities: '',
        skin: ''
      },
      labResults: [],
      imagingResults: [],
      assessment: [
        {
          problem: patient.primaryDiagnosis,
          reasoning: '',
          plan: ''
        }
      ],
      goals: [],
      disposition: '',
      notes: '',
      lastUpdated: new Date(),
      updatedBy: user?.displayName || 'Unknown'
    };
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.mrn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || patient.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'room':
        return a.room.localeCompare(b.room);
      case 'priority':
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-green-100 text-green-800';
      case 'critical': return 'bg-red-100 text-red-800';
      case 'improving': return 'bg-blue-100 text-blue-800';
      case 'deteriorating': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoundingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setPatientData(initializePatientData(patient));
    setViewMode('patient-detail');
    setIsPracticeMode(false);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const updatePatientData = (section: keyof PatientData, value: any) => {
    if (!patientData) {
      return;
    }
    
    setPatientData({
      ...patientData,
      [section]: value,
      lastUpdated: new Date(),
      updatedBy: user?.displayName || 'Unknown'
    });
  };

  const startPracticeMode = () => {
    setIsPracticeMode(true);
    setViewMode('practice-mode');
    setTranscription('');
    setAiCritique('');
    setAiQuestions([]);
    setCurrentQuestion(0);
  };

  const simulateRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate transcription after recording
      setTimeout(() => {
        setTranscription("This is a 68-year-old male with a history of coronary artery disease who presented with chest pain...");
        setIsRecording(false);
        generateAICritique();
      }, 3000);
    }
  };

  const generateAICritique = () => {
    // Simulate AI critique
    setTimeout(() => {
      setAiCritique(`
        **Strong Points:**
        • Clear opening with age, gender, and relevant history
        • Good chronological presentation of symptoms
        
        **Areas for Improvement:**
        • Consider mentioning vital signs earlier in presentation
        • Include more specific details about chest pain characteristics (quality, radiation, timing)
        • Assessment and plan could be more structured by problem
        
        **Suggestions:**
        • Use standard format: "This is a [age]-year-old [gender] with PMH significant for [relevant history] who presents with [chief complaint]"
        • Organize assessment by problem list with specific plans for each
      `);
      
      setAiQuestions([
        "What are the key risk factors for STEMI in this patient?",
        "What would be your differential diagnosis for chest pain in a 68-year-old male?",
        "What are the contraindications to thrombolytic therapy?",
        "How would you manage this patient's heart failure?"
      ]);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Stethoscope className="h-12 w-12 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading patient list...</p>
        </div>
      </div>
    );
  }

  // H&P Template View
  if (viewMode === 'hp-template' && selectedPatient) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('patient-detail')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Chart
                </button>
                <FileText className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">History & Physical Template</h1>
                  <p className="text-blue-50">{selectedPatient.name} - Room {selectedPatient.room}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold">
                  <Upload className="h-4 w-4" />
                  Submit for Review
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Template Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">History and Physical Examination</h2>
                  <p className="text-gray-600">Complete this form for {selectedPatient.name}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Last saved: {new Date().toLocaleString()}
                </div>
              </div>
            </div>

            {/* H&P Form */}
            <div className="p-6 space-y-8">
              {/* Chief Complaint */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Chief Complaint</label>
                <textarea
                  placeholder="Patient's primary complaint in their own words..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                />
              </div>

              {/* History of Present Illness */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">History of Present Illness</label>
                <textarea
                  placeholder="Chronological account of the current illness including onset, quality, radiation, severity, timing, context, modifying factors, and associated symptoms..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                />
              </div>

              {/* Review of Systems */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Review of Systems</label>
                <textarea
                  placeholder="Constitutional: fever, chills, weight loss/gain, fatigue&#10;HEENT: headache, vision changes, hearing loss&#10;Cardiovascular: chest pain, palpitations, dyspnea, orthopnea, PND, syncope&#10;Respiratory: cough, dyspnea, wheeze, sputum production&#10;Gastrointestinal: nausea, vomiting, diarrhea, constipation, abdominal pain&#10;Genitourinary: dysuria, frequency, urgency, hematuria&#10;Musculoskeletal: joint pain, swelling, stiffness&#10;Neurological: weakness, numbness, seizures, confusion&#10;Skin: rash, lesions, bruising&#10;Psychiatric: mood changes, anxiety, depression"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-40"
                />
              </div>

              {/* Past Medical History */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Past Medical History</label>
                <textarea
                  placeholder="Previous medical conditions, hospitalizations, and chronic diseases..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                />
              </div>

              {/* Past Surgical History */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Past Surgical History</label>
                <textarea
                  placeholder="Previous surgeries with dates and complications..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                />
              </div>

              {/* Medications */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Current Medications</label>
                <textarea
                  placeholder="Current medications with doses, frequencies, and routes. Include over-the-counter medications and supplements..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                />
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Allergies</label>
                <textarea
                  placeholder="Drug allergies and reactions. If no known allergies, state 'NKDA'..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                />
              </div>

              {/* Social History */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Social History</label>
                <textarea
                  placeholder="Smoking, alcohol use, recreational drugs, occupation, living situation, sexual history, travel history..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                />
              </div>

              {/* Family History */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Family History</label>
                <textarea
                  placeholder="Relevant family history of medical conditions..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                />
              </div>

              {/* Physical Examination */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Physical Examination</label>
                <textarea
                  placeholder="General: Alert, oriented, well-appearing vs ill-appearing, distress level&#10;Vital Signs: Temperature, BP, HR, RR, O2 sat, pain score&#10;HEENT: PERRL, EOMI, no scleral icterus, moist mucous membranes&#10;Neck: No JVD, no lymphadenopathy, no thyromegaly&#10;Cardiovascular: Rate, rhythm, murmurs, gallops, rubs&#10;Pulmonary: Effort, breath sounds, adventitious sounds&#10;Abdominal: Bowel sounds, tenderness, organomegaly, masses&#10;Extremities: Edema, pulses, cyanosis, clubbing&#10;Neurological: Mental status, cranial nerves, motor, sensory, reflexes&#10;Skin: Color, temperature, turgor, lesions"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-48"
                />
              </div>

              {/* Labs and Imaging */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Laboratory Results and Imaging</label>
                <textarea
                  placeholder="Relevant laboratory values, imaging results, and other diagnostic studies..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                />
              </div>

              {/* Assessment */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Assessment</label>
                <textarea
                  placeholder="Clinical impression and differential diagnosis. List problems in order of priority..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">Plan</label>
                <textarea
                  placeholder="Detailed management plan for each problem. Include diagnostic workup, treatments, monitoring, and follow-up..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-40"
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>After submission, your H&P will be visible to the rounding team for review and feedback.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition-colors">
                    Save Draft
                  </button>
                  <button className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-xl transition-colors font-semibold">
                    Submit for Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Progress Note View
  if (viewMode === 'progress-note' && selectedPatient) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('patient-detail')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Chart
                </button>
                <Edit className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">Progress Note</h1>
                  <p className="text-blue-50">{selectedPatient.name} - {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select className="bg-white/20 border border-white/30 text-white rounded-xl px-4 py-2">
                  <option value="progress">Progress Note</option>
                  <option value="admission">Admission Note</option>
                  <option value="discharge">Discharge Note</option>
                  <option value="consult">Consult Note</option>
                </select>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Draft
                </button>
                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold">
                  <Upload className="h-4 w-4" />
                  Submit Note
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg">
            {/* Note Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Patient Information</h3>
                  <p className="text-gray-600">Name: {selectedPatient.name}</p>
                  <p className="text-gray-600">MRN: {selectedPatient.mrn}</p>
                  <p className="text-gray-600">Room: {selectedPatient.room}</p>
                  <p className="text-gray-600">DOB: [Patient DOB]</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Note Details</h3>
                  <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
                  <p className="text-gray-600">Author: {user?.displayName || 'Current User'}</p>
                  <p className="text-gray-600">Service: Internal Medicine</p>
                </div>
              </div>
            </div>

            {/* SOAP Note Format */}
            <div className="p-6 space-y-8">
              {/* Subjective */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  Subjective
                </label>
                <textarea
                  placeholder="Patient's subjective complaints, symptoms, and concerns. Include interval history since last note..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                />
              </div>

              {/* Objective */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  Objective
                </label>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Vital Signs</h4>
                    <input
                      type="text"
                      placeholder="T: 98.6°F, BP: 120/80, HR: 72, RR: 16, O2: 98% RA"
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Physical Examination</h4>
                    <textarea
                      placeholder="Focused physical examination findings relevant to patient's condition..."
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Laboratory/Imaging Results</h4>
                    <textarea
                      placeholder="New laboratory values, imaging results, and other diagnostic studies since last note..."
                      className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
                    />
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Assessment
                </label>
                <textarea
                  placeholder="Clinical assessment of patient's current status. Address each active problem with your clinical reasoning..."
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                />
              </div>

              {/* Plan */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clipboard className="h-5 w-5 text-orange-600" />
                  Plan
                </label>
                <textarea
                  placeholder="Detailed plan for each problem including:&#10;• Diagnostic workup&#10;• Therapeutic interventions&#10;• Monitoring parameters&#10;• Goals of care&#10;• Disposition planning"
                  className="w-full p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-40"
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <p>Progress notes will be visible to the entire care team and can be reviewed for educational feedback.</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl transition-colors">
                    Save Draft
                  </button>
                  <button className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-2 rounded-xl transition-colors font-semibold">
                    Submit Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Team Notes View
  if (viewMode === 'team-notes') {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Patients
                </button>
                <Users className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">Team Notes & Reviews</h1>
                  <p className="text-orange-100">Review and grade student submissions</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <select className="bg-white/20 border border-white/30 text-white rounded-xl px-4 py-2">
                  <option value="all">All Notes</option>
                  <option value="pending">Pending Review</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="hp">H&P Only</option>
                  <option value="progress">Progress Notes Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Team Members Online */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Team Members Online</h2>
            <div className="flex items-center gap-4">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${member.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name}</p>
                    <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="space-y-6">
            {teamNotes.map(note => (
              <div key={note.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {'chiefComplaint' in note ? 'History & Physical' : 'Progress Note'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Patient: {patients.find(p => p.id === note.patientId)?.name}</span>
                        <span>
                          Author: {'studentName' in note ? note.studentName : note.authorName}
                        </span>
                        <span>
                          Submitted: {'submittedDate' in note
                            ? note.submittedDate.toLocaleDateString()
                            : (note as ProgressNote).date.toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                          note.status === 'reviewed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {note.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {note.averageGrade && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{note.averageGrade}</div>
                          <div className="text-xs text-gray-600">Grade</div>
                        </div>
                      )}
                      <button className="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded-xl transition-colors">
                        Review & Grade
                      </button>
                    </div>
                  </div>
                </div>

                {/* Note Content Preview */}
                <div className="p-6">
                  {'chiefComplaint' in note ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Chief Complaint</h4>
                        <p className="text-gray-700 text-sm mb-4">{note.chiefComplaint}</p>
                        <h4 className="font-semibold text-gray-900 mb-2">Assessment</h4>
                        <p className="text-gray-700 text-sm">{note.assessment}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Plan</h4>
                        <p className="text-gray-700 text-sm">{note.plan}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Subjective</h4>
                        <p className="text-gray-700 text-sm mb-4">{(note as ProgressNote).content.subjective}</p>
                        <h4 className="font-semibold text-gray-900 mb-2">Assessment</h4>
                        <p className="text-gray-700 text-sm">{(note as ProgressNote).content.assessment}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Objective</h4>
                        <p className="text-gray-700 text-sm mb-4">{(note as ProgressNote).content.objective}</p>
                        <h4 className="font-semibold text-gray-900 mb-2">Plan</h4>
                        <p className="text-gray-700 text-sm">{(note as ProgressNote).content.plan}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Reviews */}
                {note.reviews.length > 0 && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4">Reviews & Feedback</h4>
                    <div className="space-y-4">
                      {note.reviews.map(review => (
                        <div key={review.id} className="bg-white rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {review.reviewerName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{review.reviewerName}</p>
                                <p className="text-xs text-gray-600 capitalize">{review.reviewerRole}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {[1,2,3,4,5].map(star => (
                                  <Star 
                                    key={star} 
                                    className={`h-4 w-4 ${star <= review.grade/2 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                              <span className="font-semibold">{review.grade}/10</span>
                            </div>
                          </div>
                          <p className="text-gray-700 text-sm">{review.comments}</p>
                          <p className="text-xs text-gray-500 mt-2">{review.reviewDate.toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Review */}
                {note.status === 'submitted' && (
                  <div className="p-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Add Your Review</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">Grade (1-10):</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          className="w-20 p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className="h-5 w-5 text-gray-300 cursor-pointer hover:text-yellow-400" />
                          ))}
                        </div>
                      </div>
                      <textarea
                        placeholder="Provide detailed feedback on strengths and areas for improvement..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                      />
                      <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl transition-colors font-semibold">
                        Submit Review
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Remote Rounding View
  if (viewMode === 'remote-rounding') {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Patients
                </button>
                <Video className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">Remote Rounding Session</h1>
                  <p className="text-red-100">Virtual collaboration with your care team</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  • Live Session
                </span>
                <select className="bg-white/20 border border-white/30 text-white rounded-xl px-4 py-2">
                  <option value="">Select Patient</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} - Room {patient.room}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Video Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Video Grid */}
              <div className="bg-black rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2 gap-2 p-4">
                  {/* Main Speaker */}
                  <div className="col-span-2 aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
                    <div className="text-center text-white">
                      <Users className="h-16 w-16 mx-auto mb-4 opacity-80" />
                      <p className="text-xl">Dr. Sarah Johnson</p>
                      <p className="text-sm opacity-80">Attending Physician</p>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      Speaking
                    </div>
                  </div>
                  
                  {/* Participant Videos */}
                  {teamMembers.filter(m => m.isOnline).map(member => (
                    <div key={member.id} className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center relative">
                      <div className="text-center text-white">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mx-auto mb-2">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <p className="text-sm">{member.name}</p>
                        <p className="text-xs opacity-80 capitalize">{member.role}</p>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        {member.name === user?.displayName ? (
                          <div className="flex gap-1">
                            <button 
                              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                              className={`p-2 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                              {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                            </button>
                            <button 
                              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                              className={`p-2 rounded-full ${isVideoEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                            >
                              {isVideoEnabled ? <Camera className="h-4 w-4" /> : <CameraOff className="h-4 w-4" />}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-green-500 w-3 h-3 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Video Controls */}
                <div className="bg-gray-800 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      className={`p-3 rounded-full transition-colors ${
                        isAudioEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {isAudioEnabled ? <Mic className="h-5 w-5 text-white" /> : <MicOff className="h-5 w-5 text-white" />}
                    </button>
                    <button 
                      onClick={() => setIsVideoEnabled(!isVideoEnabled)}
                      className={`p-3 rounded-full transition-colors ${
                        isVideoEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                      }`}
                    >
                      {isVideoEnabled ? <Camera className="h-5 w-5 text-white" /> : <CameraOff className="h-5 w-5 text-white" />}
                    </button>
                    <button 
                      onClick={() => setIsScreenSharing(!isScreenSharing)}
                      className={`p-3 rounded-full transition-colors ${
                        isScreenSharing ? 'bg-blue-500 hover:bg-blue-800' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      <Monitor className="h-5 w-5 text-white" />
                    </button>
                  </div>
                  
                  <div className="text-white text-sm">
                    Session: 00:24:18
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button className="bg-gray-600 hover:bg-gray-700 text-white p-3 rounded-full transition-colors">
                      <Settings className="h-5 w-5" />
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full transition-colors font-semibold">
                      End Session
                    </button>
                  </div>
                </div>
              </div>

              {/* Patient Information Panel */}
              {selectedPatient && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Currently Discussing: {selectedPatient.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Patient Info</h4>
                      <p className="text-sm text-gray-600">Age: {selectedPatient.age}</p>
                      <p className="text-sm text-gray-600">Room: {selectedPatient.room}</p>
                      <p className="text-sm text-gray-600">MRN: {selectedPatient.mrn}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Diagnosis</h4>
                      <p className="text-sm text-gray-700">{selectedPatient.primaryDiagnosis}</p>
                      <p className="text-xs text-gray-600 mt-1">{selectedPatient.diagnosis}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">Current Vitals</h4>
                      <p className="text-sm text-gray-600">HR: {selectedPatient.vitals.heartRate}</p>
                      <p className="text-sm text-gray-600">BP: {selectedPatient.vitals.bloodPressure}</p>
                      <p className="text-sm text-gray-600">O2: {selectedPatient.vitals.oxygenSaturation}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Chat */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Team Chat</h3>
                </div>
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      SJ
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">Dr. Sarah Johnson</p>
                      <p className="text-sm text-gray-800">Let's review Mr. Smith's latest labs</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                      You
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-600">You</p>
                      <p className="text-sm text-gray-800">Troponin levels are trending down</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors">
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Participants ({teamMembers.filter(m => m.isOnline).length})</h3>
                <div className="space-y-3">
                  {teamMembers.filter(m => m.isOnline).map(member => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-600 capitalize">{member.role}</p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FileText className="h-4 w-4" />
                    Share Patient Notes
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    Display Lab Results
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Brain className="h-4 w-4" />
                    Start AI Simulation
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    Record Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Patient Detail View
  if (viewMode === 'patient-detail' && selectedPatient && patientData) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-x-hidden">
        {/* Header */}
        <div className="bg-blue-800 text-white shadow-xl overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('list')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Patient List
                </button>
                <Stethoscope className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">{selectedPatient.name}</h1>
                  <p className="text-blue-50">Room {selectedPatient.room} • {selectedPatient.primaryDiagnosis}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white/20 rounded-lg px-3 py-2">
                  {emrConnected ? (
                    <>
                      <Wifi className="h-4 w-4 text-green-300" />
                      <span className="text-sm">EMR Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-orange-300" />
                      <span className="text-sm">Manual Entry</span>
                    </>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedPatient.status)}`}>
                  {selectedPatient.status}
                </span>
                <button
                  onClick={startPracticeMode}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                >
                  <Brain className="h-4 w-4" />
                  Practice Presentation
                </button>
                <button 
                  onClick={() => setViewMode('hp-template')}
                  className="bg-blue-500 hover:bg-blue-800 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                >
                  <FileText className="h-4 w-4" />
                  H&P Template
                </button>
                <button 
                  onClick={() => setViewMode('progress-note')}
                  className="bg-purple-500 hover:bg-blue-800 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                >
                  <Edit className="h-4 w-4" />
                  Progress Note
                </button>
                <button 
                  onClick={() => setViewMode('team-notes')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                >
                  <Users className="h-4 w-4" />
                  Team Notes
                </button>
                <button 
                  onClick={() => setViewMode('remote-rounding')}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold"
                >
                  <Video className="h-4 w-4" />
                  Remote Rounds
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors">
                  <Save className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="xl:col-span-3 space-y-6">
              
              {/* Chief Complaint & HPI */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div 
                  className="p-6 border-b border-gray-200 cursor-pointer"
                  onClick={() => toggleSection('hpi')}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      History of Present Illness
                    </h2>
                    {expandedSections.has('hpi') ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
                {expandedSections.has('hpi') && (
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Chief Complaint</label>
                      <input
                        type="text"
                        value={patientData.chiefComplaint}
                        onChange={(e) => updatePatientData('chiefComplaint', e.target.value)}
                        placeholder="Patient's main complaint in their own words..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">History of Present Illness</label>
                      <textarea
                        value={patientData.historyOfPresentIllness}
                        onChange={(e) => updatePatientData('historyOfPresentIllness', e.target.value)}
                        placeholder="Detailed chronological account of the current illness..."
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-32"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Physical Examination */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div 
                  className="p-6 border-b border-gray-200 cursor-pointer"
                  onClick={() => toggleSection('physical')}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-green-600" />
                      Physical Examination
                    </h2>
                    {expandedSections.has('physical') ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
                {expandedSections.has('physical') && (
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">General Appearance</label>
                        <textarea
                          value={patientData.physicalExam.general}
                          onChange={(e) => updatePatientData('physicalExam', {...patientData.physicalExam, general: e.target.value})}
                          placeholder="Overall appearance, distress level..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Vital Signs</label>
                        <textarea
                          value={patientData.physicalExam.vitals}
                          onChange={(e) => updatePatientData('physicalExam', {...patientData.physicalExam, vitals: e.target.value})}
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cardiovascular</label>
                        <textarea
                          value={patientData.physicalExam.cardiovascular}
                          onChange={(e) => updatePatientData('physicalExam', {...patientData.physicalExam, cardiovascular: e.target.value})}
                          placeholder="Heart sounds, murmurs, JVD..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Respiratory</label>
                        <textarea
                          value={patientData.physicalExam.respiratory}
                          onChange={(e) => updatePatientData('physicalExam', {...patientData.physicalExam, respiratory: e.target.value})}
                          placeholder="Breath sounds, effort..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Abdominal</label>
                        <textarea
                          value={patientData.physicalExam.abdominal}
                          onChange={(e) => updatePatientData('physicalExam', {...patientData.physicalExam, abdominal: e.target.value})}
                          placeholder="Bowel sounds, tenderness..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Neurological</label>
                        <textarea
                          value={patientData.physicalExam.neurological}
                          onChange={(e) => updatePatientData('physicalExam', {...patientData.physicalExam, neurological: e.target.value})}
                          placeholder="Mental status, motor, sensory..."
                          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Assessment & Plan */}
              <div className="bg-white rounded-2xl shadow-lg">
                <div 
                  className="p-6 border-b border-gray-200 cursor-pointer"
                  onClick={() => toggleSection('assessment')}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Assessment & Plan
                    </h2>
                    {expandedSections.has('assessment') ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </div>
                {expandedSections.has('assessment') && (
                  <div className="p-6 space-y-4">
                    {patientData.assessment.map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={item.problem}
                            onChange={(e) => {
                              const newAssessment = [...patientData.assessment];
                              newAssessment[index].problem = e.target.value;
                              updatePatientData('assessment', newAssessment);
                            }}
                            placeholder="Problem/Diagnosis"
                            className="flex-1 font-semibold text-lg p-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => {
                              const newAssessment = patientData.assessment.filter((_, i) => i !== index);
                              updatePatientData('assessment', newAssessment);
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <MinusCircle className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Assessment/Reasoning</label>
                            <textarea
                              value={item.reasoning}
                              onChange={(e) => {
                                const newAssessment = [...patientData.assessment];
                                newAssessment[index].reasoning = e.target.value;
                                updatePatientData('assessment', newAssessment);
                              }}
                              placeholder="Clinical reasoning for this problem..."
                              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                            <textarea
                              value={item.plan}
                              onChange={(e) => {
                                const newAssessment = [...patientData.assessment];
                                newAssessment[index].plan = e.target.value;
                                updatePatientData('assessment', newAssessment);
                              }}
                              placeholder="Specific management plan..."
                              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newAssessment = [...patientData.assessment, { problem: '', reasoning: '', plan: '' }];
                        updatePatientData('assessment', newAssessment);
                      }}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <PlusCircle className="h-4 w-4" />
                      Add Problem
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Patient Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Patient Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{selectedPatient.age} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{selectedPatient.gender === 'M' ? 'Male' : 'Female'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">MRN:</span>
                    <span className="font-medium">{selectedPatient.mrn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{selectedPatient.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Attending:</span>
                    <span className="font-medium">{selectedPatient.attendingPhysician}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission:</span>
                    <span className="font-medium">{selectedPatient.admissionDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Current Vitals */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-red-600" />
                  Current Vitals
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600">Temperature</span>
                    </div>
                    <span className="font-medium">{selectedPatient.vitals.temperature}°F</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">Heart Rate</span>
                    </div>
                    <span className="font-medium">{selectedPatient.vitals.heartRate} bpm</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-600">Blood Pressure</span>
                    </div>
                    <span className="font-medium">{selectedPatient.vitals.bloodPressure} mmHg</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Respiratory Rate</span>
                    </div>
                    <span className="font-medium">{selectedPatient.vitals.respiratoryRate} /min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-600">O2 Saturation</span>
                    </div>
                    <span className="font-medium">{selectedPatient.vitals.oxygenSaturation}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Last updated: {selectedPatient.vitals.lastUpdated.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Alerts */}
              {selectedPatient.alerts.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Active Alerts
                  </h3>
                  <div className="space-y-2">
                    {selectedPatient.alerts.map((alert, index) => (
                      <div key={index} className="bg-white border border-orange-200 rounded-lg p-3">
                        <p className="text-sm text-orange-800">{alert}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <BarChart3 className="h-4 w-4" />
                    View Lab Results
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Eye className="h-4 w-4" />
                    View Imaging
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <FileText className="h-4 w-4" />
                    View Previous Notes
                  </button>
                  <button className="w-full flex items-center gap-2 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <Users className="h-4 w-4" />
                    Consult Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Practice Mode View
  if (viewMode === 'practice-mode' && selectedPatient) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setViewMode('patient-detail')}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Chart
                </button>
                <Brain className="h-8 w-8" />
                <div>
                  <h1 className="text-2xl font-bold">AI Practice Mode</h1>
                  <p className="text-blue-50">{selectedPatient.name} - Practice Presentation</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 rounded-lg px-3 py-2">
                  <span className="text-sm font-medium">Session 1</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Practice Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recording Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Mic className="h-5 w-5 text-green-600" />
                  Record Your Presentation
                </h2>
                <div className="text-center py-8">
                  <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-green-100'
                  }`}>
                    {isRecording ? (
                      <StopCircle className="h-12 w-12 text-red-600" />
                    ) : (
                      <MicIcon className="h-12 w-12 text-green-600" />
                    )}
                  </div>
                  <button
                    onClick={simulateRecording}
                    className={`px-8 py-3 rounded-xl text-white font-semibold transition-all ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isRecording ? 'Stop Recording' : 'Start Presentation'}
                  </button>
                  <p className="text-gray-600 mt-2 text-sm">
                    {isRecording ? 'Recording your presentation...' : 'Click to begin recording your patient presentation'}
                  </p>
                </div>
              </div>

              {/* Transcription */}
              {transcription && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Your Presentation Transcript
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{transcription}</p>
                  </div>
                </div>
              )}

              {/* AI Critique */}
              {aiCritique && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    AI Feedback & Critique
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-blue-900">{aiCritique}</pre>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Questions */}
              {aiQuestions.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    AI "Pimping" Session
                  </h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      Question {currentQuestion + 1} of {aiQuestions.length}:
                    </h4>
                    <p className="text-yellow-800">{aiQuestions[currentQuestion]}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentQuestion(Math.min(aiQuestions.length - 1, currentQuestion + 1))}
                      disabled={currentQuestion === aiQuestions.length - 1}
                      className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Question
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                      <Mic className="h-4 w-4" />
                      Record Answer
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Practice Tips */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  Presentation Tips
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="font-semibold text-green-900 mb-1">Structure</h4>
                    <p className="text-green-800">Start with age, gender, PMH, and chief complaint</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold text-blue-900 mb-1">Clarity</h4>
                    <p className="text-blue-800">Speak clearly and at appropriate pace</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h4 className="font-semibold text-purple-900 mb-1">Organization</h4>
                    <p className="text-purple-800">Follow standard SOAP format</p>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Session Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Presentation Structure</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clinical Reasoning</span>
                      <span>70%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: '70%'}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Clarity & Pace</span>
                      <span>90%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice History */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">John Smith</p>
                      <p className="text-xs text-gray-600">2 hours ago</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">92%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">Maria Rodriguez</p>
                      <p className="text-xs text-gray-600">1 day ago</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Patient List View (unchanged from original)
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-blue-800 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Stethoscope className="h-12 w-12" />
              <div>
                <h1 className="text-4xl font-bold mb-2">Patient List & Rounding Tools</h1>
                <p className="text-blue-50 text-xl">Manage your patients and prepare for rounds</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-blue-50 text-sm">Total Patients</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-red-300">
                  {patients.filter(p => p.priority === 'high').length}
                </div>
                <p className="text-blue-50 text-sm">High Priority</p>
              </div>
              <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                <div className="text-2xl font-bold text-green-300">
                  {patients.filter(p => p.roundingStatus === 'completed').length}
                </div>
                <p className="text-blue-50 text-sm">Rounded Today</p>
              </div>
              <button
                onClick={() => setViewMode('add-patient')}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-colors font-semibold"
              >
                <Plus className="h-5 w-5" />
                Add Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions & Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, MRN, room, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="all">All Status</option>
                <option value="stable">Stable</option>
                <option value="critical">Critical</option>
                <option value="improving">Improving</option>
                <option value="deteriorating">Deteriorating</option>
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="all">All Priority</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="room">Sort by Room</option>
                <option value="name">Sort by Name</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>

              <button className="flex items-center gap-2 bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors">
                <Filter className="h-4 w-4" />
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Alerts Banner */}
        {patients.some(p => p.alerts.length > 0) && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-orange-600" />
              <div>
                <h3 className="font-semibold text-orange-900">Active Alerts</h3>
                <p className="text-orange-700 text-sm">
                  {patients.reduce((acc, p) => acc + p.alerts.length, 0)} active alerts across your patients
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Patient Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedPatients.map((patient) => (
            <div
              key={patient.id}
              onClick={() => handlePatientClick(patient)}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden border-l-4 ${
                patient.priority === 'high' ? 'border-red-500' :
                patient.priority === 'medium' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="p-6">
                {/* Patient Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{patient.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{patient.age}y {patient.gender}</span>
                      <span>•</span>
                      <span>Room {patient.room}</span>
                      <span>•</span>
                      <span>{patient.mrn}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoundingStatusColor(patient.roundingStatus)}`}>
                      {patient.roundingStatus.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-4">
                  <p className="text-gray-900 font-medium">{patient.primaryDiagnosis}</p>
                  <p className="text-sm text-gray-600">{patient.diagnosis}</p>
                </div>

                {/* Vitals */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-700">HR</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{patient.vitals.heartRate}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">BP</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{patient.vitals.bloodPressure}</p>
                  </div>
                </div>

                {/* Alerts */}
                {patient.alerts.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-orange-700">Active Alerts</span>
                    </div>
                    {patient.alerts.slice(0, 2).map((alert, index) => (
                      <p key={index} className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded mb-1">
                        {alert}
                      </p>
                    ))}
                    {patient.alerts.length > 2 && (
                      <p className="text-xs text-orange-600">+{patient.alerts.length - 2} more alerts</p>
                    )}
                  </div>
                )}

                {/* Action Items */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    {patient.labsOrdered && (
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        Labs
                      </div>
                    )}
                    {patient.imagingOrdered && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Imaging
                      </div>
                    )}
                    {patient.consultsPending > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {patient.consultsPending} consults
                      </div>
                    )}
                  </div>
                  {patient.dischargePlanned && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Discharge planned
                    </span>
                  )}
                </div>

                {/* Last Rounded */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    Last rounded: {patient.lastRounded.toLocaleDateString()}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {sortedPatients.length === 0 && (
          <div className="space-y-8">
            {/* No Patients Message */}
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No patients found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                    ? 'Try adjusting your search criteria or filters'
                    : 'Add your first patient to get started with rounding tools'
                  }
                </p>
                {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                  <button
                    onClick={() => setViewMode('add-patient')}
                    className="bg-blue-800 text-white px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors font-semibold"
                  >
                    Add First Patient
                  </button>
                )}
              </div>
            </div>

            {/* Tools Preview Section */}
            {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Target className="h-8 w-8 text-blue-600" />
                  Available Rounding Tools
                </h2>
                <p className="text-gray-600 mb-8">
                  Once you add patients, you'll have access to these powerful clinical tools:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                  {/* Main Tool Cards - Compact with onClick */}
                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access H&P Templates');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-purple-100 rounded-lg mb-3 inline-block">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">H&P Templates</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      History & Physical documentation
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Procedure Notes');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg mb-3 inline-block">
                      <Clipboard className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Procedure Notes</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Documentation & consent forms
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Progress Notes');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-red-100 rounded-lg mb-3 inline-block">
                      <Activity className="h-5 w-5 text-red-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Progress Notes</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      SOAP note templates
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access AI Practice Mode');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-green-100 rounded-lg mb-3 inline-block">
                      <Brain className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">AI Practice</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Presentation feedback
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Discharge Planning');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-blue-100 rounded-lg mb-3 inline-block">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Discharge Plans</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Summaries & instructions
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Virtual Rounds');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-indigo-100 rounded-lg mb-3 inline-block">
                      <Video className="h-5 w-5 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Virtual Rounds</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Remote collaboration
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Vitals Tracking');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-cyan-100 rounded-lg mb-3 inline-block">
                      <Heart className="h-5 w-5 text-cyan-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Vitals Tracking</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Real-time monitoring
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Lab Results');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-emerald-100 rounded-lg mb-3 inline-block">
                      <BarChart3 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Lab Results</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Integration & trending
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Please add a patient first to access Team Handoffs');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-yellow-100 rounded-lg mb-3 inline-block">
                      <Users className="h-5 w-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Team Handoffs</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Communication tools
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Voice-to-Text feature coming soon!');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-pink-100 rounded-lg mb-3 inline-block">
                      <Mic className="h-5 w-5 text-pink-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Voice-to-Text</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Dictation support
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Smart Alerts feature coming soon!');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-violet-100 rounded-lg mb-3 inline-block">
                      <Bell className="h-5 w-5 text-violet-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Smart Alerts</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Critical notifications
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Schedule Management feature coming soon!');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-teal-100 rounded-lg mb-3 inline-block">
                      <Calendar className="h-5 w-5 text-teal-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Schedule Mgmt</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Rounds planning
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('HIPAA-compliant storage is enabled for all patient data');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-rose-100 rounded-lg mb-3 inline-block">
                      <Shield className="h-5 w-5 text-rose-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">HIPAA Security</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Compliant storage
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Data Export feature coming soon!');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-amber-100 rounded-lg mb-3 inline-block">
                      <Database className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Data Export</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Reports & analytics
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('Offline Mode feature coming soon!');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-lime-100 rounded-lg mb-3 inline-block">
                      <Wifi className="h-5 w-5 text-lime-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">Offline Mode</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Work without internet
                    </p>
                  </div>

                  <div 
                    onClick={() => {
                      alert('PDF Export feature coming soon!');
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow hover:scale-105 cursor-pointer"
                  >
                    <div className="p-2 bg-slate-100 rounded-lg mb-3 inline-block">
                      <Download className="h-5 w-5 text-slate-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">PDF Export</h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      Download documents
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => setViewMode('add-patient')}
                    className="bg-blue-800 text-white px-8 py-4 rounded-xl hover:bg-blue-900 transition-colors font-semibold text-lg inline-flex items-center gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    Add Your First Patient to Get Started
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoundingToolsPage;