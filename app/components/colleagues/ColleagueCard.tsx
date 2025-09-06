'use client';

import React from 'react';
import { 
  MapPin, 
  Building2, 
  Calendar,
  GraduationCap,
  MessageSquare,
  UserPlus
} from 'lucide-react';
import { MedicalProfile } from '../../../types/database.types';

interface ColleagueCardProps {
  colleague: MedicalProfile;
  onMessage?: (colleague: MedicalProfile) => void;
  onConnect?: (colleague: MedicalProfile) => void;
}

export const ColleagueCard: React.FC<ColleagueCardProps> = ({ 
  colleague, 
  onMessage, 
  onConnect 
}) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pre-Med Student': 'bg-blue-100 text-blue-800',
      'Medical Student': 'bg-green-100 text-green-800',
      'Resident': 'bg-yellow-100 text-yellow-800',
      'Fellow': 'bg-orange-100 text-orange-800',
      'Attending Physician': 'bg-purple-100 text-purple-800',
      'Nurse Practitioner': 'bg-pink-100 text-pink-800',
      'Physician Assistant': 'bg-indigo-100 text-indigo-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          {colleague.profilePicture ? (
            <img 
              src={colleague.profilePicture} 
              alt={`${colleague.firstName} ${colleague.lastName}`} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <span>
              {colleague.firstName?.charAt(0)}
              {colleague.lastName?.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {colleague.firstName} {colleague.lastName}
          </h3>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(colleague.medicalStatus)}`}>
            {colleague.medicalStatus}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {colleague.currentRotation && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span>{colleague.currentRotation}</span>
            {colleague.rotationLocation && (
              <span className="text-gray-400">" {colleague.rotationLocation}</span>
            )}
          </div>
        )}
        
        {colleague.institution && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building2 className="w-4 h-4 text-purple-500" />
            <span>{colleague.institution}</span>
          </div>
        )}
        
        {colleague.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span>{colleague.location}</span>
          </div>
        )}
        
        {colleague.yearLevel && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="w-4 h-4 text-purple-500" />
            <span>{colleague.yearLevel}</span>
          </div>
        )}
      </div>

      {colleague.bio && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {colleague.bio}
        </p>
      )}

      <div className="flex gap-2">
        <button 
          onClick={() => onMessage?.(colleague)}
          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Message
        </button>
        <button 
          onClick={() => onConnect?.(colleague)}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <UserPlus className="w-4 h-4" />
          Connect
        </button>
      </div>
    </div>
  );
};

export default ColleagueCard;