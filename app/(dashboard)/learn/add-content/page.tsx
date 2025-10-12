'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BiArrowBack, BiPlay, BiLoader, BiX, BiPlusCircle, BiCheckCircle, BiBookmark } from 'react-icons/bi';
import { checkWordsInDeck, addWordFromContent, getOrCreateWordFlashcard, isWordInUserDeck, checkWordImageReady, analyzeTextContent, saveContentToLibrary, getSavedContent } from '@/app/_services/content';
import { getUser, getUserLanguage } from '@/app/_services/user';
import Image from 'next/image';
import type { Word } from '@prisma/client';

interface WordStatus {
  word: string;
  inDeck: boolean;
  cleanWord: string; // word without punctuation
}

interface TextAnalysis {
  summary: string;
  sentiment: string;
  topic: string;
  difficulty: string;
}

interface SavedContent {
  id: string;
  title: string;
  text: string;
  language: string;
  summary: string | null;
  sentiment: string | null;
  topic: string | null;
  difficulty: string | null;
  audioUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function AddContentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  
  const [text, setText] = useState('');
  const [language, setLanguage] = useState('chinese');
  const [processing, setProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [userId, setUserId] = useState('');
  const [loadingLanguage, setLoadingLanguage] = useState(true);
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysis | null>(null);
  const [savedContentId, setSavedContentId] = useState<string | null>(null);
  const [contentSaved, setContentSaved] = useState(false);
  const [loadingSavedContent, setLoadingSavedContent] = useState(false);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [flashcardData, setFlashcardData] = useState<Partial<Word> | null>(null);
  const [loadingFlashcard, setLoadingFlashcard] = useState(false);
  const [wordInDeck, setWordInDeck] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const imagePollingInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = await getUser();
      setUserId(user || '');
      
      // Get user's selected language
      const userLanguage = await getUserLanguage();
      if (userLanguage) {
        setLanguage(userLanguage.toLowerCase());
      }
      setLoadingLanguage(false);
    };
    fetchUserData();
  }, []);

  // Load saved content if ID is provided
  useEffect(() => {
    const loadSavedContent = async () => {
      if (!contentId) return;

      try {
        setLoadingSavedContent(true);
        const savedContent = await getSavedContent(contentId);
        
        if (savedContent) {
          setText(savedContent.text);
          setLanguage(savedContent.language);
          setSavedContentId(savedContent.id);
          
          // Set analysis if available
          if (savedContent.summary) {
            setTextAnalysis({
              summary: savedContent.summary,
              sentiment: savedContent.sentiment || '',
              topic: savedContent.topic || '',
              difficulty: savedContent.difficulty || '',
            });
          }
          
          // Set audio if available
          if (savedContent.audioUrl) {
            setAudioUrl(savedContent.audioUrl);
          }
          
          // Auto-process the saved content
          await processLoadedContent(savedContent);
        }
      } catch (error) {
        console.error('Error loading saved content:', error);
        alert('Failed to load saved content.');
      } finally {
        setLoadingSavedContent(false);
      }
    };

    if (contentId && userId) {
      loadSavedContent();
    }
  }, [contentId, userId]);

  const processLoadedContent = async (savedContent: SavedContent) => {
    try {
      // Split text into words
      const isCJK = ['chinese', 'japanese', 'korean'].includes(savedContent.language);
      const words = isCJK
        ? savedContent.text.split('').filter(char => char.trim())
        : savedContent.text.split(/\s+/).filter(word => word.trim());
      
      const cleanWords = words.map(word => ({
        word,
        cleanWord: word.replace(/[.,!?;:"""''。，！？；：、]/g, ''),
      }));

      // Check which words are in deck
      const statuses = await checkWordsInDeck(
        cleanWords.map(w => w.cleanWord),
        userId
      );

      const wordStatusesData: WordStatus[] = cleanWords.map((w, i) => ({
        word: w.word,
        cleanWord: w.cleanWord,
        inDeck: statuses[i] || false,
      }));

      setWordStatuses(wordStatusesData);
    } catch (error) {
      console.error('Error processing loaded content:', error);
    }
  };

  const processText = async () => {
    if (!text.trim()) return;
    
    setProcessing(true);
    try {
      // Analyze text content (summary, sentiment, topic, difficulty)
      const analysisPromise = analyzeTextContent(text, language);
      
      // Split text into words (handle CJK languages differently)
      const isCJK = ['chinese', 'japanese', 'korean'].includes(language);
      const words = isCJK
        ? text.split('').filter(char => char.trim()) // Character-based for CJK
        : text.split(/\s+/).filter(word => word.trim()); // Word-based for others
      
      // Clean words (remove punctuation for checking)
      const cleanWords = words.map(word => ({
        word,
        cleanWord: word.replace(/[.,!?;:"""''。，！？；：、]/g, ''),
      }));

      // Check which words are in the user's deck
      const statusesPromise = checkWordsInDeck(
        cleanWords.map(w => w.cleanWord),
        userId
      );

      // Generate audio using ElevenLabs
      const audioPromise = fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      // Wait for all operations in parallel
      const [analysis, statuses, audioResponse] = await Promise.all([
        analysisPromise,
        statusesPromise,
        audioPromise,
      ]);

      // Set text analysis
      if (analysis) {
        setTextAnalysis(analysis);
      }

      // Combine words with statuses
      const wordStatusesData: WordStatus[] = cleanWords.map((w, i) => ({
        word: w.word,
        cleanWord: w.cleanWord,
        inDeck: statuses[i] || false,
      }));

      setWordStatuses(wordStatusesData);

      // Handle audio response
      let finalAudioUrl = null;
      if (audioResponse.ok) {
        const data = await audioResponse.json();
        finalAudioUrl = data.audioUrl;
        setAudioUrl(finalAudioUrl);
      }

      // Save content to library
      try {
        const savedContent = await saveContentToLibrary(
          text,
          language,
          analysis,
          finalAudioUrl
        );
        setSavedContentId(savedContent.id);
        setContentSaved(true);
      } catch (error) {
        console.error('Error saving content to library:', error);
        // Don't alert - this is non-critical
      }
    } catch (error) {
      console.error('Error processing text:', error);
      alert('Failed to process text. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setAudioPlaying(true);
      audio.onended = () => setAudioPlaying(false);
      audio.play();
    }
  };

  const handleWordClick = async (wordStatus: WordStatus) => {
    if (!wordStatus.cleanWord) return;

    // Clear any existing polling
    if (imagePollingInterval.current) {
      clearInterval(imagePollingInterval.current);
      imagePollingInterval.current = null;
    }

    // Open sidebar and load flashcard
    setSelectedWord(wordStatus.cleanWord);
    setSidebarOpen(true);
    setLoadingFlashcard(true);
    setFlashcardData(null);
    setImageLoading(false);

    try {
      // Check if word is in user's deck
      const inDeck = await isWordInUserDeck(wordStatus.cleanWord);
      setWordInDeck(inDeck);

      // Get or generate flashcard data
      const card = await getOrCreateWordFlashcard(wordStatus.cleanWord, language);
      setFlashcardData(card);

      // If card has generationId but no imageUrl, start polling
      if (card && card.generationId && !card.imageUrl) {
        setImageLoading(true);
        startImagePolling(wordStatus.cleanWord);
      }
    } catch (error) {
      console.error('Error loading flashcard:', error);
      alert('Failed to load flashcard. Please try again.');
    } finally {
      setLoadingFlashcard(false);
    }
  };

  const startImagePolling = (word: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Poll for up to 30 seconds (30 * 1 second)

    imagePollingInterval.current = setInterval(async () => {
      attempts++;

      if (attempts >= maxAttempts) {
        // Stop polling after max attempts
        if (imagePollingInterval.current) {
          clearInterval(imagePollingInterval.current);
          imagePollingInterval.current = null;
        }
        setImageLoading(false);
        console.log('Image polling timeout - image may still be generating');
        return;
      }

      try {
        const imageUrl = await checkWordImageReady(word);
        
        if (imageUrl) {
          // Image is ready! Update flashcard data
          setFlashcardData(prev => prev ? { ...prev, imageUrl } : null);
          setImageLoading(false);
          
          // Stop polling
          if (imagePollingInterval.current) {
            clearInterval(imagePollingInterval.current);
            imagePollingInterval.current = null;
          }
        }
      } catch (error) {
        console.error('Error checking image status:', error);
      }
    }, 1000); // Check every second
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (imagePollingInterval.current) {
        clearInterval(imagePollingInterval.current);
      }
    };
  }, []);

  const handleAddWordToDeck = async () => {
    if (!selectedWord) return;

    try {
      await addWordFromContent(userId, selectedWord, language);
      setWordInDeck(true);
      
      // Update the word status locally
      setWordStatuses(prev =>
        prev.map(w =>
          w.cleanWord === selectedWord ? { ...w, inDeck: true } : w
        )
      );
    } catch (error) {
      console.error('Error adding word:', error);
      alert('Failed to add word. Please try again.');
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedWord('');
    setFlashcardData(null);
    setImageLoading(false);
    
    // Clear polling when closing
    if (imagePollingInterval.current) {
      clearInterval(imagePollingInterval.current);
      imagePollingInterval.current = null;
    }
  };

  const playSound = (url?: string | null) => {
    if (url) {
      const audio = new Audio(url);
      audio.play();
    }
  };

  if (loadingSavedContent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white/80">
        <div className="animate-pulse">
          <BiLoader className="text-5xl animate-spin text-purple-500 mb-4 mx-auto" />
          <p className="text-xl">Loading saved content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white/80 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <BiArrowBack className="text-2xl" />
            </button>
            <div>
              <h1 className="text-3xl font-bold">
                {savedContentId ? 'Saved Content' : 'Add Content'}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                {savedContentId 
                  ? 'Continue reading from your library'
                  : 'Paste text and click words to add them to your deck'
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/learn/library')}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <BiBookmark className="text-lg" />
            Library
          </button>
        </div>

        {/* Input Section */}
        {wordStatuses.length === 0 && (
          <div className="bg-black/40 rounded-lg p-6 mb-6">
            <label className="block text-sm font-semibold mb-2">
              Language {loadingLanguage && <span className="text-white/40 text-xs">(detecting...)</span>}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={loadingLanguage}
              className="w-full bg-black/60 rounded px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed capitalize"
            >
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="korean">Korean</option>
              <option value="greek">Greek</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="russian">Russian</option>
            </select>

            <label className="block text-sm font-semibold mb-2">
              Paste your text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text in your target language here..."
              className="w-full h-48 bg-black/60 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

            <button
              onClick={processText}
              disabled={processing || !text.trim()}
              className="mt-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition-colors w-full flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <BiLoader className="text-xl animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Text'
              )}
            </button>
          </div>
        )}

        {/* Interactive Text Display */}
        {wordStatuses.length > 0 && (
          <div className="space-y-6">
            {/* Text Analysis Summary */}
            {textAnalysis && (
              <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg p-6 border border-purple-500/30">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {textAnalysis.topic}
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1 bg-purple-600/40 rounded-full text-xs font-semibold">
                      {textAnalysis.sentiment}
                    </span>
                    <span className="px-3 py-1 bg-blue-600/40 rounded-full text-xs font-semibold">
                      {textAnalysis.difficulty}
                    </span>
                  </div>
                  <p className="text-white/80 text-base leading-relaxed">
                    {textAnalysis.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioUrl && (
              <div className="bg-black/40 rounded-lg p-4 flex items-center justify-between">
                <p className="text-sm">Listen to the text</p>
                <button
                  onClick={playAudio}
                  disabled={audioPlaying}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <BiPlay className="text-xl" />
                  {audioPlaying ? 'Playing...' : 'Play Audio'}
                </button>
              </div>
            )}

            {/* Legend */}
            <div className="bg-black/40 rounded-lg p-4">
              <p className="text-sm font-semibold mb-2">How to use:</p>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 border border-white/20 rounded"></div>
                  <span>Click any word to see its flashcard →</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600/30 border border-purple-500/50 rounded"></div>
                  <span>Purple = Already in your deck</span>
                </div>
              </div>
            </div>

            {/* Interactive Text */}
            <div className="bg-black/40 rounded-lg p-8">
              <div className="text-xl leading-relaxed flex flex-wrap gap-1">
                {wordStatuses.map((wordStatus, index) => (
                  <span
                    key={index}
                    onClick={() => handleWordClick(wordStatus)}
                    className={`
                      inline-block px-2 py-1 rounded cursor-pointer transition-all
                      ${wordStatus.inDeck
                        ? 'bg-purple-600/30 border border-purple-500/50'
                        : 'hover:bg-white/10 border border-transparent hover:border-white/20'
                      }
                      ${wordStatus.cleanWord ? 'hover:scale-105' : ''}
                      ${!wordStatus.cleanWord ? 'cursor-default' : ''}
                    `}
                    title={wordStatus.inDeck ? 'In your deck - Click to view' : 'Click to view flashcard'}
                  >
                    {wordStatus.word}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setWordStatuses([]);
                  setText('');
                  setAudioUrl(null);
                  setTextAnalysis(null);
                  setSavedContentId(null);
                  setContentSaved(false);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Add More Content
              </button>
              <button
                onClick={() => router.push('/learn/library')}
                className="flex-1 bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                View Library
              </button>
              <button
                onClick={() => router.push('/learn')}
                className="flex-1 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Go to Review
              </button>
            </div>

            {/* Saved indicator */}
            {contentSaved && (
              <div className="mt-4 bg-green-900/20 border border-green-500/30 rounded-lg p-3 flex items-center justify-center gap-2">
                <BiCheckCircle className="text-green-400" />
                <span className="text-green-300 text-sm">
                  Content saved to your library!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sliding Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-gradient-to-b from-gray-900 to-black border-l border-white/10 transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Close Button */}
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <BiX className="text-2xl text-white" />
          </button>

          {/* Loading State */}
          {loadingFlashcard && (
            <div className="flex flex-col items-center justify-center h-96">
              <BiLoader className="text-5xl animate-spin text-purple-500 mb-4" />
              <p className="text-white/60">Generating flashcard...</p>
            </div>
          )}

          {/* Flashcard Content */}
          {!loadingFlashcard && flashcardData && (
            <div className="mt-12">
              {/* Word Title */}
              <div className="mb-6">
                <h2 className="text-4xl font-bold text-white mb-2">
                  {flashcardData.displayText}
                </h2>
                {flashcardData.pinyin && (
                  <p className="text-lg text-white/60 italic">
                    {flashcardData.pinyin}
                  </p>
                )}
                {flashcardData.phoneticTranscription && (
                  <p className="text-lg text-white/60 italic">
                    {flashcardData.phoneticTranscription}
                  </p>
                )}
              </div>

              {/* Pronunciation */}
              {flashcardData.pronunciationUrl && (
                <button
                  onClick={() => playSound(flashcardData.pronunciationUrl)}
                  className="mb-6 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                >
                  <BiPlay className="text-xl" />
                  <span>Play Pronunciation</span>
                </button>
              )}

              {/* Image */}
              {flashcardData.imageUrl ? (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <Image
                    src={flashcardData.imageUrl}
                    width={450}
                    height={300}
                    alt={flashcardData.displayText || 'Word image'}
                    className="w-full h-auto"
                  />
                </div>
              ) : imageLoading ? (
                <div className="mb-6 rounded-lg overflow-hidden bg-black/40 border border-white/10 h-72 flex items-center justify-center">
                  <div className="text-center">
                    <BiLoader className="text-4xl animate-spin text-purple-500 mx-auto mb-2" />
                    <p className="text-white/60 text-sm">Generating image...</p>
                    <p className="text-white/40 text-xs mt-1">This may take a few seconds</p>
                  </div>
                </div>
              ) : flashcardData.generationId ? (
                <div className="mb-6 rounded-lg overflow-hidden bg-black/40 border border-white/10 h-72 flex items-center justify-center">
                  <div className="text-center text-white/60 text-sm">
                    <p>Image is being generated</p>
                    <p className="text-xs mt-1 text-white/40">Refresh to check if ready</p>
                  </div>
                </div>
              ) : null}

              {/* Translation */}
              {flashcardData.englishTranslation && (
                <div className="mb-6 bg-black/40 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white/60 mb-2">
                    Translation
                  </h3>
                  <p className="text-xl text-white">
                    {flashcardData.englishTranslation}
                  </p>
                </div>
              )}

              {/* Mnemonic */}
              {flashcardData.mnemonic && (
                <div className="mb-6 bg-purple-900/20 rounded-lg p-4 border border-purple-500/30">
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">
                    💡 Memory Tip
                  </h3>
                  <p className="text-white/80">{flashcardData.mnemonic}</p>
                </div>
              )}

              {/* Fun Fact */}
              {flashcardData.funFact && (
                <div className="mb-6 bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">
                    ✨ Fun Fact
                  </h3>
                  <p className="text-white/80 text-sm italic">
                    {flashcardData.funFact}
                  </p>
                </div>
              )}

              {/* Add to Deck Button */}
              <div className="sticky bottom-0 bg-gradient-to-t from-black via-black to-transparent pt-6 pb-4">
                {wordInDeck ? (
                  <div className="bg-green-600/20 border border-green-500/50 rounded-lg p-4 flex items-center justify-center gap-2">
                    <BiCheckCircle className="text-2xl text-green-400" />
                    <span className="text-green-300 font-semibold">
                      Already in your deck!
                    </span>
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

          {/* Error State */}
          {!loadingFlashcard && !flashcardData && selectedWord && (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-white/60 text-center">
                Failed to load flashcard for "{selectedWord}"
              </p>
              <button
                onClick={closeSidebar}
                className="mt-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
}

