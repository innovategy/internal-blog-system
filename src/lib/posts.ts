import { prisma } from "./prisma";

export async function getPosts(organizationId: string) {
  return prisma.post.findMany({
    where: {
      organizationId,
      published: true,
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
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
      },
      reactions: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getPost(id: string, organizationId: string) {
  return prisma.post.findFirst({
    where: {
      id,
      organizationId,
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
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                },
              },
            },
          },
        },
      },
      reactions: true,
    },
  });
}

export async function createPost({
  title,
  content,
  authorId,
  organizationId,
  tagIds = [],
}: {
  title: string;
  content: string;
  authorId: string;
  organizationId: string;
  tagIds?: string[];
}) {
  return prisma.post.create({
    data: {
      title,
      content,
      author: {
        connect: { id: authorId },
      },
      organization: {
        connect: { id: organizationId },
      },
      tags: {
        connect: tagIds.map(id => ({ id })),
      },
    },
  });
}

export async function addReaction({
  postId,
  userId,
  emoji,
}: {
  postId: string;
  userId: string;
  emoji: string;
}) {
  // Check if the reaction already exists
  const existingReaction = await prisma.reaction.findFirst({
    where: {
      postId,
      userId,
      emoji,
    },
  });

  if (existingReaction) {
    // If it exists, remove it (toggle functionality)
    return prisma.reaction.delete({
      where: {
        id: existingReaction.id,
      },
    });
  }

  // If it doesn't exist, create it
  return prisma.reaction.create({
    data: {
      emoji,
      post: {
        connect: { id: postId },
      },
      user: {
        connect: { id: userId },
      },
    },
  });
}

export async function addComment({
  postId,
  authorId,
  content,
  parentId,
}: {
  postId: string;
  authorId: string;
  content: string;
  parentId?: string;
}) {
  return prisma.comment.create({
    data: {
      content,
      post: {
        connect: { id: postId },
      },
      author: {
        connect: { id: authorId },
      },
      ...(parentId && {
        parent: {
          connect: { id: parentId },
        },
      }),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
}
