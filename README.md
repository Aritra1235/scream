# TwitClone

A full-stack Twitter clone built with modern web technologies. Features real-time social media functionality including posts, replies, reposts, likes, follows, and media uploads.

## 🚀 Tech Stack

### Backend
- **Runtime**: Bun
- **Framework**: Elysia.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **File Storage**: AWS S3
- **Validation**: Valibot
- **Observability**: OpenTelemetry with Axiom
- **API Documentation**: OpenAPI

### Frontend
- **Framework**: Next.js 16
- **React**: Version 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Linting/Formatting**: Biome

## ✨ Features

- **User Authentication**: Secure signup/login with email verification
- **User Profiles**: Custom avatars, banners, bios, and display names
- **Posts & Interactions**:
  - Create and publish posts
  - Reply to posts (threaded conversations)
  - Repost (retweet) functionality
  - Like posts
  - Follow/unfollow users
- **Media Uploads**: Image uploads with AWS S3 integration
- **User Onboarding**: Guided setup flow for new users
- **Responsive Design**: Mobile-first responsive UI

## 🏗️ Architecture

```
twitclone/
├── twitclone-api/          # Backend API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── onboarding/  # User onboarding
│   │   │   └── imgUpload/   # Media uploads
│   │   ├── db/              # Database schema & queries
│   │   ├── utils/           # Utilities (Snowflake IDs, S3, etc.)
│   │   └── config/          # Configuration
│   └── package.json
└── twitclone-web/           # Frontend application
    ├── src/
    │   └── app/             # Next.js app router
    └── package.json
```

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Profile information, authentication data
- **Posts**: Tweets with support for replies and reposts
- **Media**: Image/video attachments for posts
- **Likes**: User-post like relationships
- **Follows**: User-user follow relationships
- **Sessions**: Authentication sessions

## 🚀 Getting Started

### Prerequisites
- **Bun** (for backend)
- **Node.js** 18+ (for frontend)
- **PostgreSQL** database
- **AWS S3** bucket (for media uploads)

### Backend Setup

1. **Navigate to the API directory:**
   ```bash
   cd twitclone-api
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env` file with:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/twitclone
   AWS_ACCESS_KEY_ID=your-aws-access-key
   AWS_SECRET_ACCESS_KEY=your-aws-secret-key
   AWS_S3_BUCKET=your-bucket-name
   AWS_REGION=your-aws-region
   AXIOM_TOKEN=your-axiom-token
   AXIOM_DATASET=your-dataset-name
   CDN_BASE_URL=https://your-cdn-url.com
   DEFAULT_AVATAR_OBJECT=default-avatar.png
   DEFAULT_BANNER_OBJECT=default-banner.png
   ```

4. **Set up the database:**
   ```bash
   bun run db:push    # Push schema to database
   bun run db:studio  # Open Drizzle Studio (optional)
   ```

5. **Start the development server:**
   ```bash
   bun run dev
   ```

   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to the web directory:**
   ```bash
   cd twitclone-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

   The frontend will be available at `http://localhost:3001`

## 🔧 Development

### Backend Scripts
- `bun run dev` - Start development server with hot reload
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:push` - Push schema changes to database
- `bun run db:studio` - Open Drizzle Studio for database management

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter
- `npm run format` - Format code with Biome

## 📁 Project Structure

### Backend (`twitclone-api/`)
- **`/src/modules/`** - Feature-based modules
  - `auth/` - Authentication with Better Auth
  - `onboarding/` - User onboarding flow
  - `imgUpload/` - Media upload functionality
- **`/src/db/`** - Database schema, queries, and client
- **`/src/utils/`** - Shared utilities (Snowflake ID generation, S3 client, etc.)
- **`/src/config/`** - Application configuration

### Frontend (`twitclone-web/`)
- **`/src/app/`** - Next.js 16 app router pages and layouts
- **`/public/`** - Static assets

## 🔐 Authentication

The application uses Better Auth for authentication with support for:
- Email/password authentication
- Email verification
- Session management
- OAuth providers (configurable)

## 📤 Media Uploads

Images are uploaded to AWS S3 with:
- Automatic resizing and optimization
- CDN integration for fast delivery
- Support for multiple image formats
- Secure pre-signed URLs for uploads

## 📊 Observability

Backend includes OpenTelemetry integration with Axiom for:
- Distributed tracing
- Performance monitoring
- Error tracking

## 🎯 API Documentation

The API includes OpenAPI documentation that can be accessed at the configured endpoint (typically `/docs` or `/swagger`).

## 📄 License

This project is open source and available under the MIT License. You are free to fork and modify this project for your own use.

---

Built with ❤️ using modern web technologies
