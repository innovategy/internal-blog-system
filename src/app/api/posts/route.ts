import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPosts } from "@/lib/posts";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const organizationId = session.user.organizationId;
    
    if (!organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 400 });
    }
    
    const posts = await getPosts(organizationId);
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const { title, content, tags } = await request.json();
    
    console.log('POST /api/posts - Request received:', { title, contentLength: content?.length, tags });
    
    // Validate request data
    if (!title || !content) {
      console.log('POST /api/posts - Validation failed: Missing title or content');
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }
    
    const organizationId = session.user.organizationId;
    const userId = session.user.id;
    console.log('POST /api/posts - User context:', { userId, organizationId });
    
    if (!organizationId || !userId) {
      console.error('POST /api/posts - Missing user or org ID');
      return NextResponse.json({ error: "Organization or user not found" }, { status: 400 });
    }
    
    // Validate tags is an array
    if (tags && !Array.isArray(tags)) {
      console.error('POST /api/posts - Tags is not an array:', tags);
      return NextResponse.json({ error: "Tags must be an array" }, { status: 400 });
    }
    
    console.log('POST /api/posts - Attempting to create post with tags:', tags);
    
    // Create the post
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: true,
        author: {
          connect: { id: userId }
        },
        organization: {
          connect: { id: organizationId }
        },
        // Instead of connectOrCreate, we'll handle tags differently
        // Since 'name' isn't a unique field in Tag model
        tags: tags && tags.length > 0 ? {
          create: tags.map((tag: string) => ({
            name: tag
          }))
        } : undefined
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        tags: true,
        comments: true,
        reactions: true,
      },
    });
    
    console.log('POST /api/posts - Post created successfully:', { id: post.id, title: post.title, tagsCount: post.tags.length });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    // Log more detailed error information
    if (error instanceof Error) {
      console.error("Error details:", error.message, error.stack);
    }
    return NextResponse.json({ error: "Failed to create post", details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
