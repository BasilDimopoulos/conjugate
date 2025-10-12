'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BiArrowBack, BiBookOpen, BiTrash, BiTime, BiPlay } from 'react-icons/bi';
import { getUserContentLibrary, deleteSavedContent } from '@/app/_services/content';

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

export default function LibraryPage() {
  const router = useRouter();
  const [contents, setContents] = useState<SavedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const library = await getUserContentLibrary(50);
      setContents(library as SavedContent[]);
    } catch (error) {
      console.error('Error fetching library:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) {
      return;
    }

    try {
      setDeleting(contentId);
      await deleteSavedContent(contentId);
      setContents(prev => prev.filter(c => c.id !== contentId));
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Failed to delete content. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleLoadContent = (contentId: string) => {
    router.push(`/learn/add-content?id=${contentId}`);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white/80">
        <div className="animate-pulse">
          <p className="text-xl">Loading your library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white/80 px-4 py-8">
      <div className="max-w-6xl mx-auto">
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
              <h1 className="text-3xl font-bold">Content Library</h1>
              <p className="text-white/60 text-sm mt-1">
                {contents.length} saved {contents.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push('/learn/add-content')}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <BiBookOpen className="text-xl" />
            Add Content
          </button>
        </div>

        {/* Empty State */}
        {contents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BiBookOpen className="text-6xl text-white/20 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Content Yet</h2>
            <p className="text-white/60 mb-6 max-w-md">
              Start building your library by adding reading content. Your saved texts will appear here.
            </p>
            <button
              onClick={() => router.push('/learn/add-content')}
              className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Add Your First Content
            </button>
          </div>
        )}

        {/* Content Grid */}
        {contents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((content) => (
              <div
                key={content.id}
                className="bg-black/40 rounded-lg overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20"
              >
                {/* Card Content */}
                <div className="p-6">
                  {/* Topic & Language */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-white line-clamp-2">
                      {content.topic || content.title}
                    </h3>
                    <span className="px-2 py-1 bg-blue-600/40 rounded text-xs font-semibold capitalize shrink-0 ml-2">
                      {content.language}
                    </span>
                  </div>

                  {/* Badges */}
                  {(content.sentiment || content.difficulty) && (
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {content.sentiment && (
                        <span className="px-2 py-1 bg-purple-600/30 rounded-full text-xs">
                          {content.sentiment}
                        </span>
                      )}
                      {content.difficulty && (
                        <span className="px-2 py-1 bg-orange-600/30 rounded-full text-xs">
                          {content.difficulty}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  {content.summary && (
                    <p className="text-white/60 text-sm mb-4 line-clamp-3">
                      {content.summary}
                    </p>
                  )}

                  {/* Text Preview */}
                  <p className="text-white/40 text-sm italic mb-4 line-clamp-2">
                    "{content.text.substring(0, 100)}
                    {content.text.length > 100 ? '...' : ''}"
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-white/40 text-xs mb-4">
                    <BiTime />
                    <span>{formatDate(content.createdAt)}</span>
                    {content.audioUrl && (
                      <>
                        <span>•</span>
                        <BiPlay />
                        <span>Audio</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleLoadContent(content.id)}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => handleDelete(content.id)}
                      disabled={deleting === content.id}
                      className="p-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === content.id ? (
                        <BiLoader className="text-lg animate-spin" />
                      ) : (
                        <BiTrash className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

