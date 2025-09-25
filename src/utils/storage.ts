import { Topic } from '@/types';
import { apiClient } from '@/lib/api';

const STORAGE_KEYS = {
  TOPICS: 'medspace_topics',
  SUBJECTS: 'medspace_subjects',
  SETTINGS: 'medspace_settings',
} as const;

export interface StoredSubject {
  subject: string;
  color: string;
}

export interface AppSettings {
  lastUsedSubject: string;
  recentSubjects: string[];
  commonTags: string[];
}

// Topics - API first, localStorage fallback
export async function loadTopics(): Promise<Topic[]> {
  try {
    // Try API first
    const apiTopics = await apiClient.getTopics();
    // Cache in localStorage for offline use
    saveTopicsToLocal(apiTopics);
    return apiTopics;
  } catch (error) {
    console.warn('API failed, loading from localStorage:', error);
    // Fallback to localStorage
    return loadTopicsFromLocal();
  }
}

// Local storage functions for offline fallback
function saveTopicsToLocal(topics: Topic[]): void {
  try {
    const serializedTopics = topics.map(topic => ({
      ...topic,
      createdAt: topic.createdAt.toISOString(),
      scheduledReviews: topic.scheduledReviews.map(date => date.toISOString()),
      reviews: topic.reviews.map(review => ({
        ...review,
        date: review.date.toISOString(),
      })),
    }));
    localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(serializedTopics));
  } catch (error) {
    console.error('Failed to save topics to localStorage:', error);
  }
}

function loadTopicsFromLocal(): Topic[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TOPICS);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return parsed.map((topic: any) => ({
      ...topic,
      createdAt: new Date(topic.createdAt),
      scheduledReviews: topic.scheduledReviews.map((date: string) => new Date(date)),
      reviews: topic.reviews.map((review: any) => ({
        ...review,
        date: new Date(review.date),
      })),
    }));
  } catch (error) {
    console.error('Failed to load topics from localStorage:', error);
    return [];
  }
}

// Legacy sync function for backward compatibility
export function saveTopics(topics: Topic[]): void {
  saveTopicsToLocal(topics);
}

// Subjects - API first, localStorage fallback
export async function loadSubjects(): Promise<StoredSubject[]> {
  try {
    // Try API first
    const apiSubjects = await apiClient.getSubjects();
    // Cache in localStorage for offline use
    saveSubjectsToLocal(apiSubjects);
    return apiSubjects;
  } catch (error) {
    console.warn('API failed, loading subjects from localStorage:', error);
    // Fallback to localStorage
    return loadSubjectsFromLocal();
  }
}

// Local storage functions for offline fallback
function saveSubjectsToLocal(subjects: StoredSubject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (error) {
    console.error('Failed to save subjects to localStorage:', error);
  }
}

function loadSubjectsFromLocal(): StoredSubject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load subjects from localStorage:', error);
    return [];
  }
}

// Legacy sync function for backward compatibility
export function saveSubjects(subjects: StoredSubject[]): void {
  saveSubjectsToLocal(subjects);
}

