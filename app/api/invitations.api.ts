// api/invitations.api.ts
interface Invitation {
  id: string;
  email: string;
  role: 'student' | 'instructor';
  sentAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}
export const invitationsAPI = {
  // Send invitations
  sendInvitations: async (invitations: Omit<Invitation, 'id' | 'sentAt' | 'status'>[]): Promise<void> => {
    const response = await fetch('/api/invitations/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitations }),
    });
    if (!response.ok) {
      throw new Error('Failed to send invitations');
    }
  },

  // Get sent invitations
  getSentInvitations: async (userId: string): Promise<Invitation[]> => {
    const response = await fetch(`/api/invitations/sent/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invitations');
    }
    return response.json();
  },
};