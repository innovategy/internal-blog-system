import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDistanceToNow } from "date-fns";

type PostCardProps = {
  post: {
    id: string;
    title: string;
    content: string;
    createdAt: Date | string;
    author: {
      id: string;
      name?: string | null;
      username: string;
    };
    tags: { id: string; name: string }[];
    reactions: { emoji: string; userId: string }[];
    comments: any[]; // Using any[] here for simplicity with nested comments
  };
  onReaction: (emoji: string) => void;
  onComment: (content: string) => void;
  onSelectComment?: (commentId: string | null) => void;
  activeComment?: string | null;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  children?: React.ReactNode;
};

const EMOJI_OPTIONS = ["👍", "❤️", "🎉", "😂", "🤔", "👀"];

export default function PostCard({ 
  post, 
  onReaction, 
  onComment, 
  onSelectComment,
  activeComment,
  isExpanded,
  onToggleExpand,
  children 
}: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  
  const handleReaction = (emoji: string) => {
    onReaction(emoji);
  };
  
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText("");
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
      <div className="p-5">
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="mr-2">Posted by {post.author.name || post.author.username}</span>
          <span>{timeAgo}</span>
        </div>
        
        {/* Markdown Content */}
        <div className="prose max-w-none mb-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-3 mt-4">
          {/* Reactions */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {post.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {Array.from(new Set(post.reactions.map((r) => r.emoji))).map((emoji) => {
                  const count = post.reactions.filter((r) => r.emoji === emoji).length;
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200"
                    >
                      <span className="mr-1">{emoji}</span> {count}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="flex ml-auto gap-1">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          
          {/* Comments count + button */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={onToggleExpand}
              className="text-sm text-gray-700 hover:text-blue-600 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
            </button>

            <button
              onClick={onToggleExpand}
              className="text-sm text-blue-600 hover:underline"
            >
              {isExpanded ? "Hide comments" : "Show comments"}
            </button>
          </div>

          {/* Quick comment form */}
          {!isExpanded && (
            <form onSubmit={handleCommentSubmit} className="mt-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={`flex-1 px-3 py-1 border ${activeComment ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-300'} rounded text-sm`}
                  placeholder="Write a comment..."
                  onFocus={() => onSelectComment && onSelectComment(post.id)}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded disabled:opacity-50"
                >
                  Comment
                </button>
              </div>
            </form>
          )}

          {/* Comment section - when expanded */}
          {isExpanded && (
            <div>
              {children}
              
              {/* Show a "View all comments" button when there are many comments */}
              {post.comments.length > 3 && (
                <button 
                  onClick={() => onSelectComment && onSelectComment(null)}
                  className="text-sm text-blue-600 hover:underline mt-2 block"
                >
                  View all {post.comments.length} comments
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
