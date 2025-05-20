"use client";

import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6">Welcome to the Internal Blog</h1>
      
      <div className="text-center mb-8">
        <p className="text-xl mb-2">
          Hello there!
        </p>
        <p className="text-gray-600">
          This is your internal company blog space. Share updates, announcements, and collaborate with your team.
        </p>
      </div>
      
      <div className="text-center">
        <button 
          onClick={() => router.push("/dashboard/feed")} 
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Go to Feed
        </button>
      </div>
      
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Keyboard shortcuts:</p>
        <ul className="mt-2 inline-block text-left">
          <li><kbd className="px-1 py-0.5 border border-gray-300 rounded">N</kbd> - Create new post</li>
          <li><kbd className="px-1 py-0.5 border border-gray-300 rounded">F</kbd> - Go to feed</li>
          <li><kbd className="px-1 py-0.5 border border-gray-300 rounded">R</kbd> - Reply to selected post</li>
          <li><kbd className="px-1 py-0.5 border border-gray-300 rounded">Esc</kbd> - Close modals</li>
        </ul>
      </div>
    </div>
  );
}
