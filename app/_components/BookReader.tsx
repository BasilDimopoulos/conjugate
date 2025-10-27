'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { BiX, BiPlusCircle, BiCheckCircle, BiLoader, BiPlay, BiPause } from 'react-icons/bi';
import Image from 'next/image';
import type { Word } from '@prisma/client';
import { getOrCreateWordFlashcard, isWordInUserDeck, addWordFromContent, checkWordsInDeck } from '@/app/_services/content';
import { updateReadingProgress } from '@/app/_services/book-builder';

interface BookPage {
  pageNumber: number;
  content: string;
  words: string[];
  imageUrl?: string;
  audioUrl?: string;
}

interface BookReaderProps {
  bookId: string;
  title: string;
  language: string;
  pages: BookPage[];
  initialPage?: number;
  userId: string;
  audioUrl?: string | null;
  hasFullAudio?: boolean;
  onClose: () => void;
}

export default function BookReader(props: BookReaderProps) {
  // currentLocation represents the LEFT page index (right page is currentLocation + 1 on desktop)
  const [currentLocation, setLocation] = useState(props.initialPage || 0);
  const [wordStatuses, setWordStatuses] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [flashcardData, setFlashcardData] = useState<Partial<Word> | null>(null);
  const [loadingFlashcard, setLoadingFlashcard] = useState(false);
  const [wordInDeck, setWordInDeck] = useState(false);
  
  // Image orientation tracking
  const [imageOrientations, setImageOrientations] = useState<Record<number, 'vertical' | 'horizontal'>>({});
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string>('');
  
  // Text selection translation state
  const [selectedText, setSelectedText] = useState<string>('');
  const [translationPopup, setTranslationPopup] = useState(false);
  const [translation, setTranslation] = useState<string>('');
  const [loadingTranslation, setLoadingTranslation] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasFullAudio] = useState(props.hasFullAudio || false);
  const [showAudioPrompt, setShowAudioPrompt] = useState(false);
  const [generatingFullAudio, setGeneratingFullAudio] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const leftPage = props.pages[currentLocation];
  const rightPage = isMobile ? undefined : props.pages[currentLocation + 1];
  const progress = calculateLocation(currentLocation, props.pages.length);

  function calculateLocation(currentLocation: number, totalPages: number) {
    if (currentLocation + 2 >= totalPages) {
      return 100;
    } else {
      return (currentLocation / totalPages) * 100;
    }
  }

  const moveForward = useCallback(() => {
    const step = isMobile ? 1 : 2; // Mobile: 1 page, Desktop: 2 pages
    if (currentLocation + step < props.pages.length) {
      const newLocation = currentLocation + step;
      setLocation(newLocation);
      
      // Check if user has navigated past initial audio coverage (~2 pages)
      if (newLocation >= 2 && props.audioUrl && !hasFullAudio && !showAudioPrompt) {
        setShowAudioPrompt(true);
      }
    }
  }, [isMobile, currentLocation, props.pages.length, props.audioUrl, hasFullAudio, showAudioPrompt]);

  const moveBackward = useCallback(() => {
    const step = isMobile ? 1 : 2; // Mobile: 1 page, Desktop: 2 pages
    const newLocation = currentLocation - step;
    if (newLocation >= 0) {
      setLocation(newLocation);
    }
  }, [isMobile, currentLocation]);

  // Keyboard navigation - using useCallback to avoid re-creating
  const iteratePage = useCallback((event: KeyboardEvent) => {
    if (event.key === "ArrowLeft" || event.key === "37") {
      moveBackward();
    } else if (event.key === "ArrowRight" || event.key === "39") {
      moveForward();
    } else if (event.key === "Escape") {
      if (lightboxOpen) {
        setLightboxOpen(false);
      } else {
        setSidebarOpen(false);
      }
    }
  }, [lightboxOpen, moveBackward, moveForward]);

  const loadSpreadWordStatuses = useCallback(async () => {
    try {
      const allWords: string[] = [];
      
      if (leftPage) allWords.push(...leftPage.words);
      if (rightPage) allWords.push(...rightPage.words);

      const uniqueWords = [...new Set(
        allWords.map(w => w.replace(/[.,!?;:"""''。，！？；：、]/g, '')).filter(w => w)
      )];

      const statusArray = await checkWordsInDeck(uniqueWords, props.userId);
      
      const statuses: Record<string, boolean> = {};
      uniqueWords.forEach((word, index) => {
        statuses[word] = statusArray[index] || false;
      });
      
      setWordStatuses(statuses);
    } catch (error) {
      console.error('Error loading word statuses:', error);
    }
  }, [leftPage, rightPage, props.userId]);

  useEffect(() => {
    document.addEventListener("keydown", iteratePage, true);
    return () => {
      document.removeEventListener("keydown", iteratePage, true);
    };
  }, [iteratePage]);

  useEffect(() => {
    loadSpreadWordStatuses();
  }, [currentLocation, loadSpreadWordStatuses]);

  useEffect(() => {
    const updateProgress = async () => {
      try {
        await updateReadingProgress(props.bookId, currentLocation);
      } catch (error) {
        console.error('Error updating reading progress:', error);
      }
    };

    updateProgress();
  }, [currentLocation, props.bookId]);

  const handleWordClick = async (word: string) => {
    const cleanWord = word.replace(/[.,!?;:"""''。，！？；：、]/g, '');
    if (!cleanWord) return;

    setSelectedWord(cleanWord);
    setSidebarOpen(true);
    setLoadingFlashcard(true);
    setFlashcardData(null);

    try {
      const inDeck = await isWordInUserDeck(cleanWord);
      setWordInDeck(inDeck);

      const card = await getOrCreateWordFlashcard(cleanWord, props.language);
      setFlashcardData(card);
    } catch (error) {
      console.error('Error loading flashcard:', error);
    } finally {
      setLoadingFlashcard(false);
    }
  };

  const handleAddWordToDeck = async () => {
    if (!selectedWord) return;

    try {
      await addWordFromContent(props.userId, selectedWord, props.language);
      setWordInDeck(true);
      setWordStatuses(prev => ({ ...prev, [selectedWord]: true }));
    } catch (error) {
      console.error('Error adding word:', error);
    }
  };

  const handleImageLoad = (pageNumber: number, img: HTMLImageElement) => {
    const isVertical = img.naturalHeight > img.naturalWidth;
    setImageOrientations(prev => ({
      ...prev,
      [pageNumber]: isVertical ? 'vertical' : 'horizontal'
    }));
  };

  const openLightbox = (imageUrl: string) => {
    setLightboxImage(imageUrl);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage('');
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    
    if (text && text.length > 1) {
      setSelectedText(text);
      
      // Get the position for the popup
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      
      if (rect) {
        setPopupPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
      }
      
      setTranslationPopup(true);
      setLoadingTranslation(true);
      
      try {
        // Call translation API
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            targetLanguage: 'english',
            sourceLanguage: props.language || undefined // Allow auto-detection
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          console.error('Translation API error:', data);
          setTranslation(data.error || 'Translation failed');
        } else {
          setTranslation(data.translation || 'Translation unavailable');
        }
      } catch (error) {
        console.error('Translation error:', error);
        setTranslation('Translation failed');
      } finally {
        setLoadingTranslation(false);
      }
    }
  };

  const closeTranslationPopup = () => {
    setTranslationPopup(false);
    setSelectedText('');
    setTranslation('');
    window.getSelection()?.removeAllRanges();
  };

  const generateFullAudio = async () => {
    setGeneratingFullAudio(true);
    setShowAudioPrompt(false);
    
    try {
      const response = await fetch('/api/generate-full-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId: props.bookId,
          language: props.language,
        }),
      });
      
      if (response.ok) {
        await response.json(); // Response data not needed, just checking success
        // Reload the page to get the new audio URL
        window.location.reload();
      } else {
        console.error('Failed to generate full audio');
      }
    } catch (error) {
      console.error('Error generating full audio:', error);
    } finally {
      setGeneratingFullAudio(false);
    }
  };

  // Audio player handlers
  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const time = audioRef.current.currentTime;
    setCurrentTime(time);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const renderPageContent = (page: BookPage | undefined) => {
    if (!page) {
      return (
        <div className="h-full flex items-center justify-center">
          <p className="text-gray-400 text-lg">End of book</p>
        </div>
      );
    }

    const isVerticalImage = imageOrientations[page.pageNumber] === 'vertical';

    // If vertical image, show ONLY the image (full page)
    if (page.imageUrl && isVerticalImage) {
      return (
        <div className="h-full w-full relative">
          {/* Page Number - Absolute positioned, white text, responsive */}
          <h3 className="absolute top-0 left-0 font-bold text-sm md:text-base text-white/80 z-10 bg-black/60 px-2 py-1 rounded">{page.pageNumber}</h3>
          
          {/* Full Page Vertical Image - Covers entire page */}
          <div 
            className="h-full w-full relative cursor-zoom-in hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(page.imageUrl!)}
            title="Click to view full size"
          >
            <Image
              src={page.imageUrl}
              fill
              alt={`Page ${page.pageNumber} illustration`}
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              onLoadingComplete={(e) => handleImageLoad(page.pageNumber, e)}
            />
          </div>
        </div>
      );
    }

    // For horizontal images or no image, show image + text
    return (
      <div className="h-full flex flex-col">
        {/* Page Number - white text for dark theme, responsive */}
        <h3 className="font-bold mb-2 md:mb-3 text-sm md:text-base text-white/60">{page.pageNumber}</h3>
        
        {/* Horizontal Image - Fixed height, centered, responsive */}
        {page.imageUrl && (
          <div 
            className="w-full md:w-11/12 h-32 md:h-40 relative mb-3 md:mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shrink-0 cursor-zoom-in hover:opacity-90 transition-opacity"
            onClick={() => openLightbox(page.imageUrl!)}
            title="Click to view full size"
          >
            <Image
              src={page.imageUrl}
              fill
              alt={`Page ${page.pageNumber} illustration`}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              onLoadingComplete={(e) => handleImageLoad(page.pageNumber, e)}
            />
          </div>
        )}

        {/* Page Text - matching your felu.io style */}
        {page.content && page.content.trim() && (
          <div 
            className="flex-1 min-h-0 overflow-y-auto pr-2 custom-scrollbar"
            onMouseUp={handleTextSelection}
          >
            {page.content.split('\n\n').filter(p => p.trim()).map((paragraph, pIndex) => (
              <p key={pIndex} className="mt-4 md:mt-5 text-base md:text-xl text-white/90 leading-relaxed">
                {paragraph.split(/\s+/).map((word, wIndex) => {
                  const cleanWord = word.replace(/[.,!?;:"""''。，！？；：、]/g, '');
                  const isInDeck = cleanWord ? wordStatuses[cleanWord] : false;
                  const hasCleanWord = !!cleanWord;

                  return (
                    <span
                      key={wIndex}
                      onClick={() => hasCleanWord && handleWordClick(word)}
                      className={`
                        inline-block cursor-pointer transition-all mr-1
                        ${isInDeck
                          ? 'bg-purple-600/40 border-b-2 border-purple-400 font-medium'
                          : hasCleanWord ? 'hover:bg-white/10 hover:border-b hover:border-white/30' : ''
                        }
                        ${hasCleanWord ? 'hover:scale-105' : 'cursor-default'}
                      `}
                      title={isInDeck ? 'In your deck' : hasCleanWord ? 'Click to learn' : ''}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-gray-900 to-black relative">
      {/* Close button - Top right, responsive */}
      <button
        onClick={props.onClose}
        className="absolute top-2 md:top-4 right-2 md:right-4 p-2 hover:bg-white/10 rounded-lg transition-colors z-40"
        title="Close (Esc)"
      >
        <BiX className="text-2xl md:text-3xl text-white/60 hover:text-white" />
      </button>

      {/* Progress Bar - Clean, minimal, responsive */}
      <div className="flex flex-col items-center pt-4 md:pt-8 pb-3 md:pb-4 px-4">
        <div className="w-full md:w-3/6 bg-white/10 h-1.5 rounded-full">
          <div 
            style={{ width: `${progress}%` }}
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
          />
        </div>
      </div>

      {/* Audio Player - Dark theme, responsive */}
      {props.audioUrl && (
        <div className="flex flex-col md:flex-row items-center justify-center py-4 gap-3 md:gap-4 px-4">
          <audio
            ref={audioRef}
            src={props.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
            className="hidden"
          />
          
          <button
            onClick={toggleAudio}
            className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-colors shadow-xl"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <BiPause className="text-2xl" /> : <BiPlay className="text-2xl" />}
          </button>
          
          <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 md:px-6 py-2 shadow-xl border border-white/10 w-full md:w-auto max-w-sm">
            <span className="text-xs md:text-sm font-medium text-white/70">
              {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
            </span>
            <div className="flex-1 md:w-64 bg-white/10 h-2 rounded-full relative">
              <div 
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                className="bg-purple-500 h-2 rounded-full transition-all"
              />
            </div>
            <span className="text-xs md:text-sm font-medium text-white/70">
              {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
            </span>
          </div>
          
          <span className="hidden md:inline text-sm text-white/40 italic">
            {isPlaying ? 'Playing...' : 'Click play to listen'}
          </span>
        </div>
      )}

      {/* Book Layout - Responsive: Single page on mobile, two pages on desktop */}
      <div className="w-full px-4 md:px-8 lg:px-24 pb-12 pt-8">
        <div className="flex gap-0 md:gap-12" style={{ height: isMobile ? '600px' : '800px' }}>
          {/* Mobile: Single Page / Desktop: Left Page */}
          <div className={`${isMobile ? 'w-full' : 'flex-1'} flex flex-col justify-start overflow-hidden`}>
            <div className="h-full overflow-hidden">
              {renderPageContent(leftPage)}
            </div>
          </div>

          {/* Desktop Only: Right Page */}
          {!isMobile && (
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-hidden">
                {renderPageContent(rightPage)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons - Dark theme, responsive */}
      <div className="flex w-full items-center justify-center pb-8 gap-4 px-4">
        <button
          type="button"
          onClick={moveBackward}
          disabled={currentLocation <= 0}
          className="text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white hover:border-purple-500 focus:ring-4 focus:outline-none focus:ring-purple-500/30 font-medium rounded-lg text-sm p-3 md:p-2.5 text-center inline-flex items-center disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <span className="text-white/60 text-sm">
          Page {currentLocation + 1}{!isMobile && rightPage ? `-${currentLocation + 2}` : ''} of {props.pages.length}
        </span>

        <button
          type="button"
          onClick={moveForward}
          disabled={isMobile ? currentLocation + 1 >= props.pages.length : currentLocation + 2 >= props.pages.length}
          className="text-purple-400 border border-purple-500/30 hover:bg-purple-600 hover:text-white hover:border-purple-500 focus:ring-4 focus:outline-none focus:ring-purple-500/30 font-medium rounded-lg text-sm p-3 md:p-2.5 text-center inline-flex items-center disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>

      {/* Elegant Audio Prompt - Bottom of screen, responsive */}
      {showAudioPrompt && !generatingFullAudio && (
        <div className="fixed bottom-4 md:bottom-8 left-4 right-4 md:left-1/2 md:right-auto md:transform md:-translate-x-1/2 z-50 animate-slide-up">
          <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl md:rounded-full shadow-2xl px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 max-w-md border border-purple-400/30">
            <div className="flex items-center gap-3 flex-1 w-full md:w-auto">
              <BiPlay className="text-2xl shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold">Continue listening?</p>
                <p className="text-xs text-purple-100">Generate audio for the rest</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={generateFullAudio}
                className="flex-1 md:flex-initial bg-white text-purple-600 hover:bg-purple-50 px-4 py-2 rounded-full text-sm font-semibold transition-colors"
              >
                Generate
              </button>
              
              <button
                onClick={() => setShowAudioPrompt(false)}
                className="text-purple-100 hover:text-white transition-colors p-2"
                title="Dismiss"
              >
                <BiX className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generating Full Audio Indicator */}
      {generatingFullAudio && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-purple-600 text-white rounded-full shadow-2xl px-6 py-4 flex items-center gap-3">
            <BiLoader className="text-xl animate-spin" />
            <span className="text-sm font-medium">Generating full audio...</span>
          </div>
        </div>
      )}

      {/* Translation Popup */}
      {translationPopup && (
        <div
          className="fixed z-[55] bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-500 mb-1">Selected:</p>
                <p className="text-base text-gray-900 font-medium">{selectedText}</p>
              </div>
              <button
                onClick={closeTranslationPopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <BiX className="text-xl" />
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-semibold text-purple-600 mb-1">Translation:</p>
              {loadingTranslation ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <BiLoader className="animate-spin" />
                  <span className="text-sm">Translating...</span>
                </div>
              ) : (
                <p className="text-base text-gray-700">{translation}</p>
              )}
            </div>
          </div>
          
          {/* Arrow pointing down to selected text */}
          <div 
            className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full"
            style={{ width: 0, height: 0 }}
          >
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[70]"
            title="Close (Esc)"
          >
            <BiX className="text-4xl" />
          </button>
          
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={lightboxImage}
              fill
              alt="Full size image"
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Flashcard Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-gradient-to-b from-gray-900 to-black border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <BiX className="text-2xl text-white" />
          </button>

          {loadingFlashcard && (
            <div className="flex flex-col items-center justify-center h-96">
              <BiLoader className="text-5xl animate-spin text-purple-500 mb-4" />
              <p className="text-white/60">Loading flashcard...</p>
            </div>
          )}

          {!loadingFlashcard && flashcardData && (
            <div className="mt-12">
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-2">
                  {flashcardData.displayText}
                </h2>
                {flashcardData.pinyin && (
                  <p className="text-lg text-white/60 italic">{flashcardData.pinyin}</p>
                )}
                {flashcardData.phoneticTranscription && (
                  <p className="text-lg text-white/60 italic">{flashcardData.phoneticTranscription}</p>
                )}
              </div>

              {flashcardData.pronunciationUrl && (
                <button
                  onClick={() => {
                    const audio = new Audio(flashcardData.pronunciationUrl!);
                    audio.play();
                  }}
                  className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                  <span>Play Pronunciation</span>
                </button>
              )}

              {flashcardData.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={flashcardData.imageUrl}
                    width={450}
                    height={300}
                    alt={flashcardData.displayText || 'Word image'}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {flashcardData.englishTranslation && (
                <div className="mb-6 bg-black/40 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white/60 mb-2">Translation</h3>
                  <p className="text-xl text-white">{flashcardData.englishTranslation}</p>
                </div>
              )}

              {flashcardData.mnemonic && (
                <div className="mb-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">💡 Memory Tip</h3>
                  <p className="text-white/80">{flashcardData.mnemonic}</p>
                </div>
              )}

              {flashcardData.funFact && (
                <div className="mb-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">✨ Fun Fact</h3>
                  <p className="text-white/80 text-sm italic">{flashcardData.funFact}</p>
                </div>
              )}

              <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent pt-6 pb-4">
                {wordInDeck ? (
                  <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 flex items-center justify-center gap-2">
                    <BiCheckCircle className="text-2xl text-green-400" />
                    <span className="text-green-300 font-semibold">Already in your deck!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddWordToDeck}
                    className="w-full bg-purple-600 hover:bg-purple-700 px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 text-lg"
                  >
                    <BiPlusCircle className="text-2xl" />
                    Add to Deck
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
