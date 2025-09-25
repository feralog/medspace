'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Topic } from '@/types';
import { createTopic } from '@/utils/spaced-repetition';
import { StoredSubject, loadSettings, saveSettings } from '@/utils/storage';

interface AddTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTopic: (topic: Topic) => void;
  existingSubjects: StoredSubject[];
}

const SOURCES = [
  { value: 'aula' as const, label: 'Aula' },
  { value: 'livro' as const, label: 'Livro' },
  { value: 'video' as const, label: 'Vídeo' },
  { value: 'outro' as const, label: 'Outro' },
];

export default function AddTopicModal({ isOpen, onClose, onAddTopic, existingSubjects }: AddTopicModalProps) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [source, setSource] = useState<'aula' | 'livro' | 'video' | 'outro'>('aula');
  const [commonTags, setCommonTags] = useState<string[]>([]);
  const [recentSubjects, setRecentSubjects] = useState<string[]>([]);

  const subjectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const settings = loadSettings();
      setCommonTags(settings.commonTags);
      setRecentSubjects(settings.recentSubjects);
      setSubject(settings.lastUsedSubject);

      // Auto-focus first field
      setTimeout(() => {
        subjectInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && e.ctrlKey) {
        handleSubmit();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, handleSubmit]);

  const handleSubmit = useCallback(() => {
    if (!subject.trim() || !topic.trim()) return;

    const newTopic = createTopic(
      subject.trim(),
      topic.trim(),
      selectedTags,
      source,
      existingSubjects
    );

    onAddTopic(newTopic);

    // Save settings
    saveSettings({
      lastUsedSubject: subject.trim(),
    });

    // Reset form
    setSubject('');
    setTopic('');
    setSelectedTags([]);
    setSource('aula');

    onClose();
  }, [subject, topic, selectedTags, source, existingSubjects, onAddTopic, onClose]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubjectSelect = (selectedSubject: string) => {
    setSubject(selectedSubject);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Adicionar Tópico
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Matéria
              </label>
              <input
                ref={subjectInputRef}
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Ex: Pediatria"
                autoComplete="off"
              />

              {/* Recent Subjects */}
              {recentSubjects.length > 0 && subject === '' && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentSubjects.slice(0, 5).map((recentSubject) => (
                    <button
                      key={recentSubject}
                      type="button"
                      onClick={() => handleSubjectSelect(recentSubject)}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      {recentSubject}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tópico
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                placeholder="Ex: Nutrologia Pediátrica"
                autoComplete="off"
              />
            </div>

            {/* Source */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fonte
              </label>
              <div className="grid grid-cols-4 gap-2">
                {SOURCES.map((src) => (
                  <button
                    key={src.value}
                    type="button"
                    onClick={() => setSource(src.value)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      source === src.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {src.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (opcional)
              </label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!subject.trim() || !topic.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Adicionar
              </button>
            </div>

            <p className="text-xs text-gray-600 text-center">
              Pressione Ctrl+Enter para adicionar rapidamente
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}