import { PrismaClient } from '../src/generated/prisma';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create organization
  const organization = await prisma.organization.upsert({
    where: { id: 'clk1234567890' },
    update: {},
    create: {
      id: 'clk1234567890',
      name: 'Internal Company',
    },
  });

  console.log(`Created organization: ${organization.name}`);

  // Create admin user
  const hashedPassword = await hash('password123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      password: hashedPassword,
      organizationId: organization.id,
    },
  });

  console.log(`Created user: ${adminUser.email}`);

  // Create regular user
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      username: 'user',
      name: 'Regular User',
      password: await hash('password123', 12),
      organizationId: organization.id,
    },
  });

  console.log(`Created user: ${regularUser.email}`);

  // Create sample tags
  const announcementTag = await prisma.tag.upsert({
    where: { id: 'clk1234567891' },
    update: {},
    create: {
      id: 'clk1234567891',
      name: 'announcement',
    },
  });

  const welcomeTag = await prisma.tag.upsert({
    where: { id: 'clk1234567892' },
    update: {},
    create: {
      id: 'clk1234567892',
      name: 'welcome',
    },
  });

  const guideTag = await prisma.tag.upsert({
    where: { id: 'clk1234567893' },
    update: {},
    create: {
      id: 'clk1234567893',
      name: 'guide',
    },
  });

  console.log(`Created tags: ${announcementTag.name}, ${welcomeTag.name}, ${guideTag.name}`);

  // Create sample posts
  const welcomePost = await prisma.post.upsert({
    where: { id: 'clk1234567894' },
    update: {},
    create: {
      id: 'clk1234567894',
      title: 'Welcome to the Internal Blog System',
      content: '# Hello team!\n\nThis is our new internal blog system. It supports **markdown** formatting, so you can create rich posts with:\n\n- Bullet points\n- *Italic text*\n- [Links](https://example.com)\n- And more...\n\nLet me know what you think!',
      authorId: adminUser.id,
      organizationId: organization.id,
      tags: {
        connect: [
          { id: announcementTag.id },
          { id: welcomeTag.id },
        ],
      },
    },
  });

  console.log(`Created post: ${welcomePost.title}`);

  const guidePost = await prisma.post.upsert({
    where: { id: 'clk1234567895' },
    update: {},
    create: {
      id: 'clk1234567895',
      title: 'Using Markdown in Your Posts',
      content: '## Markdown Guide\n\nMarkdown makes it easy to format your posts. Here\'s a quick guide:\n\n```\n# Heading 1\n## Heading 2\n**Bold text**\n*Italic text*\n[Link](https://example.com)\n```\n\nYou can also add code blocks with syntax highlighting:\n\n```javascript\nfunction greet() {\n  console.log(\'Hello world!\');\n}\n```',
      authorId: adminUser.id,
      organizationId: organization.id,
      tags: {
        connect: [
          { id: guideTag.id },
        ],
      },
    },
  });

  console.log(`Created post: ${guidePost.title}`);

  // Create comments
  const welcomeComment = await prisma.comment.create({
    data: {
      content: 'This looks great! I\'m excited to start using it.',
      postId: welcomePost.id,
      authorId: regularUser.id,
    },
  });

  console.log(`Created comment by ${regularUser.username}`);

  // Create reactions
  await prisma.reaction.create({
    data: {
      emoji: '👍',
      postId: welcomePost.id,
      userId: adminUser.id,
    },
  });

  await prisma.reaction.create({
    data: {
      emoji: '❤️',
      postId: welcomePost.id,
      userId: regularUser.id,
    },
  });

  await prisma.reaction.create({
    data: {
      emoji: '👍',
      postId: guidePost.id,
      userId: regularUser.id,
    },
  });

  console.log(`Created reactions for posts`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
