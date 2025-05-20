import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addComment } from "@/lib/posts";

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { postId, content, parentId } = await request.json();
    
    if (!postId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const authorId = session.user.id;
    const comment = await addComment({ 
      postId, 
      authorId, 
      content,
      parentId: parentId || undefined
    });
    
    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
