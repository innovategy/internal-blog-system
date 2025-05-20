# Internal Blog System

A modern, feature-rich internal blogging platform built with Next.js and Prisma, designed for organizations to facilitate knowledge sharing and team communication.

## Architecture

### Tech Stack

- **Frontend**: Next.js 14 (App Router) with React and TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Database**: SQLite (via Prisma ORM) - easily changeable to PostgreSQL, MySQL, etc.
- **Authentication**: NextAuth.js with credential provider
- **State Management**: React hooks and context

### Project Structure

```
internal-blog-system/
├── prisma/               # Database schema and migrations
├── public/               # Static assets
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard and feed pages
│   │   └── auth/         # Authentication pages
│   ├── components/       # React components
│   │   ├── blog/         # Blog-related components
│   │   └── ui/           # Reusable UI components
│   ├── lib/              # Utility functions and shared logic
│   └── generated/        # Generated Prisma client
└── tailwind.config.js    # Tailwind configuration
```

## Implementation Details

### Database Schema

The system is designed with multi-tenancy in mind, using a relational model with the following key entities:

- **Organizations**: Top-level entity for multi-tenant support
- **Users**: Members of organizations with authentication details
- **Posts**: Blog entries with content, author information, and metadata
- **Comments**: Hierarchical comment system supporting replies
- **Tags**: For categorization of posts
- **Reactions**: Emoji reactions for posts

### Authentication

Implemented using NextAuth.js with a credentials provider that validates against users stored in the database. Password hashing is done with bcrypt for security.

### API Design

API routes follow REST principles with endpoints for posts, comments, and reactions. Each route handles authentication, validation, and proper error handling.

## Features

- **User Authentication**: Secure login system with session management
- **Blog Post Creation**: Rich text editor for creating formatted blog posts
- **Comments & Replies**: Nested comment support for discussions
- **Markdown Support**: Write posts in Markdown for easy formatting
- **Tagging System**: Categorize posts with custom tags
- **Reactions**: Express feedback with emoji reactions
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Shortcuts**: Productivity shortcuts for power users:
  - ⌘/Ctrl+N: Create new post
  - Escape: Close/cancel current form
  - R: Refresh feed

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd internal-blog-system
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="your-secret-key"
```

4. Set up the database

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

5. Run the development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to access the application.

### Default Credentials

After seeding the database, you can log in with:

- Email: `admin@example.com`
- Password: `password`

## Current Status

### MVP Implementation Progress

This project was developed based on a specific scope for an internal blog system that would serve as the foundation for a future SaaS product. Below is the status of the implementation against the original requirements:

| Feature | Status | Notes |
|---------|--------|-------|
| Login screen | ✅ Complete | Email/username + password authentication |
| Welcome screen | ✅ Complete | Greeting and access to feed |
| Blog-style feed | ✅ Complete | Clean, minimal design with posts |
| Markdown posts | ✅ Complete | Full markdown support |
| Post tagging | ✅ Complete | Tag creation and association |
| Emoji reactions | ✅ Complete | React to posts with emojis |
| Comments | ✅ Complete | Full comment functionality |
| Reply support | ✅ Complete | Nested replies to comments |
| Markdown editor | ✅ Complete | Simple post creation interface |
| Keyboard shortcuts | ✅ Complete | Shortcuts for common actions |

All core MVP features have been implemented according to the original scope. The system is currently designed as a single-tenant prototype but was built with future multi-tenant architecture in mind.

### SaaS Transformation Roadmap

To transform this internal blog system into a full SaaS product, the following components need to be developed:

#### Multi-tenancy & User Management

- **Tenant Isolation**: Complete separation of data between different organizations
- **User Provisioning**: Self-service user creation and management
- **Role-Based Access Control**: Define and enforce permissions for different user roles
- **Team Structures**: Support for organizing users into teams and groups

#### Billing & Subscription

- **Subscription Plans**: Different tiers with varying features and limits
- **Payment Processing**: Integration with payment providers (Stripe, PayPal)
- **Usage Metering**: Track and bill based on usage metrics
- **Invoicing**: Generate and manage invoices

#### Onboarding & Customer Experience

- **Signup Flow**: Self-service account creation
- **Onboarding Wizard**: Guide new users through setup
- **Documentation**: Help center and user guides
- **Customer Support**: Ticketing or chat support system

#### Additional SaaS Features

- **Analytics Dashboard**: Usage statistics for administrators
- **Audit Logs**: Track important system events
- **API Access**: Allow integration with other systems
- **Backup & Recovery**: Data protection mechanisms
- **White-labeling**: Customization options for tenants

## Future Roadmap

### Short-term

- **Search Functionality**: Full-text search for posts and comments
- **Rich Media Support**: Upload and embed images and videos in posts
- **Notifications**: Real-time notifications for new posts, comments, and mentions
- **User Profiles**: Enhanced user profiles with activity history

### Medium-term

- **Teams & Groups**: Organization of users into teams with specific access controls
- **Content Moderation**: Tools for admins to moderate content
- **Analytics**: Insights on post engagement and user activity
- **API Tokens**: External API access via token-based authentication

### Long-term

- **Real-time Collaboration**: Google Docs-like simultaneous editing
- **Advanced Permissions**: Fine-grained access controls for content
- **Integration APIs**: Connect with other tools like Slack, Teams, etc.
- **Mobile Applications**: Native mobile apps for iOS and Android

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Stay in touch

- Author - [Sina Ghazi](https://www.upwork.com/freelancers/sinaghazi)

## License
2025 by Innovategy Oy is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Support

For support, please open an issue in the GitHub repository or contact the development team.