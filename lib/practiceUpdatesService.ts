import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp,
  Timestamp,
  deleteDoc,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { getAuth } from 'firebase/auth';

export interface PracticeUpdate {
  id?: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  specialty: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  sourceUrl?: string;
  sourceJournal?: string;
  publicationDate?: string;
  authorId: string;
  authorName: string;
  authorTitle?: string;
  authorInstitution?: string;
  tags: string[];
  evidenceLevel?: string;
  recommendationGrade?: string;
  relatedGuidelines?: string[];
  clinicalContext?: string;
  keyTakeaways?: string[];
  imageUrl?: string;
  pdfUrl?: string;
  videoUrl?: string;
  engagement: {
    views: number;
    likes: number;
    shares: number;
    bookmarks: number;
    endorsements: number;
    comments: number;
  };
  endorsedBy?: {
    userId: string;
    userName: string;
    userTitle: string;
    timestamp: Timestamp;
  }[];
  status: 'draft' | 'pending_review' | 'published' | 'archived';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TrendingTopic {
  id?: string;
  topic: string;
  category: string;
  specialty: string;
  trendingScore: number;
  mentionCount: number;
  weeklyGrowth: number;
  relatedUpdates: string[];
  topContributors: {
    userId: string;
    userName: string;
    contributions: number;
  }[];
  tags: string[];
  lastUpdated: Timestamp;
}

export interface UpdateComment {
  id?: string;
  updateId: string;
  userId: string;
  userName: string;
  userTitle?: string;
  content: string;
  parentId?: string;
  likes: number;
  isExpertOpinion: boolean;
  createdAt: Timestamp;
}

class PracticeUpdatesService {
  private practiceUpdatesCollection = 'practiceUpdates';
  private trendingTopicsCollection = 'trendingTopics';
  private updateCommentsCollection = 'updateComments';
  private userEngagementCollection = 'userUpdateEngagement';

  async createUpdate(update: Omit<PracticeUpdate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be authenticated to create updates');
      }

      const updateData: PracticeUpdate = {
        ...update,
        authorId: update.authorId || user.uid,
        status: 'pending_review',
        engagement: {
          views: 0,
          likes: 0,
          shares: 0,
          bookmarks: 0,
          endorsements: 0,
          comments: 0
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const docRef = doc(collection(db, this.practiceUpdatesCollection));
      await setDoc(docRef, updateData);

      await this.updateTrendingTopics(update.tags, update.specialty);

      return docRef.id;
    } catch (error) {
      console.error('Error creating practice update:', error);
      throw error;
    }
  }

