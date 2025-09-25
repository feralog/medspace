import { Topic, Review, REVIEW_INTERVALS, SUBJECT_COLORS } from '@/types';

export function generateTopicId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function calculateNextReviews(createdAt: Date): Date[] {
  const reviews: Date[] = [];
  const startDate = new Date(createdAt);

  REVIEW_INTERVALS.forEach(interval => {
    const reviewDate = new Date(startDate);
    reviewDate.setDate(reviewDate.getDate() + interval);
    reviews.push(reviewDate);
  });

  return reviews;
}

export function getSubjectColor(subject: string, existingSubjects: { subject: string; color: string }[]): string {
  // Check if subject already has a color
  const existing = existingSubjects.find(s => s.subject.toLowerCase() === subject.toLowerCase());
  if (existing) return existing.color;

  // Assign new color
  const usedColors = existingSubjects.map(s => s.color);
  const availableColors = SUBJECT_COLORS.filter(color => !usedColors.includes(color));

  return availableColors.length > 0 ? availableColors[0] : SUBJECT_COLORS[0];
}

export function createTopic(
  subject: string,
  topic: string,
  tags: string[] = [],
  source: 'aula' | 'livro' | 'video' | 'outro' = 'aula',
  existingSubjects: { subject: string; color: string }[] = []
): Topic {
  const createdAt = new Date();
  const id = generateTopicId();
  const scheduledReviews = calculateNextReviews(createdAt);
  const color = getSubjectColor(subject, existingSubjects);

  // Debug log for testing
  console.log(`📚 Topic created: "${topic}"`, {
    createdAt: createdAt.toLocaleDateString('pt-BR'),
    reviews: scheduledReviews.map((date, index) => ({
      review: index + 1,
      date: date.toLocaleDateString('pt-BR'),
      daysFromNow: Math.ceil((date.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
    }))
  });

  return {
    id,
    createdAt,
    subject,
    topic,
    tags,
    source,
    color,
    reviews: [],
    scheduledReviews,
    completed: false,
  };
}

export function completeReview(topic: Topic, reviewIndex: number): Topic {
  const updatedTopic = { ...topic };
  const reviewDate = new Date();

  // Add completed review
  const review: Review = {
    date: reviewDate,
    completed: true,
    reviewNumber: reviewIndex + 1,
  };

  updatedTopic.reviews.push(review);

  // Mark as completed if all reviews are done
  if (updatedTopic.reviews.length >= REVIEW_INTERVALS.length) {
    updatedTopic.completed = true;
  }

  return updatedTopic;
}

export function getTopicsForDate(topics: Topic[], date: Date): Topic[] {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const filteredTopics = topics.filter(topic => {
    // Skip completed topics
    if (topic.completed) return false;

    // Get next review due
    const nextReviewIndex = topic.reviews.length;
    if (nextReviewIndex >= topic.scheduledReviews.length) return false;

    const nextReviewDate = new Date(topic.scheduledReviews[nextReviewIndex]);
    nextReviewDate.setHours(0, 0, 0, 0);

    // Show if review is due on this date or overdue
    const shouldShow = nextReviewDate.getTime() <= targetDate.getTime();

    // Debug log for development
    if (shouldShow) {
      console.log(`📅 Topic "${topic.topic}" scheduled for ${targetDate.toLocaleDateString('pt-BR')}`, {
        reviewNumber: nextReviewIndex + 1,
        reviewDate: nextReviewDate.toLocaleDateString('pt-BR'),
        targetDate: targetDate.toLocaleDateString('pt-BR'),
        isOverdue: nextReviewDate.getTime() < targetDate.getTime()
      });
    }

    return shouldShow;
  });

  return filteredTopics;
}

export function getWeekDates(startDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const today = new Date(startDate);

  // Get start of week (Monday)
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    dates.push(date);
  }

  return dates;
}

export function getMonthDates(startDate: Date = new Date()): Date[] {
  const dates: Date[] = [];
  const today = new Date(startDate);

  // Get start of week (Monday) for current week
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  const startMonday = new Date(today);
  startMonday.setDate(today.getDate() + mondayOffset);
  startMonday.setHours(0, 0, 0, 0);

  // Generate 4 weeks (28 days) starting from this Monday
  for (let i = 0; i < 28; i++) {
    const date = new Date(startMonday);
    date.setDate(startMonday.getDate() + i);
    dates.push(date);
  }

  return dates;
}

export function groupDatesByWeek(dates: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }
  return weeks;
}

export function formatDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  if (targetDate.getTime() === today.getTime()) {
    return 'Hoje';
  } else if (targetDate.getTime() === tomorrow.getTime()) {
    return 'Amanhã';
  } else if (targetDate.getTime() === yesterday.getTime()) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    });
  }
}

export function isOverdue(topic: Topic): boolean {
  if (topic.completed) return false;

  const nextReviewIndex = topic.reviews.length;
  if (nextReviewIndex >= topic.scheduledReviews.length) return false;

  const nextReviewDate = new Date(topic.scheduledReviews[nextReviewIndex]);
  nextReviewDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return nextReviewDate.getTime() < today.getTime();
}