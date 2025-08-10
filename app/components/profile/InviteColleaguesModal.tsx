'use client';

import React, { useState } from 'react';
import { useInvitations } from '../../hooks/useInvitations';
import { 
  UserPlus, 
  X, 
  Share2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Mail
} from 'lucide-react';

interface InviteColleaguesModalProps {
  isOpen: boolean;
  onClose: () => void;
  senderUserId: string;
  senderName?: string;
}

export const InviteColleaguesModal: React.FC<InviteColleaguesModalProps> = ({ 
  isOpen, 
  onClose, 
  senderUserId,
  senderName 
}) => {
  const { sendInvitations, sending, error } = useInvitations();
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendInvitations = async () => {
    if (!inviteEmails.trim()) {
      return;
    }
    
    const emails = inviteEmails
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email && email.includes('@'));
    
    if (emails.length === 0) {
      return;
    }
    
    const result = await sendInvitations(emails, inviteMessage, senderUserId);
    
    if (result) {
      setSuccess(`Invitations sent to ${emails.length} colleagues!`);
      setInviteEmails('');
      setInviteMessage('');
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setInviteEmails('');
    setInviteMessage('');
    setSuccess(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-purple-500" />
            Invite Colleagues
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">Invitations Sent!</h4>
            <p className="text-gray-600">{success}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-purple-900 mb-1">
                    Invite medical colleagues to SimpleLMS
                  </h4>
                  <p className="text-sm text-purple-700">
                    Share our medical education platform with fellow students, residents, and healthcare professionals.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Addresses
                <span className="text-gray-500 font-normal ml-1">(one per line or comma-separated)</span>
              </label>
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={4}
                placeholder="colleague1@email.com&#10;colleague2@email.com&#10;doctor@hospital.edu"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
              />
              <div className="mt-2 text-sm text-gray-500">
                {inviteEmails.split(/[,\n]/).filter(email => email.trim() && email.includes('@')).length} valid email(s) detected
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Personal Message 
                <span className="text-gray-500 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={3}
                placeholder={`Hi! ${senderName ? `I'm ${senderName} and` : ''} I'd like to invite you to join SimpleLMS, a medical education platform with smart quizzes, AI tutoring, and collaborative learning tools.`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-1">Failed to send invitations</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvitations}
                disabled={sending || !inviteEmails.trim() || inviteEmails.split(/[,\n]/).filter(email => email.trim() && email.includes('@')).length === 0}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5" />
                    Send Invitations
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InviteColleaguesModal;