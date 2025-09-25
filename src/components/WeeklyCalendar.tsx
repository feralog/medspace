'use client';

import { Topic } from '@/types';
import { getWeekDates, getMonthDates, groupDatesByWeek, getTopicsForDate, formatDate, isOverdue } from '@/utils/spaced-repetition';

interface WeeklyCalendarProps {
  topics: Topic[];
  onCompleteReview: (topicId: string, reviewIndex: number) => void;
  onDeleteTopic?: (topicId: string) => void;
  currentWeekStart?: Date;
  viewMode?: 'week' | 'month';
}

interface TopicItemProps {
  topic: Topic;
  reviewIndex: number;
  onComplete: (topicId: string, reviewIndex: number) => void;
  onDelete?: (topicId: string) => void;
}

function TopicItem({ topic, reviewIndex, onComplete, onDelete }: TopicItemProps) {
  const isOverdueItem = isOverdue(topic);

  return (
    <div className={`p-2 rounded border transition-all group text-xs ${
      isOverdueItem
        ? 'border-red-200 bg-red-50'
        : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}>
      {/* Compact layout */}
      <div className="flex items-start gap-2">
        {/* Color indicator */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: topic.color }}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Subject */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs font-semibold text-gray-800 truncate">
              {topic.subject}
            </span>
            <span className="text-xs px-1 py-0.5 bg-gray-200 text-gray-600 rounded text-xs whitespace-nowrap">
              {reviewIndex + 1}ª
            </span>
            {isOverdueItem && (
              <span className="text-xs px-1 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                ⚠
              </span>
            )}
          </div>

          {/* Topic title - wrap text to show full content */}
          <p className="text-xs text-gray-900 font-medium leading-tight break-words" title={topic.topic}>
            {topic.topic}
          </p>

          {/* Tags - only show first one */}
          {topic.tags.length > 0 && (
            <span className="inline-block text-xs px-1 py-0.5 bg-gray-100 text-gray-600 rounded mt-1">
              #{topic.tags[0]}
            </span>
          )}
        </div>

        {/* Actions - compact */}
        <div className="flex items-start gap-1 flex-shrink-0">
          {/* Delete button */}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`Deletar "${topic.topic}"?`)) {
                  onDelete(topic.id);
                }
              }}
              className="w-4 h-4 opacity-0 group-hover:opacity-100 hover:text-red-600 text-gray-400 transition-all flex items-center justify-center"
              title="Deletar"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {/* Checkbox */}
          <button
            onClick={() => onComplete(topic.id, reviewIndex)}
            className="w-4 h-4 border border-blue-300 rounded hover:bg-blue-50 hover:border-blue-500 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-3 h-3 text-blue-500 opacity-0 hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  date,
  topics,
  onCompleteReview,
  onDeleteTopic
}: {
  date: Date;
  topics: Topic[];
  onCompleteReview: (topicId: string, reviewIndex: number) => void;
  onDeleteTopic?: (topicId: string) => void;
}) {
  const dayTopics = getTopicsForDate(topics, date);
  const isToday = new Date().toDateString() === date.toDateString();
  // const isPast = date < new Date();

  return (
    <div className={`flex-1 min-w-0 ${isToday ? 'bg-blue-50' : ''}`}>
      {/* Day header */}
      <div className={`p-3 border-b ${isToday ? 'border-blue-200' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-bold uppercase tracking-wide ${
              isToday ? 'text-blue-700' : 'text-gray-600'
            }`}>
              {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
            </p>
            <p className={`text-lg font-bold ${
              isToday ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {formatDate(date)}
            </p>
          </div>
          {dayTopics.length > 0 && (
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
              isToday
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-800'
            }`}>
              {dayTopics.length}
            </span>
          )}
        </div>
      </div>

      {/* Topics list */}
      <div className="p-2 space-y-1 min-h-[80px] max-h-[200px] overflow-y-auto">
        {dayTopics.length === 0 ? (
          <p className="text-xs text-gray-400 italic text-center mt-4">
            —
          </p>
        ) : (
          dayTopics.map((topic) => {
            const reviewIndex = topic.reviews.length;
            return (
              <TopicItem
                key={`${topic.id}-${reviewIndex}`}
                topic={topic}
                reviewIndex={reviewIndex}
                onComplete={onCompleteReview}
                onDelete={onDeleteTopic}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default function WeeklyCalendar({ topics, onCompleteReview, onDeleteTopic, currentWeekStart, viewMode = 'month' }: WeeklyCalendarProps) {
  const dates = viewMode === 'week' ? getWeekDates(currentWeekStart) : getMonthDates(currentWeekStart);
  const weeks = viewMode === 'month' ? groupDatesByWeek(dates) : [dates];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {viewMode === 'month' ? (
        // Month View - Grid of weeks
        <div className="divide-y divide-gray-200">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-200">
              {week.map((date) => (
                <div key={date.toISOString()} className="min-h-[120px]">
                  <DayColumn
                    date={date}
                    topics={topics}
                    onCompleteReview={onCompleteReview}
                    onDeleteTopic={onDeleteTopic}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        // Week View - Original layout
        <>
          {/* Mobile View */}
          <div className="lg:hidden">
            {dates.map((date) => (
              <div key={date.toISOString()}>
                <DayColumn
                  date={date}
                  topics={topics}
                  onCompleteReview={onCompleteReview}
                  onDeleteTopic={onDeleteTopic}
                />
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden lg:flex divide-x divide-gray-200">
            {dates.map((date) => (
              <DayColumn
                key={date.toISOString()}
                date={date}
                topics={topics}
                onCompleteReview={onCompleteReview}
                onDeleteTopic={onDeleteTopic}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}