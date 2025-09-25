'use client';

import { useState } from 'react';
import { StoredSubject } from '@/utils/storage';

interface SubjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: StoredSubject[];
  onUpdateSubject: (oldSubject: string, newSubject: string, newColor: string) => void;
  onDeleteSubject: (subject: string) => void;
}

const SUBJECT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
  '#ec4899', '#6366f1', '#14b8a6', '#eab308',
  '#a855f7', '#22d3ee', '#65a30d', '#ea580c'
];

export default function SubjectsModal({
  isOpen,
  onClose,
  subjects,
  onUpdateSubject,
  onDeleteSubject
}: SubjectsModalProps) {
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleStartEdit = (subject: StoredSubject) => {
    setEditingSubject(subject.subject);
    setEditName(subject.subject);
    setEditColor(subject.color);
  };

  const handleSaveEdit = () => {
    if (editingSubject && editName.trim()) {
      onUpdateSubject(editingSubject, editName.trim(), editColor);
      setEditingSubject(null);
      setEditName('');
      setEditColor('');
    }
  };

  const handleCancelEdit = () => {
    setEditingSubject(null);
    setEditName('');
    setEditColor('');
  };

  const handleDelete = (subject: string) => {
    if (confirm(`Deletar a matéria "${subject}" e todos os seus tópicos?`)) {
      onDeleteSubject(subject);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Gerenciar Matérias ({subjects.length})
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhuma matéria encontrada</p>
              <p className="text-sm text-gray-500 mt-2">
                Adicione alguns tópicos primeiro para criar matérias
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {subjects.map((subject) => (
                <div
                  key={subject.subject}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  {editingSubject === subject.subject ? (
                    // Edit mode
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome da Matéria
                        </label>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          placeholder="Nome da matéria"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cor
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SUBJECT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => setEditColor(color)}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${
                                editColor === color
                                  ? 'border-gray-800 scale-110'
                                  : 'border-gray-300 hover:border-gray-500'
                              }`}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editName.trim()}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="font-medium text-gray-900">
                          {subject.subject}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(subject)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Editar matéria"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>

                        <button
                          onClick={() => handleDelete(subject.subject)}
                          className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                          title="Deletar matéria"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}