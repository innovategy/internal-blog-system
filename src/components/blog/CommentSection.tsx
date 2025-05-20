import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name?: string;
    username: string;
  };
  replies: Comment[];
};

type CommentSectionProps = {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => void;
  activeComment?: string | null;
  onSelectComment?: (commentId: string | null) => void;
};

export default function CommentSection({ comments, onAddComment, activeComment, onSelectComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleSubmitReply = (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (replyContent.trim()) {
      onAddComment(replyContent, parentId);
      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const handleStartReply = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent("");
    
    // Notify parent component that this comment is active
    if (onSelectComment) {
      onSelectComment(commentId);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });
    const isActive = activeComment === comment.id;

    return (
      <div key={comment.id} className={`${isReply ? "ml-6 mt-2" : "mt-4"}`}>
        <div className={`p-3 rounded-md ${isActive ? "bg-blue-50 border border-blue-200" : "bg-gray-50"}`}>
          <div className="flex items-center mb-1">
            <span className="font-medium text-sm">
              {comment.author.name || comment.author.username}
            </span>
            <span className="text-xs text-gray-500 ml-2">{timeAgo}</span>
          </div>
          <p className="text-sm">{comment.content}</p>
          <button
            onClick={() => handleStartReply(comment.id)}
            className="text-xs text-blue-600 mt-1"
          >
            Reply
          </button>
        </div>

        {replyingTo === comment.id && (
          <form
            className="mt-2 ml-6"
            onSubmit={(e) => handleSubmitReply(e, comment.id)}
          >
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
              placeholder="Write a reply..."
              rows={2}
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="px-2 py-1 text-xs text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2 py-1 text-xs bg-blue-600 text-white rounded"
              >
                Reply
              </button>
            </div>
          </form>
        )}

        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">Comments</h3>

      <form onSubmit={handleSubmitComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          placeholder="Write a comment..."
          rows={3}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            Comment
          </button>
        </div>
      </form>

      <div>
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          comments.map((comment) => renderComment(comment))
        )}
      </div>
    </div>
  );
}