// Settings
export function saveSettings(settings: Partial<AppSettings>): void {
  try {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) {
      return {
        lastUsedSubject: '',
        recentSubjects: [],
        commonTags: ['importante', 'prova', 'dificil', 'revisar'],
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load settings:', error);
    return {
      lastUsedSubject: '',
      recentSubjects: [],
      commonTags: ['importante', 'prova', 'dificil', 'revisar'],
    };
  }
}

// Utility functions - API first
export async function addTopicAndUpdateStorage(
  topic: Omit<Topic, 'id' | 'createdAt' | 'scheduledReviews' | 'reviews' | 'completed'>,
  existingTopics: Topic[],
  existingSubjects: StoredSubject[]
): Promise<{ topics: Topic[]; subjects: StoredSubject[] }> {
  try {
    // Create topic via API
    const createdTopic = await apiClient.createTopic(topic);
    const updatedTopics = [...existingTopics, createdTopic];

    // Check if subject needs to be created
    const subjectExists = existingSubjects.find(
      s => s.subject.toLowerCase() === topic.subject.toLowerCase()
    );

    let updatedSubjects = [...existingSubjects];
    if (!subjectExists) {
      try {
        const newSubject = await apiClient.createSubject(topic.subject, topic.color);
        updatedSubjects.push(newSubject);
      } catch (error) {
        // Subject might already exist, that's ok
        console.warn('Could not create subject:', error);
        updatedSubjects.push({ subject: topic.subject, color: topic.color });
      }
    }

    // Update local cache
    saveTopicsToLocal(updatedTopics);
    saveSubjectsToLocal(updatedSubjects);

    // Update recent subjects
    const settings = loadSettings();
    const recentSubjects = [
      topic.subject,
      ...settings.recentSubjects.filter(s => s !== topic.subject)
    ].slice(0, 10);

    saveSettings({
      lastUsedSubject: topic.subject,
      recentSubjects,
    });

    return { topics: updatedTopics, subjects: updatedSubjects };
  } catch (error) {
    console.error('Failed to add topic via API, falling back to localStorage:', error);

    // Fallback to original localStorage behavior
    const newTopic: Topic = {
      ...topic,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      scheduledReviews: calculateScheduledReviews(),
      reviews: [],
      completed: false
    };

    const updatedTopics = [...existingTopics, newTopic];

    let updatedSubjects = [...existingSubjects];
    const subjectExists = existingSubjects.find(
      s => s.subject.toLowerCase() === topic.subject.toLowerCase()
    );

    if (!subjectExists) {
      updatedSubjects.push({ subject: topic.subject, color: topic.color });
    }

    saveTopicsToLocal(updatedTopics);
    saveSubjectsToLocal(updatedSubjects);

    const settings = loadSettings();
    const recentSubjects = [
      topic.subject,
      ...settings.recentSubjects.filter(s => s !== topic.subject)
    ].slice(0, 10);

    saveSettings({
      lastUsedSubject: topic.subject,
      recentSubjects,
    });

    return { topics: updatedTopics, subjects: updatedSubjects };
  }
}

// Helper function to calculate scheduled reviews
function calculateScheduledReviews(): Date[] {
  const now = new Date();
  const intervals = [1, 3, 7, 14, 30, 60, 120]; // days
  return intervals.map(days => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return date;
  });
}

export async function completeTopicReview(
  topicId: string,
  reviewIndex: number,
  topics: Topic[]
): Promise<Topic[]> {
  try {
    // Complete review via API
    await apiClient.completeReview(topicId, reviewIndex + 1);

    // Update local state
    const updatedTopics = topics.map(topic => {
      if (topic.id === topicId) {
        const updatedTopic = { ...topic };
        const review = {
          date: new Date(),
          completed: true,
          reviewNumber: reviewIndex + 1,
        };
        updatedTopic.reviews = [...topic.reviews, review];

        // Mark as completed if all reviews done
        if (updatedTopic.reviews.length >= updatedTopic.scheduledReviews.length) {
          updatedTopic.completed = true;
        }

        return updatedTopic;
      }
      return topic;
    });

    saveTopicsToLocal(updatedTopics);
    return updatedTopics;
  } catch (error) {
    console.error('Failed to complete review via API, falling back to localStorage:', error);

    // Fallback to localStorage
    const updatedTopics = topics.map(topic => {
      if (topic.id === topicId) {
        const updatedTopic = { ...topic };
        const review = {
          date: new Date(),
          completed: true,
          reviewNumber: reviewIndex + 1,
        };
        updatedTopic.reviews = [...topic.reviews, review];

        if (updatedTopic.reviews.length >= updatedTopic.scheduledReviews.length) {
          updatedTopic.completed = true;
        }

        return updatedTopic;
      }
      return topic;
    });

    saveTopicsToLocal(updatedTopics);
    return updatedTopics;
  }
}

export async function deleteTopic(topicId: string, topics: Topic[]): Promise<Topic[]> {
  try {
    // Delete via API
    await apiClient.deleteTopic(topicId);

    // Update local state
    const updatedTopics = topics.filter(topic => topic.id !== topicId);
    saveTopicsToLocal(updatedTopics);
    return updatedTopics;
  } catch (error) {
    console.error('Failed to delete topic via API, falling back to localStorage:', error);

    // Fallback to localStorage
    const updatedTopics = topics.filter(topic => topic.id !== topicId);
    saveTopicsToLocal(updatedTopics);
    return updatedTopics;
  }
}

