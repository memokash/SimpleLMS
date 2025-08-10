
// hooks/useInvitations.ts
import { useState } from 'react';
import { InvitationService } from '../../services/invitationService';

export const useInvitations = () => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendInvitations = async (
    emails: string[], 
    message: string, 
    senderUserId: string
  ) => {
    try {
      setSending(true);
      setError(null);
      
      const invitations = emails.map(email => ({
        recipientEmail: email.trim(),
        message,
      }));

      return await InvitationService.sendInvitations(invitations, senderUserId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitations');
      return false;
    } finally {
      setSending(false);
    }
  };

  return {
    sendInvitations,
    sending,
    error,
  };
};