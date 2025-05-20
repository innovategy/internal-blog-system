import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { addReaction } from "@/lib/posts";

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { postId, emoji } = await request.json();
    
    if (!postId || !emoji) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    const userId = session.user.id;
    const reaction = await addReaction({ postId, userId, emoji });
    
    return NextResponse.json({ success: true, reaction });
  } catch (error) {
    console.error("Error adding reaction:", error);
    return NextResponse.json({ error: "Failed to add reaction" }, { status: 500 });
  }
}
