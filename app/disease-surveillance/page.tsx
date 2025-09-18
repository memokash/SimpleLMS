'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  Calendar,
  Users,
  Globe,
  Target,
  Zap,
  Eye,
  Clock,
  Search,
  Download,
  Share2,
  Bell,
  Shield,
  Heart,
  ThermometerSun,
  Stethoscope,
  Microscope,
  Siren,
  FileText,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface DiseaseReport {
  id: string;
  condition: string;
  category: 'infectious' | 'chronic' | 'acute' | 'emergency';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  location: {
    country: string;
    state: string;
    city: string;
    coordinates?: [number, number];
  };
  reportedBy: string;
  institution: string;
  patientDemographics: {
    ageGroup: string;
    gender: string;
    count: number;
  };
  symptoms: string[];
  timestamp: string;
  verified: boolean;
}

interface SurveillanceAlert {
  id: string;
  type: 'outbreak' | 'spike' | 'unusual_pattern' | 'cluster';
  condition: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  caseCount: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  description: string;
  timestamp: string;
}

const DiseaseSurveillance = () => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAlerts, setActiveAlerts] = useState<SurveillanceAlert[]>([]);
  const [recentReports, setRecentReports] = useState<DiseaseReport[]>([]);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Load data from Firebase on component mount
  useEffect(() => {
    // TODO: Implement Firebase data fetching
    // fetchActiveAlerts();
    // fetchRecentReports();
  }, []);

  const getAlertColor = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 border-red-300 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getAlertIcon = (type: string) => {
    switch(type) {
      case 'outbreak': return Siren;
      case 'spike': return TrendingUp;
      case 'unusual_pattern': return Target;
      case 'cluster': return Users;
      default: return AlertTriangle;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'increasing': return TrendingUp;
      case 'decreasing': return TrendingDown;
      default: return Activity;
    }
  };

  const [topConditions, setTopConditions] = useState<any[]>([]);

  // TODO: Load top conditions from Firebase
  useEffect(() => {
    // fetchTopConditions();
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#07294d] mb-2">Disease Surveillance Dashboard</h1>
              <p className="text-gray-600">Real-time monitoring and reporting of medical conditions worldwide</p>
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Report Condition
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Siren className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">23</p>
                <p className="text-xs text-gray-600">Active Alerts</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">3,247</p>
                <p className="text-xs text-gray-600">Reports (7d)</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">89%</p>
                <p className="text-xs text-gray-600">Verified</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">127</p>
                <p className="text-xs text-gray-600">Countries</p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">+23%</p>
                <p className="text-xs text-gray-600">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Active Alerts Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" />
              Active Surveillance Alerts
            </h2>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
              <option>All Severities</option>
              <option>Critical Only</option>
              <option>High Priority</option>
            </select>
          </div>

          <div className="space-y-3">
            {activeAlerts.map(alert => {
              const AlertIcon = getAlertIcon(alert.type);
              const TrendIcon = getTrendIcon(alert.trend);
              return (
                <div key={alert.id} className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-white/50 rounded-lg flex items-center justify-center">
                        <AlertIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                            alert.severity === 'critical' ? 'bg-red-600 text-white' :
                            alert.severity === 'high' ? 'bg-orange-600 text-white' :
                            alert.severity === 'medium' ? 'bg-yellow-600 text-white' :
                            'bg-blue-600 text-white'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-600">{alert.timestamp}</span>
                        </div>
                        <h3 className="font-semibold mb-1">{alert.condition}</h3>
                        <p className="text-sm opacity-90 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {alert.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {alert.caseCount} cases
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendIcon className="w-4 h-4" />
                            {alert.trend}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                      className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      {expandedAlert === alert.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {expandedAlert === alert.id && (
                    <div className="mt-4 p-3 bg-white/30 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium mb-1">Recommended Actions:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                            <li>Increase surveillance in affected areas</li>
                            <li>Alert local healthcare facilities</li>
                            <li>Review prevention protocols</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Contact Information:</p>
                          <p className="text-sm opacity-90">
                            CDC Emergency Response: +1-770-488-7100<br/>
                            WHO Health Alert: +41-22-791-2111
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search conditions, locations, symptoms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="all">All Categories</option>
                  <option value="infectious">Infectious Diseases</option>
                  <option value="chronic">Chronic Conditions</option>
                  <option value="acute">Acute Conditions</option>
                  <option value="emergency">Emergency Cases</option>
                </select>
                
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 3 Months</option>
                </select>
                
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg"
                >
                  <option value="global">Global</option>
                  <option value="north_america">North America</option>
                  <option value="europe">Europe</option>
                  <option value="asia">Asia</option>
                  <option value="africa">Africa</option>
                  <option value="oceania">Oceania</option>
                  <option value="south_america">South America</option>
                </select>
              </div>
            </div>

            {/* Top Conditions Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Reported Conditions</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Last 7 days</span>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {topConditions.map((condition, index) => (
                  <div key={condition.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-semibold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{condition.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">{condition.reports}</span>
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        condition.trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {condition.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {condition.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reports */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
              <div className="space-y-4">
                {recentReports.map(report => (
                  <div key={report.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{report.condition}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            report.severity === 'critical' ? 'bg-red-100 text-red-700' :
                            report.severity === 'severe' ? 'bg-orange-100 text-orange-700' :
                            report.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {report.severity}
                          </span>
                          {report.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {report.location.city}, {report.location.state}, {report.location.country}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">{report.timestamp}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Reported by: </span>
                        <span className="font-medium">{report.reportedBy}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Institution: </span>
                        <span className="font-medium">{report.institution}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cases: </span>
                        <span className="font-medium">{report.patientDemographics.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Demographics: </span>
                        <span className="font-medium">{report.patientDemographics.ageGroup}, {report.patientDemographics.gender}</span>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-gray-600 text-sm">Symptoms: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.symptoms.map(symptom => (
                          <span key={symptom} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Report Condition
                </button>
                <button className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4" />
                  View Map
                </button>
                <button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Alert Settings */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Alert Preferences</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Outbreak alerts</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" defaultChecked />
                  <span className="text-sm">Unusual patterns</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm">Weekly summaries</span>
                </label>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Alert threshold:</label>
                  <select className="w-full px-2 py-1 border border-gray-200 rounded text-sm">
                    <option>High priority only</option>
                    <option>Medium and above</option>
                    <option>All alerts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Your Activity</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">Reported 3 cases today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">Verified 12 reports this week</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-600">Subscribed to 5 alerts</span>
                </div>
              </div>
            </div>

            {/* Global Statistics */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-3">Global Overview</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Reports:</span>
                  <span className="font-medium">847,293</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Monitoring:</span>
                  <span className="font-medium">12,456 locations</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium text-green-600">2.3 hours avg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Report Medical Condition</h2>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition/Disease *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., COVID-19, Influenza A, Norovirus"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Infectious Disease</option>
                        <option>Chronic Condition</option>
                        <option>Acute Condition</option>
                        <option>Emergency/Urgent</option>
                        <option>Occupational Health</option>
                        <option>Environmental Health</option>
                      </select>
                    </div>
                  </div>

                  {/* Severity and Case Count */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Mild</option>
                        <option>Moderate</option>
                        <option>Severe</option>
                        <option>Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Number of Cases *</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date First Observed *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Country"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="State/Province"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Patient Demographics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient Demographics</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Age Group</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>0-4 years</option>
                          <option>5-14 years</option>
                          <option>15-24 years</option>
                          <option>25-34 years</option>
                          <option>35-44 years</option>
                          <option>45-54 years</option>
                          <option>55-64 years</option>
                          <option>65+ years</option>
                          <option>Mixed ages</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Gender Distribution</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option>Mixed</option>
                          <option>Predominantly Male</option>
                          <option>Predominantly Female</option>
                          <option>Male Only</option>
                          <option>Female Only</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Symptoms *</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="List primary symptoms (e.g., fever, cough, fatigue, headache)"
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Hospital/Clinic name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="your.email@institution.com"
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Any additional relevant information, potential exposures, or patterns observed"
                    />
                  </div>

                  {/* Urgent Checkbox */}
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="urgent" className="rounded" />
                    <label htmlFor="urgent" className="text-sm text-gray-700">
                      Mark as urgent (requires immediate attention)
                    </label>
                  </div>

                  {/* Privacy Notice */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <Shield className="w-4 h-4 inline mr-1" />
                      This report will be anonymized and aggregated for surveillance purposes. 
                      Personal patient information will not be shared. Reports may be shared with relevant health authorities.
                    </p>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Submit Report
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiseaseSurveillance;