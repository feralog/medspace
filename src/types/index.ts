export interface Topic {
  id: string;
  createdAt: Date;
  subject: string;
  topic: string;
  tags: string[];
  source: 'aula' | 'livro' | 'video' | 'outro';
  color: string;
  reviews: Review[];
  scheduledReviews: Date[];
  completed: boolean;
}

export interface Review {
  date: Date;
  completed: boolean;
  reviewNumber: number; // 1st, 2nd, 3rd review etc
}

export interface SubjectColor {
  subject: string;
  color: string;
}

export interface WeekDay {
  date: Date;
  topics: Topic[];
  isToday: boolean;
  isPast: boolean;
}

export type ReviewInterval = 1 | 3 | 7 | 14 | 30 | 60 | 120; // days

export const REVIEW_INTERVALS: ReviewInterval[] = [1, 3, 7, 14, 30, 60, 120];

export const SUBJECT_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#6b7280', // gray
  '#374151', // gray-700
];