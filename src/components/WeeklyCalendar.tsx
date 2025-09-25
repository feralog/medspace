'use client';

import { useState } from 'react';
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
  onShowDetails: (topic: Topic, reviewIndex: number) => void;
}

interface TopicDetailsModalProps {
  topic: Topic | null;
  reviewIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (topicId: string, reviewIndex: number) => void;
  onDelete?: (topicId: string) => void;
}

function TopicDetailsModal({ topic, reviewIndex, isOpen, onClose, onComplete, onDelete }: TopicDetailsModalProps) {
  if (!isOpen || !topic) return null;

  const isOverdueItem = isOverdue(topic);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: topic.color }}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{topic.subject}</h3>
                <p className="text-sm text-gray-600">{reviewIndex + 1}ª revisão</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Topic title - full text */}
          <div className="mb-4">
            <h4 className="text-base font-medium text-gray-900 mb-2">Tópico:</h4>
            <p className="text-gray-800 leading-relaxed">{topic.topic}</p>
          </div>

          {/* Tags */}
          {topic.tags.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {topic.tags.map((tag) => (
                  <span key={tag} className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          <div className="mb-6">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded capitalize">
              {topic.source}
            </span>
          </div>

          {/* Overdue warning */}
          {isOverdueItem && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm text-red-700">⚠ Esta revisão está atrasada</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                onComplete(topic.id, reviewIndex);
                onClose();
              }}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ✓ Concluir Revisão
            </button>
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`Deletar "${topic.topic}"?`)) {
                    onDelete(topic.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                Deletar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TopicItem({ topic, reviewIndex, onComplete, onDelete, onShowDetails }: TopicItemProps) {
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

        {/* Content - clickable */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onShowDetails(topic, reviewIndex)}
          title="Clique para ver detalhes completos"
        >
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

          {/* Topic title - still truncated but clickable for details */}
          <p className="text-xs text-gray-900 font-medium truncate">
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
              onClick={(e) => {
                e.stopPropagation();
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
            onClick={(e) => {
              e.stopPropagation();
              onComplete(topic.id, reviewIndex);
            }}
            className="w-4 h-4 border border-blue-300 rounded hover:bg-blue-50 hover:border-blue-500 transition-colors flex items-center justify-center"
            title="Concluir revisão"
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
  onDeleteTopic,
  onShowDetails
}: {
  date: Date;
  topics: Topic[];
  onCompleteReview: (topicId: string, reviewIndex: number) => void;
  onDeleteTopic?: (topicId: string) => void;
  onShowDetails: (topic: Topic, reviewIndex: number) => void;
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
                onShowDetails={onShowDetails}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

export default function WeeklyCalendar({ topics, onCompleteReview, onDeleteTopic, currentWeekStart, viewMode = 'month' }: WeeklyCalendarProps) {
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedReviewIndex, setSelectedReviewIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dates = viewMode === 'week' ? getWeekDates(currentWeekStart) : getMonthDates(currentWeekStart);
  const weeks = viewMode === 'month' ? groupDatesByWeek(dates) : [dates];

  const handleShowDetails = (topic: Topic, reviewIndex: number) => {
    setSelectedTopic(topic);
    setSelectedReviewIndex(reviewIndex);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTopic(null);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {viewMode === 'month' ? (
        // Month View - Grid of weeks with mobile scroll
        <>
          {/* Mobile Month View - Horizontal scroll */}
          <div className="lg:hidden">
            <div className="overflow-x-auto">
              <div className="divide-y divide-gray-200">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex divide-x divide-gray-200 min-w-[700px]">
                    {week.map((date) => (
                      <div key={date.toISOString()} className="min-h-[120px] w-[100px] flex-shrink-0">
                        <DayColumn
                          date={date}
                          topics={topics}
                          onCompleteReview={onCompleteReview}
                          onDeleteTopic={onDeleteTopic}
                          onShowDetails={handleShowDetails}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Month View - Grid layout */}
          <div className="hidden lg:block">
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
                        onShowDetails={handleShowDetails}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Week View - Original layout with mobile scroll
        <>
          {/* Mobile Week View - Horizontal scroll */}
          <div className="lg:hidden">
            <div className="overflow-x-auto">
              <div className="flex divide-x divide-gray-200 min-w-[700px]">
                {dates.map((date) => (
                  <div key={date.toISOString()} className="w-[100px] flex-shrink-0">
                    <DayColumn
                      date={date}
                      topics={topics}
                      onCompleteReview={onCompleteReview}
                      onDeleteTopic={onDeleteTopic}
                      onShowDetails={handleShowDetails}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Week View - Flex layout */}
          <div className="hidden lg:flex divide-x divide-gray-200">
            {dates.map((date) => (
              <DayColumn
                key={date.toISOString()}
                date={date}
                topics={topics}
                onCompleteReview={onCompleteReview}
                onDeleteTopic={onDeleteTopic}
                onShowDetails={handleShowDetails}
              />
            ))}
          </div>
        </>
      )}
      </div>

      {/* Topic Details Modal */}
      <TopicDetailsModal
        topic={selectedTopic}
        reviewIndex={selectedReviewIndex}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onComplete={onCompleteReview}
        onDelete={onDeleteTopic}
      />
    </>
  );
}