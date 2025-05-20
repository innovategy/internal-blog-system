"use client";

import { useState, useEffect } from "react";

// Define proper types for API responses at module scope for reuse
interface ApiPostAuthor {
  id: string;
  name: string | null;
  username: string;
}

interface ApiReply {
  id: string;
  content: string;
  createdAt: string;
  author: ApiPostAuthor;
}

interface ApiComment {
  id: string;
  content: string;
  createdAt: string;
  author: ApiPostAuthor;
  replies: ApiReply[];
}

interface ApiPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: ApiPostAuthor;
  tags: Array<{ id: string; name: string }>;
  reactions: Array<{ emoji: string; userId: string }>;
  comments: ApiComment[];
}
import PostCard from "@/components/blog/PostCard";
import CommentSection from "@/components/blog/CommentSection";
import NewPostForm from "@/components/blog/NewPostForm";

// Define types for our blog data model
type Author = {
  id: string;
  name?: string | null;
  username: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: Date | string;
  author: Author;
  replies: Comment[];
};

type Post = {
  id: string;
  title: string;
  content: string;
  createdAt: Date | string;
  author: Author;
  tags: { id: string; name: string }[];
  reactions: { emoji: string; userId: string }[];
  comments: Comment[];
};

export default function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  
  // Fetch posts from API
  useEffect(() => {
    async function loadPosts() {
      try {
        setIsLoading(true);
        setError(""); // Reset any previous errors
        
        const response = await fetch('/api/posts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Using the types defined at module scope
        
        // Type-safe post mapping with proper types
        const typedPosts: Post[] = data.posts.map((post: ApiPost) => ({
          id: post.id,
          title: post.title,
          content: post.content,
          createdAt: new Date(post.createdAt),
          author: {
            id: post.author.id,
            name: post.author.name,
            username: post.author.username,
          },
          tags: post.tags,
          reactions: post.reactions,
          comments: post.comments.map((comment: ApiComment) => ({
            id: comment.id,
            content: comment.content,
            createdAt: new Date(comment.createdAt),
            author: {
              id: comment.author.id,
              name: comment.author.name,
              username: comment.author.username,
            },
            replies: comment.replies.map((reply: ApiReply) => ({
              id: reply.id,
              content: reply.content,
              createdAt: new Date(reply.createdAt),
              author: {
                id: reply.author.id,
                name: reply.author.name,
                username: reply.author.username,
              },
              replies: [],
            })),
          })),
        }));
        setPosts(typedPosts);
      } catch (err) {
        console.error('Failed to load posts:', err);
        setError('Failed to load posts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPosts();
  }, []);
  
  // Function to handle adding reactions to posts
  const handleReaction = async (postId: string, emoji: string) => {
    try {
      const response = await fetch('/api/posts/reactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, emoji }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add reaction: ${response.statusText}`);
      }
      
      // Optimistic update - toggle the reaction instantly in UI
      setPosts(posts.map(post => {
        if (post.id === postId) {
          // Check if user already reacted with this emoji
          const userReacted = post.reactions.some(r => r.emoji === emoji);
          
          if (userReacted) {
            // Remove the reaction
            return {
              ...post,
              reactions: post.reactions.filter(r => !(r.emoji === emoji)),
            };
          } else {
            // Add the reaction
            return {
              ...post,
              reactions: [...post.reactions, { emoji, userId: 'currentuser' }],
            };
          }
        }
        return post;
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to add reaction');
    }
  };
  
  // Function to handle adding comments to posts
  const handleAddComment = async (postId: string, content: string, parentId?: string) => {
    try {
      const response = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, content, parentId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to add comment: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Convert API response to our Comment type
      const newComment: Comment = {
        id: result.comment.id,
        content: result.comment.content,
        createdAt: new Date(result.comment.createdAt), // Convert to Date
        author: result.comment.author,
        replies: [], // Initialize with empty array
      };
      
      // Update the posts with the new comment
      setPosts(posts.map(post => {
        if (post.id === postId) {
          if (!parentId) {
            // Add as a top-level comment
            return {
              ...post,
              comments: [...post.comments, newComment],
            };
          } else {
            // Add as a reply to existing comment
            return {
              ...post,
              comments: post.comments.map(comment => {
                if (comment.id === parentId) {
                  return {
                    ...comment,
                    replies: [...(comment.replies || []), newComment],
                  };
                }
                return comment;
              }),
            };
          }
        }
        return post;
      }));
    } catch (err) {
      console.error(err);
      setError('Failed to add comment');
    }
  };
  
  // Function to handle creating new posts
  const handleCreatePost = async (data: { title: string; content: string; tags: string[] }) => {
    try {
      // Log the data we're sending to the API
      console.log('Creating post with data:', { 
        title: data.title,
        contentLength: data.content.length,
        tags: data.tags 
      });
      
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('Post creation response status:', response.status, response.statusText);
      
      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = '';
        try {
          const errorData = await response.json();
          console.error('API error response:', errorData);
          errorDetails = JSON.stringify(errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          // Try to get text instead
          try {
            errorDetails = await response.text();
            console.error('API error text:', errorDetails);
          } catch (textError) {
            console.error('Could not get error text:', textError);
          }
        }
        
        throw new Error(`Failed to create post: ${response.statusText} ${errorDetails ? `- ${errorDetails}` : ''}`);
      }
      
      const result = await response.json();
      console.log('Post created successfully:', result);
      
      // Add the new post to the posts list
      setPosts([result.post, ...posts]);
      setShowNewPostForm(false);
    } catch (err) {
      console.error('Error in handleCreatePost:', err);
      setError('Failed to create post. Check console for details.');
      return Promise.reject(err);
    }
  };
  
  // Show a visual feedback for keyboard shortcuts
  const [shortcutVisible, setShortcutVisible] = useState(false);
  const [shortcutMessage, setShortcutMessage] = useState("");

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Skip shortcuts if focus is on input elements
      if (
        event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLButtonElement
      ) {
        return;
      }

      // Check if the key is pressed outside of input/textarea elements
      if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
      }
      
      // Handle Command/Ctrl + N for new post
      if ((event.metaKey || event.ctrlKey) && event.key === 'n') {
        event.preventDefault();
        setShowNewPostForm(true);
        setShortcutMessage("New Post (⌘/Ctrl + N)");
        setShortcutVisible(true);
        setTimeout(() => setShortcutVisible(false), 1500);
      }
      
      // Handle Escape key for closing forms
      else if (event.key === 'Escape') {
        event.preventDefault();
        if (showNewPostForm) {
          setShowNewPostForm(false);
          setShortcutMessage("Form Closed (Esc)");
        } else if (selectedPost) {
          setSelectedPost(null);
          setShortcutMessage("Post Closed (Esc)");
        } else if (activeComment) {
          setActiveComment(null);
          setShortcutMessage("Comment Deselected (Esc)");
        } else {
          return; // Don't show the indicator if nothing was closed
        }
        setShortcutVisible(true);
        setTimeout(() => setShortcutVisible(false), 1500);
      }
      
      // Handle R key for refresh
      else if (event.key === 'r' || event.key === 'R') {
        event.preventDefault();
        // Reload posts
        setIsLoading(true);
        setError("");
        setShortcutMessage("Refreshing Feed (R)");
        setShortcutVisible(true);
        setTimeout(() => setShortcutVisible(false), 1500);
        
        fetch('/api/posts')
          .then(response => response.json())
          .then(data => {
            // Use the same API types defined earlier
            const typedPosts: Post[] = data.posts.map((post: ApiPost) => ({
              id: post.id,
              title: post.title,
              content: post.content,
              createdAt: new Date(post.createdAt),
              author: {
                id: post.author.id,
                name: post.author.name,
                username: post.author.username,
              },
              tags: post.tags,
              reactions: post.reactions,
              comments: post.comments.map((comment: ApiComment) => ({
                id: comment.id,
                content: comment.content,
                createdAt: new Date(comment.createdAt),
                author: {
                  id: comment.author.id,
                  name: comment.author.name,
                  username: comment.author.username,
                },
                replies: comment.replies.map((reply: ApiReply) => ({
                  id: reply.id,
                  content: reply.content,
                  createdAt: new Date(reply.createdAt),
                  author: {
                    id: reply.author.id,
                    name: reply.author.name,
                    username: reply.author.username,
                  },
                  replies: [],
                })),
              })),
            }));
            setPosts(typedPosts);
            setShortcutVisible(true);
            setTimeout(() => setShortcutVisible(false), 1500);
          })
          .catch(err => {
            console.error('Failed to load posts:', err);
            setError('Failed to load posts. Please try again.');
          })
          .finally(() => setIsLoading(false));
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showNewPostForm, selectedPost, activeComment]);

  return (
    <div className="container mx-auto px-4 py-8 relative">  
      {/* Shortcut indicator - appears briefly when a keyboard shortcut is used */}
      {shortcutVisible && (
        <div className="fixed bottom-6 right-6 bg-black bg-opacity-80 text-white py-2 px-4 rounded-lg shadow-lg z-50 transition-opacity duration-300">
          <div className="text-sm font-medium">{shortcutMessage}</div>
        </div>
      )}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Feed</h1>
        <div className="flex items-center space-x-2">
          <div className="relative group">
            <button 
              className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm border border-gray-300 rounded flex items-center" 
              title="Keyboard Shortcuts"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Shortcuts
            </button>
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg p-3 z-10 hidden group-hover:block">
              <h3 className="font-semibold text-sm mb-2 pb-1 border-b border-gray-200">Keyboard Shortcuts</h3>
              <ul className="text-xs space-y-2">
                <li className="flex justify-between">
                  <span className="font-medium">⌘/Ctrl + N</span>
                  <span className="text-gray-600">New Post</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">Esc</span>
                  <span className="text-gray-600">Close/Cancel</span>
                </li>
                <li className="flex justify-between">
                  <span className="font-medium">R</span>
                  <span className="text-gray-600">Refresh Feed</span>
                </li>
              </ul>
            </div>
          </div>
          <button
            onClick={() => setShowNewPostForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            New Post
          </button>
        </div>
      </div>
      
      {/* Loading and error states */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* New post form */}
      {showNewPostForm && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Create a New Post</h2>
          <NewPostForm onSubmit={handleCreatePost} onCancel={() => setShowNewPostForm(false)} />
        </div>
      )}
      
      {/* Post list */}
      {!isLoading && (
        <div className="space-y-8">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.id}
                post={post}
                onReaction={(emoji) => handleReaction(post.id, emoji)}
                onComment={(content) => handleAddComment(post.id, content)}
                onSelectComment={(commentId) => setActiveComment(commentId)}
                activeComment={activeComment}
                isExpanded={selectedPost === post.id}
                onToggleExpand={() => {
                  setSelectedPost(selectedPost === post.id ? null : post.id);
                }}
              >
                {selectedPost === post.id && (
                  <CommentSection 
                    comments={post.comments} 
                    onAddComment={(content, parentId) => handleAddComment(post.id, content, parentId)}
                    activeComment={activeComment}
                    onSelectComment={(commentId) => setActiveComment(commentId)}
                  />
                )}
              </PostCard>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No posts yet. Be the first to share something!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}