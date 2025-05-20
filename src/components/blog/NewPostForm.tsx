"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type NewPostFormProps = {
  onSubmit: (data: { title: string; content: string; tags: string[] }) => Promise<void>;
  onCancel: () => void;
};

export default function NewPostForm({ onSubmit, onCancel }: NewPostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({ title, content, tags });
      // Form will be closed by parent component after successful submission
    } catch (error) {
      console.error("Failed to create post:", error);
      setIsSubmitting(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Add tag when pressing Enter in the tag input
    if (e.key === "Enter" && e.target === document.getElementById("tag-input")) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Create New Post</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Post title"
            required
          />
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`text-sm px-2 py-1 rounded ${
                  !isPreview ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`text-sm px-2 py-1 rounded ${
                  isPreview ? "bg-gray-200" : "hover:bg-gray-100"
                }`}
              >
                Preview
              </button>
            </div>
          </div>
          
          {isPreview ? (
            <div className="prose max-w-none border border-gray-300 rounded-md p-3 min-h-[200px] bg-gray-50">
              {content ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              ) : (
                <p className="text-gray-400 italic">Nothing to preview</p>
              )}
            </div>
          ) : (
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="Write your post using Markdown..."
              rows={10}
              required
            />
          )}
          <p className="text-xs text-gray-500 mt-1">
            Supports Markdown formatting
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex">
            <input
              type="text"
              id="tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      </form>
    </div>
  );
}
