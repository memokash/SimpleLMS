
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

admin.initializeApp();

// Send invitation emails
export const sendInvitations = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { invitations, senderUserId } = data;
  
  try {
    // Get sender profile
    const senderProfile = await admin.firestore()
      .collection('profiles')
      .doc(senderUserId)
      .get();

    if (!senderProfile.exists) {
      throw new functions.https.HttpsError('not-found', 'Sender profile not found');
    }

    const sender = senderProfile.data();
    if (!sender) {
      throw new functions.https.HttpsError('not-found', 'Sender profile data not found');
    }
    const referralCode = generateReferralCode(sender.firstName, sender.lastName);

    // Process each invitation
    const batch = admin.firestore().batch();
    const emailPromises = [];

    for (const invitation of invitations) {
      // Create invitation document
      const invitationRef = admin.firestore().collection('invitations').doc();
      const invitationData = {
        id: invitationRef.id,
        senderUserId,
        senderEmail: sender.email,
        senderName: `${sender.firstName} ${sender.lastName}`,
        recipientEmail: invitation.recipientEmail,
        message: invitation.message,
        referralCode,
        status: 'pending',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(invitationRef, invitationData);

      // Prepare email
      const emailPromise = sendInvitationEmail({
        to: invitation.recipientEmail,
        senderName: invitationData.senderName,
        senderEmail: invitationData.senderEmail,
        message: invitation.message,
        referralCode,
      });

      emailPromises.push(emailPromise);
    }

    // Commit to Firestore
    await batch.commit();

    // Send emails
    const emailResults = await Promise.allSettled(emailPromises);
    
    // Update statuses based on email results
    const updateBatch = admin.firestore().batch();
    emailResults.forEach((result, index) => {
      const invitationRef = admin.firestore()
        .collection('invitations')
        .where('recipientEmail', '==', invitations[index].recipientEmail)
        .where('senderUserId', '==', senderUserId);

      // Note: In a real implementation, you'd need to track the document IDs
      // to update the status properly
    });

    return { success: true, referralCode };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error sending invitations:', error);
    }
    throw new functions.https.HttpsError('internal', 'Failed to send invitations');
  }
});

// Helper function to send email (using SendGrid, Mailgun, etc.)
async function sendInvitationEmail(emailData: {
  to: string;
  senderName: string;
  senderEmail: string;
  message: string;
  referralCode: string;
}) {
  // Configure your email service (SendGrid example)
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(functions.config().sendgrid.api_key);

  const msg = {
    to: emailData.to,
    from: 'noreply@mededlms.com',
    subject: `${emailData.senderName} invited you to join MedEdLMS`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">You've been invited to join MedEdLMS!</h2>
        <p>Hi there,</p>
        <p><strong>${emailData.senderName}</strong> (${emailData.senderEmail}) has invited you to join our cross-institutional medical education platform:</p>
        
        <blockquote style="border-left: 4px solid #4F46E5; padding-left: 16px; margin: 20px 0; font-style: italic; color: #666;">
          "${emailData.message}"
        </blockquote>
        
        <p>MedEdLMS connects medical students, residents, and healthcare professionals across institutions for collaborative learning and networking.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://mededlms.com/signup?ref=${emailData.referralCode}" 
             style="background-color: #4F46E5; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Join MedEdLMS
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 14px;">
          Best regards,<br>
          The MedEdLMS Team
        </p>
      </div>
    `
  };

  return sgMail.send(msg);
}

// Generate referral code
function generateReferralCode(firstName: string, lastName: string): string {
  const base = `${firstName.toLowerCase()}${lastName.toLowerCase()}`;
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}-${random}`;
}

// Clean up old invitations (scheduled function)
export const cleanupOldInvitations = functions.pubsub
  .schedule('0 2 * * *') // Run daily at 2 AM
  .onRun(async (context) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldInvitations = await admin.firestore()
      .collection('invitations')
      .where('sentAt', '<', thirtyDaysAgo)
      .where('status', 'in', ['pending', 'sent'])
      .get();

    const batch = admin.firestore().batch();
    oldInvitations.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  });