  async getUpdates(
    specialty?: string,
    impactLevel?: string,
    pageSize: number = 10,
    lastDoc?: DocumentSnapshot
  ): Promise<{ updates: PracticeUpdate[], lastDoc: DocumentSnapshot | null }> {
    try {
      let q = query(
        collection(db, this.practiceUpdatesCollection),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(pageSize)
      );

      if (specialty && specialty !== 'all') {
        q = query(
          collection(db, this.practiceUpdatesCollection),
          where('status', '==', 'published'),
          where('specialty', '==', specialty),
          orderBy('publishedAt', 'desc'),
          limit(pageSize)
        );
      }

      if (impactLevel && impactLevel !== 'all') {
        q = query(
          collection(db, this.practiceUpdatesCollection),
          where('status', '==', 'published'),
          where('impactLevel', '==', impactLevel),
          orderBy('publishedAt', 'desc'),
          limit(pageSize)
        );
      }

      if (lastDoc) {
        q = query(
          collection(db, this.practiceUpdatesCollection),
          where('status', '==', 'published'),
          orderBy('publishedAt', 'desc'),
          startAfter(lastDoc),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(q);
      const updates: PracticeUpdate[] = [];
      let lastDocument: DocumentSnapshot | null = null;

      querySnapshot.forEach((doc) => {
        updates.push({ id: doc.id, ...doc.data() } as PracticeUpdate);
        lastDocument = doc;
      });

      return { updates, lastDoc: lastDocument };
    } catch (error) {
      console.error('Error fetching practice updates:', error);
      throw error;
    }
  }

  async getUpdateById(updateId: string): Promise<PracticeUpdate | null> {
    try {
      const docRef = doc(db, this.practiceUpdatesCollection, updateId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await this.incrementEngagement(updateId, 'views');
        return { id: docSnap.id, ...docSnap.data() } as PracticeUpdate;
      }
      return null;
    } catch (error) {
      console.error('Error fetching update by ID:', error);
      throw error;
    }
  }

  async incrementEngagement(updateId: string, type: keyof PracticeUpdate['engagement']): Promise<void> {
    try {
      const updateRef = doc(db, this.practiceUpdatesCollection, updateId);
      await updateDoc(updateRef, {
        [`engagement.${type}`]: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error incrementing engagement:', error);
      throw error;
    }
  }

  async endorseUpdate(updateId: string, endorsement: Omit<NonNullable<PracticeUpdate['endorsedBy']>[0], 'timestamp'>): Promise<void> {
    try {
      const updateRef = doc(db, this.practiceUpdatesCollection, updateId);
      const docSnap = await getDoc(updateRef);

      if (!docSnap.exists()) {
        throw new Error('Update not found');
      }

      const currentData = docSnap.data() as PracticeUpdate;
      const endorsedBy = currentData.endorsedBy || [];

      const alreadyEndorsed = endorsedBy.some(e => e.userId === endorsement.userId);
      if (alreadyEndorsed) {
        throw new Error('User has already endorsed this update');
      }

      endorsedBy.push({
        ...endorsement,
        timestamp: serverTimestamp() as Timestamp
      });

      await updateDoc(updateRef, {
        endorsedBy,
        'engagement.endorsements': increment(1),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error endorsing update:', error);
      throw error;
    }
  }

  async getTrendingTopics(specialty?: string, limit: number = 10): Promise<TrendingTopic[]> {
    try {
      let q = query(
        collection(db, this.trendingTopicsCollection),
        orderBy('trendingScore', 'desc'),
        limit(limit)
      );

      if (specialty && specialty !== 'all') {
        q = query(
          collection(db, this.trendingTopicsCollection),
          where('specialty', '==', specialty),
          orderBy('trendingScore', 'desc'),
          limit(limit)
        );
      }

      const querySnapshot = await getDocs(q);
      const topics: TrendingTopic[] = [];

      querySnapshot.forEach((doc) => {
        topics.push({ id: doc.id, ...doc.data() } as TrendingTopic);
      });

      return topics;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw error;
    }
  }

  private async updateTrendingTopics(tags: string[], specialty: string): Promise<void> {
    try {
      for (const tag of tags) {
        const topicQuery = query(
          collection(db, this.trendingTopicsCollection),
          where('topic', '==', tag),
          where('specialty', '==', specialty),
          limit(1)
        );

        const querySnapshot = await getDocs(topicQuery);

        if (querySnapshot.empty) {
          const topicRef = doc(collection(db, this.trendingTopicsCollection));
          await setDoc(topicRef, {
            topic: tag,
            category: 'medical',
            specialty,
            trendingScore: 1,
            mentionCount: 1,
            weeklyGrowth: 0,
            relatedUpdates: [],
            topContributors: [],
            tags: [tag],
            lastUpdated: serverTimestamp()
          });
        } else {
          const docRef = querySnapshot.docs[0].ref;
          await updateDoc(docRef, {
            mentionCount: increment(1),
            trendingScore: increment(1),
            lastUpdated: serverTimestamp()
          });
        }
      }
    } catch (error) {
      console.error('Error updating trending topics:', error);
    }
  }

  async addComment(comment: Omit<UpdateComment, 'id' | 'createdAt'>): Promise<string> {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('User must be authenticated to comment');
      }

      const commentData: UpdateComment = {
        ...comment,
        userId: comment.userId || user.uid,
        likes: 0,
        createdAt: serverTimestamp() as Timestamp
      };

      const docRef = doc(collection(db, this.updateCommentsCollection));
      await setDoc(docRef, commentData);

      await this.incrementEngagement(comment.updateId, 'comments');

      return docRef.id;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async getComments(updateId: string, limit: number = 50): Promise<UpdateComment[]> {
    try {
      const q = query(
        collection(db, this.updateCommentsCollection),
        where('updateId', '==', updateId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );

      const querySnapshot = await getDocs(q);
      const comments: UpdateComment[] = [];

      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() } as UpdateComment);
      });

      return comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async trackUserEngagement(updateId: string, userId: string, action: string): Promise<void> {
    try {
      const engagementRef = doc(db, this.userEngagementCollection, `${userId}_${updateId}`);
      await setDoc(engagementRef, {
        userId,
        updateId,
        action,
        timestamp: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error tracking user engagement:', error);
    }
  }

  async searchUpdates(searchTerm: string, filters?: {
    specialty?: string;
    impactLevel?: string;
    dateRange?: { start: Date; end: Date };
  }): Promise<PracticeUpdate[]> {
    try {
      let q = query(
        collection(db, this.practiceUpdatesCollection),
        where('status', '==', 'published'),
        orderBy('publishedAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      let updates: PracticeUpdate[] = [];

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() } as PracticeUpdate;
        updates.push(data);
      });

      updates = updates.filter(update => {
        const searchLower = searchTerm.toLowerCase();
        return (
          update.title.toLowerCase().includes(searchLower) ||
          update.content.toLowerCase().includes(searchLower) ||
          update.summary.toLowerCase().includes(searchLower) ||
          update.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });

      if (filters?.specialty && filters.specialty !== 'all') {
        updates = updates.filter(u => u.specialty === filters.specialty);
      }

      if (filters?.impactLevel && filters.impactLevel !== 'all') {
        updates = updates.filter(u => u.impactLevel === filters.impactLevel);
      }

      return updates;
    } catch (error) {
      console.error('Error searching updates:', error);
      throw error;
    }
  }

  async getUserUpdates(userId: string): Promise<PracticeUpdate[]> {
    try {
      const q = query(
        collection(db, this.practiceUpdatesCollection),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const updates: PracticeUpdate[] = [];

      querySnapshot.forEach((doc) => {
        updates.push({ id: doc.id, ...doc.data() } as PracticeUpdate);
      });

      return updates;
    } catch (error) {
      console.error('Error fetching user updates:', error);
      throw error;
    }
  }
}

export const practiceUpdatesService = new PracticeUpdatesService();