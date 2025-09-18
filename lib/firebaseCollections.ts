import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import { logger } from './logger';

// ============================================
// COLLECTION SCHEMAS & INTERFACES
// ============================================

// Practice-Changing Information
export interface PracticeUpdate {
  id?: string;
  title: string;
  content: string;
  summary: string;
  authorId: string;
  authorName: string;
  authorCredentials?: string;
  specialty: string;
  subSpecialty?: string;
  tags: string[];
  sourceUrl?: string;
  sourceJournal?: string;
  publicationDate?: Date;
  evidenceLevel?: 'I' | 'II' | 'III' | 'IV' | 'V';
  impactScore?: number;
  engagement: {
    views: number;
    endorsements: number;
    shares: number;
    saves: number;
    comments: number;
  };
  attachments?: string[];
  status: 'draft' | 'published' | 'archived';
  reviewedBy?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Disease Surveillance
export interface DiseaseReport {
  id?: string;
  condition: string;
  icd10Code?: string;
  location: {
    country: string;
    state: string;
    city: string;
    facility?: string;
    coordinates?: { lat: number; lng: number };
  };
  severity: 'low' | 'moderate' | 'high' | 'critical';
  casesCount: number;
  deathsCount?: number;
  recoveredCount?: number;
  symptoms: string[];
  transmission?: 'airborne' | 'droplet' | 'contact' | 'vector' | 'unknown';
  reportedBy: string;
  reporterCredentials?: string;
  verified: boolean;
  verifiedBy?: string;
  publicHealthAlert: boolean;
  alertLevel?: 'watch' | 'warning' | 'emergency';
  notes?: string;
  labResults?: string[];
  interventions?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Community Posts
export interface CommunityPost {
  id?: string;
  content: string;
  title?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  category: 'discussion' | 'question' | 'case-study' | 'announcement' | 'resource';
  specialty?: string;
  tags: string[];
  attachments?: {
    type: 'image' | 'document' | 'link';
    url: string;
    name?: string;
  }[];
  engagement: {
    upvotes: number;
    downvotes: number;
    replies: number;
    shares: number;
    views: number;
  };
  upvotedBy: string[];
  downvotedBy: string[];
  isPinned: boolean;
  isLocked: boolean;
  status: 'active' | 'closed' | 'deleted';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Study Groups
export interface StudyGroup {
  id?: string;
  name: string;
  description: string;
  specialty: string;
  examTarget?: string; // USMLE, ABIM, etc.
  members: string[];
  admins: string[];
  maxMembers: number;
  isPrivate: boolean;
  joinCode?: string;
  schedule?: {
    day: string;
    time: string;
    timezone: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  };
  resources: {
    id: string;
    title: string;
    url: string;
    type: 'document' | 'video' | 'quiz' | 'link';
    uploadedBy: string;
  }[];
  activities: {
    type: 'study-session' | 'quiz' | 'discussion' | 'review';
    date: Timestamp;
    participants: string[];
  }[];
  settings: {
    allowInvites: boolean;
    requireApproval: boolean;
    notifications: boolean;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// CME Tracking
export interface CMEActivity {
  id?: string;
  userId: string;
  activityType: 'course' | 'conference' | 'workshop' | 'webinar' | 'publication' | 'presentation';
  title: string;
  provider: string;
  providerAccreditation?: string;
  credits: number;
  creditType: 'AMA PRA Category 1' | 'AMA PRA Category 2' | 'AAFP' | 'AOA' | 'Other';
  specialty: string;
  completionDate: Date;
  certificateUrl?: string;
  verificationCode?: string;
  notes?: string;
  status: 'completed' | 'in-progress' | 'verified' | 'expired';
  expirationDate?: Date;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Debate Forum
export interface Debate {
  id?: string;
  topic: string;
  description: string;
  category: string;
  moderatorId?: string;
  proPosition: {
    statement: string;
    supporterId: string;
    supporterName: string;
    arguments: string[];
    votes: number;
    voters: string[];
  };
  conPosition: {
    statement: string;
    supporterId: string;
    supporterName: string;
    arguments: string[];
    votes: number;
    voters: string[];
  };
  evidence: {
    id: string;
    position: 'pro' | 'con';
    type: 'study' | 'guideline' | 'expert-opinion' | 'case-report';
    title: string;
    url?: string;
    summary: string;
    submittedBy: string;
  }[];
  videoSubmissions?: {
    id: string;
    position: 'pro' | 'con';
    url: string;
    duration: number;
    submittedBy: string;
    submittedAt: Timestamp;
  }[];
  status: 'open' | 'closed' | 'voting' | 'concluded';
  startDate: Timestamp;
  endDate?: Timestamp;
  winningPosition?: 'pro' | 'con' | 'tie';
  totalParticipants: number;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Laughter Sanctuary Content
export interface LaughterContent {
  id?: string;
  type: 'joke' | 'meme' | 'story' | 'video' | 'comic';
  title: string;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  authorId: string;
  authorName: string;
  category: 'medical-humor' | 'dad-jokes' | 'puns' | 'stories' | 'memes';
  tags: string[];
  isClean: boolean;
  reactions: {
    laugh: number;
    love: number;
    mindblown: number;
    facepalm: number;
  };
  reactedBy: {
    [userId: string]: string; // userId: reactionType
  };
  reports: number;
  status: 'active' | 'flagged' | 'removed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// COLLECTION REFERENCES
// ============================================

export const collections = {
  practiceUpdates: collection(db, 'practiceUpdates'),
  diseaseReports: collection(db, 'diseaseReports'),
  communityPosts: collection(db, 'communityPosts'),
  studyGroups: collection(db, 'studyGroups'),
  cmeActivities: collection(db, 'cmeActivities'),
  debates: collection(db, 'debates'),
  laughterContent: collection(db, 'laughterContent'),
  surveillanceAlerts: collection(db, 'surveillanceAlerts'),
  trendingTopics: collection(db, 'trendingTopics'),
  userEngagement: collection(db, 'userEngagement')
};

// ============================================
// PRACTICE UPDATES FUNCTIONS
// ============================================

export async function createPracticeUpdate(update: Omit<PracticeUpdate, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collections.practiceUpdates, {
      ...update,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ Practice update created:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('❌ Error creating practice update:', error);
    throw error;
  }
}

export async function getPracticeUpdates(specialty?: string, limitCount: number = 10) {
  try {
    let q;
    if (specialty) {
      q = query(
        collections.practiceUpdates,
        where('specialty', '==', specialty),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    } else {
      q = query(
        collections.practiceUpdates,
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }

    const snapshot = await getDocs(q);
    const updates: PracticeUpdate[] = [];

    snapshot.forEach((doc) => {
      updates.push({ id: doc.id, ...doc.data() } as PracticeUpdate);
    });

    logger.debug(`✅ Retrieved ${updates.length} practice updates`);
    return updates;
  } catch (error) {
    logger.error('❌ Error fetching practice updates:', error);
    throw error;
  }
}

export async function endorsePracticeUpdate(updateId: string, userId: string) {
  try {
    const updateRef = doc(collections.practiceUpdates, updateId);
    await updateDoc(updateRef, {
      'engagement.endorsements': increment(1),
      endorsedBy: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ Practice update endorsed');
  } catch (error) {
    logger.error('❌ Error endorsing practice update:', error);
    throw error;
  }
}

// ============================================
// DISEASE SURVEILLANCE FUNCTIONS
// ============================================

export async function createDiseaseReport(report: Omit<DiseaseReport, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collections.diseaseReports, {
      ...report,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Check if alert needs to be created
    if (report.severity === 'critical' || report.casesCount > 100) {
      await createSurveillanceAlert({
        reportId: docRef.id,
        condition: report.condition,
        location: report.location,
        severity: report.severity,
        message: `Critical disease report: ${report.condition} in ${report.location.city}, ${report.location.state}`
      });
    }

    logger.debug('✅ Disease report created:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('❌ Error creating disease report:', error);
    throw error;
  }
}

export async function getDiseaseReports(filters?: {
  condition?: string;
  location?: string;
  severity?: string;
  verified?: boolean;
}) {
  try {
    let q = query(collections.diseaseReports, orderBy('createdAt', 'desc'));

    if (filters?.condition) {
      q = query(q, where('condition', '==', filters.condition));
    }
    if (filters?.severity) {
      q = query(q, where('severity', '==', filters.severity));
    }
    if (filters?.verified !== undefined) {
      q = query(q, where('verified', '==', filters.verified));
    }

    const snapshot = await getDocs(q);
    const reports: DiseaseReport[] = [];

    snapshot.forEach((doc) => {
      reports.push({ id: doc.id, ...doc.data() } as DiseaseReport);
    });

    logger.debug(`✅ Retrieved ${reports.length} disease reports`);
    return reports;
  } catch (error) {
    logger.error('❌ Error fetching disease reports:', error);
    throw error;
  }
}

async function createSurveillanceAlert(alert: any) {
  try {
    await addDoc(collections.surveillanceAlerts, {
      ...alert,
      createdAt: serverTimestamp(),
      status: 'active'
    });
    logger.debug('🚨 Surveillance alert created');
  } catch (error) {
    logger.error('❌ Error creating surveillance alert:', error);
  }
}

// ============================================
// COMMUNITY FUNCTIONS
// ============================================

export async function createCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collections.communityPosts, {
      ...post,
      engagement: {
        upvotes: 0,
        downvotes: 0,
        replies: 0,
        shares: 0,
        views: 0
      },
      upvotedBy: [],
      downvotedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ Community post created:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('❌ Error creating community post:', error);
    throw error;
  }
}

export async function voteCommunityPost(postId: string, userId: string, voteType: 'upvote' | 'downvote') {
  try {
    const postRef = doc(collections.communityPosts, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error('Post not found');
    }

    const postData = postSnap.data() as CommunityPost;
    const updates: any = { updatedAt: serverTimestamp() };

    if (voteType === 'upvote') {
      if (!postData.upvotedBy.includes(userId)) {
        updates['engagement.upvotes'] = increment(1);
        updates.upvotedBy = arrayUnion(userId);

        if (postData.downvotedBy.includes(userId)) {
          updates['engagement.downvotes'] = increment(-1);
          updates.downvotedBy = arrayRemove(userId);
        }
      }
    } else {
      if (!postData.downvotedBy.includes(userId)) {
        updates['engagement.downvotes'] = increment(1);
        updates.downvotedBy = arrayUnion(userId);

        if (postData.upvotedBy.includes(userId)) {
          updates['engagement.upvotes'] = increment(-1);
          updates.upvotedBy = arrayRemove(userId);
        }
      }
    }

    await updateDoc(postRef, updates);
    logger.debug(`✅ Post ${voteType}d`);
  } catch (error) {
    logger.error('❌ Error voting on post:', error);
    throw error;
  }
}

// ============================================
// STUDY GROUPS FUNCTIONS
// ============================================

export async function createStudyGroup(group: Omit<StudyGroup, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const docRef = await addDoc(collections.studyGroups, {
      ...group,
      joinCode: group.isPrivate ? joinCode : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ Study group created:', docRef.id);
    return { id: docRef.id, joinCode };
  } catch (error) {
    logger.error('❌ Error creating study group:', error);
    throw error;
  }
}

export async function joinStudyGroup(groupId: string, userId: string, joinCode?: string) {
  try {
    const groupRef = doc(collections.studyGroups, groupId);
    const groupSnap = await getDoc(groupRef);

    if (!groupSnap.exists()) {
      throw new Error('Study group not found');
    }

    const groupData = groupSnap.data() as StudyGroup;

    if (groupData.isPrivate && groupData.joinCode !== joinCode) {
      throw new Error('Invalid join code');
    }

    if (groupData.members.length >= groupData.maxMembers) {
      throw new Error('Study group is full');
    }

    if (!groupData.members.includes(userId)) {
      await updateDoc(groupRef, {
        members: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      logger.debug('✅ User joined study group');
    }
  } catch (error) {
    logger.error('❌ Error joining study group:', error);
    throw error;
  }
}

// ============================================
// CME TRACKING FUNCTIONS
// ============================================

export async function addCMEActivity(activity: Omit<CMEActivity, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collections.cmeActivities, {
      ...activity,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ CME activity added:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('❌ Error adding CME activity:', error);
    throw error;
  }
}

export async function getUserCMECredits(userId: string, year?: number) {
  try {
    const currentYear = year || new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const q = query(
      collections.cmeActivities,
      where('userId', '==', userId),
      where('completionDate', '>=', startDate),
      where('completionDate', '<=', endDate),
      where('status', 'in', ['completed', 'verified'])
    );

    const snapshot = await getDocs(q);
    let totalCredits = 0;
    const activities: CMEActivity[] = [];

    snapshot.forEach((doc) => {
      const activity = { id: doc.id, ...doc.data() } as CMEActivity;
      activities.push(activity);
      totalCredits += activity.credits;
    });

    logger.debug(`✅ Retrieved ${activities.length} CME activities, ${totalCredits} total credits`);
    return { activities, totalCredits };
  } catch (error) {
    logger.error('❌ Error fetching CME credits:', error);
    throw error;
  }
}

// ============================================
// DEBATE FORUM FUNCTIONS
// ============================================

export async function createDebate(debate: Omit<Debate, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collections.debates, {
      ...debate,
      totalParticipants: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ Debate created:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('❌ Error creating debate:', error);
    throw error;
  }
}

export async function voteDebatePosition(debateId: string, userId: string, position: 'pro' | 'con') {
  try {
    const debateRef = doc(collections.debates, debateId);
    const debateSnap = await getDoc(debateRef);

    if (!debateSnap.exists()) {
      throw new Error('Debate not found');
    }

    const debateData = debateSnap.data() as Debate;

    // Check if user already voted
    if (debateData.proPosition.voters.includes(userId) || debateData.conPosition.voters.includes(userId)) {
      throw new Error('User already voted');
    }

    const updates: any = {
      updatedAt: serverTimestamp(),
      totalParticipants: increment(1)
    };

    if (position === 'pro') {
      updates['proPosition.votes'] = increment(1);
      updates['proPosition.voters'] = arrayUnion(userId);
    } else {
      updates['conPosition.votes'] = increment(1);
      updates['conPosition.voters'] = arrayUnion(userId);
    }

    await updateDoc(debateRef, updates);
    logger.debug(`✅ Vote cast for ${position} position`);
  } catch (error) {
    logger.error('❌ Error voting in debate:', error);
    throw error;
  }
}

// ============================================
// LAUGHTER SANCTUARY FUNCTIONS
// ============================================

export async function addLaughterContent(content: Omit<LaughterContent, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collections.laughterContent, {
      ...content,
      reactions: {
        laugh: 0,
        love: 0,
        mindblown: 0,
        facepalm: 0
      },
      reactedBy: {},
      reports: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    logger.debug('✅ Laughter content added:', docRef.id);
    return docRef.id;
  } catch (error) {
    logger.error('❌ Error adding laughter content:', error);
    throw error;
  }
}

export async function reactToLaughterContent(contentId: string, userId: string, reaction: 'laugh' | 'love' | 'mindblown' | 'facepalm') {
  try {
    const contentRef = doc(collections.laughterContent, contentId);
    const contentSnap = await getDoc(contentRef);

    if (!contentSnap.exists()) {
      throw new Error('Content not found');
    }

    const contentData = contentSnap.data() as LaughterContent;
    const previousReaction = contentData.reactedBy[userId];

    const updates: any = {
      updatedAt: serverTimestamp(),
      [`reactedBy.${userId}`]: reaction
    };

    // Remove previous reaction if exists
    if (previousReaction && previousReaction !== reaction) {
      updates[`reactions.${previousReaction}`] = increment(-1);
    }

    // Add new reaction
    if (!previousReaction || previousReaction !== reaction) {
      updates[`reactions.${reaction}`] = increment(1);
    }

    await updateDoc(contentRef, updates);
    logger.debug(`✅ Reaction ${reaction} added`);
  } catch (error) {
    logger.error('❌ Error reacting to content:', error);
    throw error;
  }
}

// ============================================
// TRENDING & ANALYTICS
// ============================================

export async function updateTrendingTopics() {
  try {
    // This would typically run as a scheduled function
    // Analyzes recent activity and updates trending topics
    logger.debug('📊 Updating trending topics...');

    // Get recent practice updates
    const recentUpdates = await getPracticeUpdates(undefined, 50);

    // Analyze tags and specialties
    const topicCounts: { [key: string]: number } = {};

    recentUpdates.forEach(update => {
      update.tags.forEach(tag => {
        topicCounts[tag] = (topicCounts[tag] || 0) + update.engagement.views;
      });
    });

    // Sort and get top 10
    const trendingTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([topic, score]) => ({ topic, score }));

    // Store in trending collection
    for (const topic of trendingTopics) {
      await addDoc(collections.trendingTopics, {
        ...topic,
        timestamp: serverTimestamp()
      });
    }

    logger.debug('✅ Trending topics updated');
  } catch (error) {
    logger.error('❌ Error updating trending topics:', error);
  }
}

// ============================================
// USER ENGAGEMENT TRACKING
// ============================================

export async function trackUserEngagement(userId: string, activity: {
  type: string;
  targetId: string;
  targetType: string;
  action: string;
}) {
  try {
    await addDoc(collections.userEngagement, {
      userId,
      ...activity,
      timestamp: serverTimestamp()
    });
    logger.debug('📊 User engagement tracked');
  } catch (error) {
    logger.error('❌ Error tracking engagement:', error);
  }
}