export async function updateSubject(
  oldSubject: string,
  newSubject: string,
  newColor: string,
  topics: Topic[],
  subjects: StoredSubject[]
): Promise<{ topics: Topic[]; subjects: StoredSubject[] }> {
  try {
    // Update via API
    await apiClient.updateSubject(oldSubject, newSubject, newColor);

    // Update local state
    const updatedTopics = topics.map(topic =>
      topic.subject === oldSubject
        ? { ...topic, subject: newSubject, color: newColor }
        : topic
    );

    const updatedSubjects = subjects.map(subject =>
      subject.subject === oldSubject
        ? { subject: newSubject, color: newColor }
        : subject
    );

    saveTopicsToLocal(updatedTopics);
    saveSubjectsToLocal(updatedSubjects);

    // Update settings if this was the last used subject
    const settings = loadSettings();
    if (settings.lastUsedSubject === oldSubject) {
      saveSettings({
        ...settings,
        lastUsedSubject: newSubject,
        recentSubjects: settings.recentSubjects.map(s => s === oldSubject ? newSubject : s)
      });
    }

    return { topics: updatedTopics, subjects: updatedSubjects };
  } catch (error) {
    console.error('Failed to update subject via API, falling back to localStorage:', error);

    // Fallback to localStorage
    const updatedTopics = topics.map(topic =>
      topic.subject === oldSubject
        ? { ...topic, subject: newSubject, color: newColor }
        : topic
    );

    const updatedSubjects = subjects.map(subject =>
      subject.subject === oldSubject
        ? { subject: newSubject, color: newColor }
        : subject
    );

    saveTopicsToLocal(updatedTopics);
    saveSubjectsToLocal(updatedSubjects);

    const settings = loadSettings();
    if (settings.lastUsedSubject === oldSubject) {
      saveSettings({
        ...settings,
        lastUsedSubject: newSubject,
        recentSubjects: settings.recentSubjects.map(s => s === oldSubject ? newSubject : s)
      });
    }

    return { topics: updatedTopics, subjects: updatedSubjects };
  }
}

export async function deleteSubject(
  subjectToDelete: string,
  topics: Topic[],
  subjects: StoredSubject[]
): Promise<{ topics: Topic[]; subjects: StoredSubject[] }> {
  try {
    // Delete via API
    await apiClient.deleteSubject(subjectToDelete);

    // Update local state
    const updatedTopics = topics.filter(topic => topic.subject !== subjectToDelete);
    const updatedSubjects = subjects.filter(subject => subject.subject !== subjectToDelete);

    saveTopicsToLocal(updatedTopics);
    saveSubjectsToLocal(updatedSubjects);

    // Clean up settings
    const settings = loadSettings();
    saveSettings({
      ...settings,
      lastUsedSubject: settings.lastUsedSubject === subjectToDelete ? '' : settings.lastUsedSubject,
      recentSubjects: settings.recentSubjects.filter(s => s !== subjectToDelete)
    });

    return { topics: updatedTopics, subjects: updatedSubjects };
  } catch (error) {
    console.error('Failed to delete subject via API, falling back to localStorage:', error);

    // Fallback to localStorage
    const updatedTopics = topics.filter(topic => topic.subject !== subjectToDelete);
    const updatedSubjects = subjects.filter(subject => subject.subject !== subjectToDelete);

    saveTopicsToLocal(updatedTopics);
    saveSubjectsToLocal(updatedSubjects);

    const settings = loadSettings();
    saveSettings({
      ...settings,
      lastUsedSubject: settings.lastUsedSubject === subjectToDelete ? '' : settings.lastUsedSubject,
      recentSubjects: settings.recentSubjects.filter(s => s !== subjectToDelete)
    });

    return { topics: updatedTopics, subjects: updatedSubjects };
  }
}

// Export data
export function exportData(): string {
  const topics = loadTopics();
  const subjects = loadSubjects();
  const settings = loadSettings();

  return JSON.stringify({
    topics,
    subjects,
    settings,
    exportedAt: new Date().toISOString(),
  }, null, 2);
}

// Import data
export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData);

    if (data.topics) {
      localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(data.topics));
    }

    if (data.subjects) {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(data.subjects));
    }

    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }

    return true;
  } catch (error) {
    console.error('Failed to import data:', error);
    return false;
  }
}