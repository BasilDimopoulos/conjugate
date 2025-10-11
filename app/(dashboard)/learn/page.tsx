'use client';
import FlashCard from '@/app/_components/flashcard';
import { ReviewFlashCardOptions } from '@/app/_components/flashcard';
import { useEffect, useState } from 'react';
import { Word } from '@prisma/client';
import { getReviewDeck, updateWordReview, getUserVocabStats } from '@/app/_services/srs';
import type { Difficulty } from '@/app/_services/srs-types';

interface ReviewWord {
  userWordId: string;
  wordData: Partial<Word> | null;
  srsData: {
    level: number;
    repetitions: number;
    nextReviewTime: Date;
    interval: number;
  };
}

interface VocabStats {
  total: number;
  dueCount: number;
  masteredCount: number;
  learning: number;
}

export default function LearnPage() {
  const [reviewWords, setReviewWords] = useState<ReviewWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [stats, setStats] = useState<VocabStats | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    fetchReviewWords();
    fetchStats();
  }, []);

  const fetchReviewWords = async () => {
    try {
      setLoading(true);
      // Using server function directly instead of API call
      const data = await getReviewDeck(20);
      setReviewWords(data.words as ReviewWord[]);
      if (data.words.length === 0) {
        setSessionComplete(true);
      }
    } catch (error) {
      console.error('Error fetching review words:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Using server function directly instead of API call
      const data = await getUserVocabStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReview = async (userWordId: string, difficulty: Difficulty) => {
    try {
      setReviewing(true);
      // Using server function directly instead of API call
      await updateWordReview(userWordId, difficulty);

      setReviewedCount(prev => prev + 1);

      // Move to next card
      if (currentIndex < reviewWords.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Completed all reviews
        setSessionComplete(true);
        fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to save review. Please try again.');
    } finally {
      setReviewing(false);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setSessionComplete(false);
    setReviewedCount(0);
    fetchReviewWords();
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white/80">
        <div className="animate-pulse">
          <p className="text-xl">Loading your review deck...</p>
        </div>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white/80">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🎉 Review Complete!</h1>
          <p className="text-xl mb-8">
            You reviewed {reviewedCount} word{reviewedCount !== 1 ? 's' : ''} today
          </p>
          
          {stats && (
            <div className="bg-black/40 rounded-lg p-6 mb-8 max-w-md">
              <h2 className="text-2xl font-semibold mb-4">Your Progress</h2>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-white/60 text-sm">Total Words</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Mastered</p>
                  <p className="text-2xl font-bold text-green-500">{stats.masteredCount}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Learning</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.learning}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Due Now</p>
                  <p className="text-2xl font-bold text-orange-500">{stats.dueCount}</p>
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={resetSession}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Check for More Reviews
          </button>
        </div>
      </div>
    );
  }

  if (reviewWords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white/80">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">No Words Due for Review</h1>
          <p className="text-xl mb-8">Come back later or add more words to your deck!</p>
          
          {stats && (
            <div className="bg-black/40 rounded-lg p-6 max-w-md">
              <h2 className="text-xl font-semibold mb-4">Your Vocabulary</h2>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <p className="text-white/60 text-sm">Total Words</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <div>
                  <p className="text-white/60 text-sm">Mastered</p>
                  <p className="text-2xl font-bold text-green-500">{stats.masteredCount}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentWord = reviewWords[currentIndex];

  return (
    <div className="flex flex-col items-center text-white/80 px-4 py-8">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-white/60">
            Card {currentIndex + 1} of {reviewWords.length}
          </p>
          <p className="text-sm text-white/60">
            Level {currentWord.srsData.level}
          </p>
        </div>
        <div className="w-full bg-black/40 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / reviewWords.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="flex gap-4 mb-6">
          <div className="bg-black/40 rounded-lg px-4 py-2">
            <p className="text-xs text-white/60">Due Today</p>
            <p className="text-lg font-bold">{stats.dueCount}</p>
          </div>
          <div className="bg-black/40 rounded-lg px-4 py-2">
            <p className="text-xs text-white/60">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
        </div>
      )}

      {/* Flashcard */}
      {currentWord.wordData && (
        <div className="w-full max-w-4xl">
          <FlashCard
            card={currentWord.wordData}
            cardOptions={
              <ReviewFlashCardOptions
                userWordId={currentWord.userWordId}
                onReview={handleReview}
              />
            }
          />
        </div>
      )}

      {/* Reviewing indicator */}
      {reviewing && (
        <div className="mt-4 text-white/60 animate-pulse">
          Saving your review...
        </div>
      )}

      {/* SRS Info */}
      <div className="mt-8 text-center text-white/40 text-sm">
        <p>Next review in {currentWord.srsData.interval} day{currentWord.srsData.interval !== 1 ? 's' : ''}</p>
        <p className="mt-1">Repetitions: {currentWord.srsData.repetitions}</p>
      </div>
    </div>
  );
}
