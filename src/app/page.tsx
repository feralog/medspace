'use client';

import { useState, useEffect } from 'react';
import { Topic } from '@/types';
import { loadTopics, loadSubjects, addTopicAndUpdateStorage, completeTopicReview, deleteTopic, updateSubject, deleteSubject, StoredSubject } from '@/utils/storage';
import AddTopicModal from '@/components/AddTopicModal';
import SubjectsModal from '@/components/SubjectsModal';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user, loading: authLoading, signOut } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subjects, setSubjects] = useState<StoredSubject[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubjectsModalOpen, setIsSubjectsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Load data when user is authenticated
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      setIsAuthModalOpen(true);
      return;
    }

    const loadData = async () => {
      try {
        const [loadedTopics, loadedSubjects] = await Promise.all([
          loadTopics(),
          loadSubjects()
        ]);
        setTopics(loadedTopics);
        setSubjects(loadedSubjects);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading]);

  // Stats
  const activeTopics = topics.filter(t => !t.completed);
  const todayTopics = topics.filter(t => {
    const nextReviewIndex = t.reviews.length;
    if (nextReviewIndex >= t.scheduledReviews.length) return false;

    const reviewDate = new Date(t.scheduledReviews[nextReviewIndex]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    reviewDate.setHours(0, 0, 0, 0);

    return reviewDate.getTime() <= today.getTime();
  });

  const handleAddTopic = async (topic: Omit<Topic, 'id' | 'createdAt' | 'scheduledReviews' | 'reviews' | 'completed'>) => {
    try {
      const result = await addTopicAndUpdateStorage(topic, topics, subjects);
      setTopics(result.topics);
      setSubjects(result.subjects);
    } catch (error) {
      console.error('Error adding topic:', error);
      // You could add a toast notification here
    }
  };

  const handleCompleteReview = async (topicId: string, reviewIndex: number) => {
    try {
      const updatedTopics = await completeTopicReview(topicId, reviewIndex, topics);
      setTopics(updatedTopics);
    } catch (error) {
      console.error('Error completing review:', error);
      // You could add a toast notification here
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const updatedTopics = await deleteTopic(topicId, topics);
      setTopics(updatedTopics);
    } catch (error) {
      console.error('Error deleting topic:', error);
      // You could add a toast notification here
    }
  };

  const handleUpdateSubject = async (oldSubject: string, newSubject: string, newColor: string) => {
    try {
      const result = await updateSubject(oldSubject, newSubject, newColor, topics, subjects);
      setTopics(result.topics);
      setSubjects(result.subjects);
    } catch (error) {
      console.error('Error updating subject:', error);
      // You could add a toast notification here
    }
  };

  const handleDeleteSubject = async (subjectToDelete: string) => {
    try {
      const result = await deleteSubject(subjectToDelete, topics, subjects);
      setTopics(result.topics);
      setSubjects(result.subjects);
    } catch (error) {
      console.error('Error deleting subject:', error);
      // You could add a toast notification here
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    // Only allow shortcuts when user is authenticated and no modals are open
    if (user && (e.code === 'Space' || e.key === 'a') && !isAddModalOpen && !isSubjectsModalOpen && !isAuthModalOpen) {
      e.preventDefault();
      setIsAddModalOpen(true);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [!!user, isAddModalOpen, isSubjectsModalOpen, isAuthModalOpen]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-800 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if user is not logged in
  if (!user) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">MedSpace</h1>
            <p className="text-gray-700 mb-6">
              Sistema de revisão espaçada para estudantes de medicina.
              Entre ou crie sua conta para começar.
            </p>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Entrar / Criar Conta
            </button>
          </div>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MedSpace</h1>
              <p className="text-sm text-gray-700">Revisão espaçada para medicina</p>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 hidden sm:inline">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Sair
              </button>
            </div>

            {/* Stats */}
            <div className="hidden sm:flex items-center space-x-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{todayTopics.length}</p>
                <p className="text-xs text-gray-600 font-medium">Hoje</p>
              </div>
              <button
                onClick={() => setIsSubjectsModalOpen(true)}
                className="text-center hover:bg-gray-100 px-2 py-1 rounded transition-colors"
              >
                <p className="text-2xl font-bold text-gray-800">{activeTopics.length}</p>
                <p className="text-xs text-gray-600 font-medium">Ativas</p>
              </button>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{subjects.length}</p>
                <p className="text-xs text-gray-600 font-medium">Matérias</p>
              </div>
            </div>

            {/* Add button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              + Adicionar
            </button>
          </div>

          {/* Mobile stats */}
          <div className="sm:hidden flex justify-center space-x-8 mt-4">
            <div className="text-center">
              <p className="text-xl font-bold text-blue-600">{todayTopics.length}</p>
              <p className="text-xs text-gray-600 font-medium">Hoje</p>
            </div>
            <button
              onClick={() => setIsSubjectsModalOpen(true)}
              className="text-center hover:bg-gray-100 px-2 py-1 rounded transition-colors"
            >
              <p className="text-xl font-bold text-gray-800">{activeTopics.length}</p>
              <p className="text-xs text-gray-600 font-medium">Ativas</p>
            </button>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800">{subjects.length}</p>
              <p className="text-xs text-gray-600 font-medium">Matérias</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {topics.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Bem-vindo ao MedSpace!
            </h2>
            <p className="text-gray-700 mb-6 max-w-md mx-auto">
              Comece adicionando seus primeiros tópicos de estudo.
              O sistema cuidará automaticamente das revisões espaçadas.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Adicionar Primeiro Tópico
            </button>
            <p className="text-sm text-gray-600 mt-4">
              Dica: Pressione <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">Espaço</kbd> para adicionar rapidamente
            </p>
          </div>
        ) : (
          // Calendar view
          <div className="space-y-6">
            {/* Calendar Header with Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Revisões - {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </h2>

                {/* Month Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Mês anterior"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={goToToday}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Hoje
                  </button>

                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Próximo mês"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-700">
                Pressione <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-medium">Espaço</kbd> para adicionar tópico
              </p>
            </div>

            <WeeklyCalendar
              topics={topics}
              onCompleteReview={handleCompleteReview}
              onDeleteTopic={handleDeleteTopic}
              currentWeekStart={currentDate}
            />
          </div>
        )}
      </main>

      {/* Add Topic Modal */}
      <AddTopicModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTopic={handleAddTopic}
        existingSubjects={subjects}
      />

      {/* Subjects Modal */}
      <SubjectsModal
        isOpen={isSubjectsModalOpen}
        onClose={() => setIsSubjectsModalOpen(false)}
        subjects={subjects}
        onUpdateSubject={handleUpdateSubject}
        onDeleteSubject={handleDeleteSubject}
      />

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center lg:hidden transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
