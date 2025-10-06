# HR Management System - Project Structure Tree

## 📋 Overview
This is a comprehensive HR Management System built with **NestJS** (backend) and **React + TypeScript** (frontend). The system supports multiple user roles and provides features for recruitment, candidate management, client management, contracts, interviews, and sales tracking.

---

## 🌳 Project Structure

```
hr-project-main/
│
├── 📁 back-end/                          # Backend Application
│   └── 📁 server/                        # NestJS Server
│       │
│       ├── 📁 src/                       # Source Code Directory
│       │   │
│       │   ├── 📁 activities/            # Activities Module
│       │   │   ├── activities.controller.ts    # Controller: Returns recent system activities
│       │   │   └── activities.module.ts        # Module registration
│       │   │
│       │   ├── 📁 admin/                 # Admin Module
│       │   │   ├── admin.controller.ts           # Admin dashboard endpoints
│       │   │   ├── admin.service.ts              # Admin business logic
│       │   │   ├── admin.module.ts               # Module registration
│       │   │   ├── admin-dashboard.controller.ts # Dashboard statistics
│       │   │   ├── admin-dashboard.service.ts    # Dashboard data aggregation
│       │   │   ├── admin-candidates.controller.ts # Candidate management
│       │   │   ├── admin-candidates.service.ts   # Candidate operations
│       │   │   ├── test-admin.controller.ts      # Testing endpoints
│       │   │   └── test-admin.module.ts          # Test module
│       │   │
│       │   ├── 📁 agora/                 # Agora Video Integration
│       │   │   ├── agora.service.ts              # Agora SDK integration
│       │   │   ├── agora.module.ts               # Module registration
│       │   │   ├── agora-settings.controller.ts  # Agora configuration management
│       │   │   ├── agora-settings.service.ts     # Settings CRUD operations
│       │   │   └── 📁 dto/                       # Data Transfer Objects
│       │   │       └── *.ts                      # Agora DTOs
│       │   │
│       │   ├── 📁 applicants/            # Applicants Module
│       │   │   ├── applicants.controller.ts      # Applicant CRUD endpoints
│       │   │   ├── applicant.controller.ts       # Single applicant operations
│       │   │   ├── applicants.service.ts         # Applicant business logic
│       │   │   └── applicants.module.ts          # Module registration
│       │   │
│       │   ├── 📁 auth/                  # Authentication & Authorization
│       │   │   ├── auth.controller.ts            # Login, register, logout endpoints
│       │   │   ├── auth.service.ts               # JWT token generation, validation
│       │   │   ├── auth.module.ts                # Module registration
│       │   │   ├── jwt.strategy.ts               # Passport JWT strategy
│       │   │   ├── jwt.guard.ts                  # JWT authentication guard
│       │   │   ├── roles.guard.ts                # Role-based authorization guard
│       │   │   ├── roles.decorator.ts            # @Roles() decorator
│       │   │   ├── public.decorator.ts           # @Public() decorator
│       │   │   ├── 📁 guards/                    # Additional guards
│       │   │   │   ├── jwt-auth.guard.ts         # JWT auth implementation
│       │   │   │   └── roles.guard.ts            # Role checking implementation
│       │   │   └── 📁 decorators/                # Custom decorators
│       │   │       └── *.ts                      # Decorator implementations
│       │   │
│       │   ├── 📁 client/                # Client Management Module
│       │   │   ├── client.controller.ts          # Client CRUD operations
│       │   │   ├── client.service.ts             # Client business logic
│       │   │   ├── client.module.ts              # Module registration
│       │   │   └── client.dto.ts                 # Client DTOs
│       │   │
│       │   ├── 📁 contracts/             # Contract Management
│       │   │   ├── contracts.controller.ts       # Contract endpoints
│       │   │   ├── contracts.service.ts          # Contract operations
│       │   │   ├── contracts.module.ts           # Module registration
│       │   │   └── 📁 dto/                       # Contract DTOs
│       │   │       └── *.ts
│       │   │
│       │   ├── 📁 feedback/              # Candidate Feedback System
│       │   │   ├── feedback.controller.ts        # Feedback endpoints
│       │   │   ├── feedback.service.ts           # Feedback management
│       │   │   └── feedback.module.ts            # Module registration
│       │   │
│       │   ├── 📁 hr/                    # HR Management Module
│       │   │   ├── hr.controller.ts              # HR operations endpoints
│       │   │   ├── hr.service.ts                 # HR business logic
│       │   │   ├── hr.module.ts                  # Module registration
│       │   │   └── 📁 dto/                       # HR DTOs
│       │   │       └── *.ts
│       │   │
│       │   ├── 📁 interviews/            # Interview Management
│       │   │   ├── interviews.controller.ts      # Interview scheduling, management
│       │   │   ├── interviews.service.ts         # Interview operations
│       │   │   ├── interviews.module.ts          # Module registration
│       │   │   └── *.ts                          # Additional interview files
│       │   │
│       │   ├── 📁 jobs/                  # Job Posting & Management
│       │   │   ├── jobs.controller.ts            # Job CRUD endpoints
│       │   │   ├── jobs.service.ts               # Job operations
│       │   │   └── jobs.module.ts                # Module registration
│       │   │
│       │   ├── 📁 prisma/                # Prisma ORM Integration
│       │   │   ├── prisma.service.ts             # Prisma client service
│       │   │   └── prisma.module.ts              # Module registration
│       │   │
│       │   ├── 📁 reports/               # Reports & Analytics
│       │   │   ├── reports.controller.ts         # Report generation endpoints
│       │   │   ├── reports.service.ts            # Report logic
│       │   │   └── *.ts                          # Additional report files
│       │   │
│       │   ├── 📁 sales/                 # Sales Management Module
│       │   │   ├── sales.controller.ts           # Sales operations
│       │   │   ├── sales.service.ts              # Sales business logic
│       │   │   ├── sales.module.ts               # Module registration
│       │   │   ├── sales-clients.controller.ts   # Sales client management
│       │   │   ├── sales-revenue.controller.ts   # Revenue tracking
│       │   │   └── *.ts                          # Additional sales files
│       │   │
│       │   ├── 📁 settings/              # System Settings
│       │   │   ├── settings.controller.ts        # Settings management
│       │   │   ├── settings.service.ts           # Settings operations
│       │   │   └── *.ts                          # Additional settings files
│       │   │
│       │   ├── 📁 timeline/              # Application Timeline Tracking
│       │   │   ├── timeline.controller.ts        # Timeline endpoints
│       │   │   ├── timeline.service.ts           # Timeline operations
│       │   │   └── timeline.module.ts            # Module registration
│       │   │
│       │   ├── 📁 users/                 # User Management
│       │   │   ├── users.controller.ts           # User CRUD endpoints
│       │   │   ├── users.service.ts              # User operations
│       │   │   ├── users.module.ts               # Module registration
│       │   │   └── *.ts                          # Additional user files
│       │   │
│       │   ├── app.module.ts             # Root application module
│       │   ├── app.controller.ts         # Root controller
│       │   ├── app.service.ts            # Root service
│       │   ├── main.ts                   # Application entry point
│       │   └── health.controller.ts      # Health check endpoint
│       │
│       ├── 📁 prisma/                    # Database Schema & Migrations
│       │   ├── schema.prisma             # Prisma database schema (40+ models)
│       │   ├── seed.ts                   # Database seeding script
│       │   └── 📁 migrations/            # Database migrations
│       │       ├── 📁 20250927000302_init/
│       │       │   └── migration.sql     # Initial migration
│       │       └── migration_lock.toml   # Migration lock file
│       │
│       ├── 📁 uploads/                   # File Upload Storage
│       │   └── 📁 cvs/                   # CV/Resume uploads
│       │       └── *.pdf                 # Uploaded CVs
│       │
│       ├── 📁 test/                      # E2E Tests
│       │   ├── app.e2e-spec.ts           # End-to-end tests
│       │   └── jest-e2e.json             # Jest E2E configuration
│       │
│       ├── 🔧 Configuration Files
│       ├── package.json                  # Node dependencies & scripts
│       ├── package-lock.json             # Dependency lock file
│       ├── tsconfig.json                 # TypeScript configuration
│       ├── tsconfig.build.json           # Build-specific TypeScript config
│       ├── nest-cli.json                 # NestJS CLI configuration
│       ├── eslint.config.mjs             # ESLint configuration
│       ├── docker-compose.yml            # Docker services (PostgreSQL)
│       │
│       └── 📝 Utility & Test Scripts
│           ├── create_users.js           # Script to create default users
│           ├── seed-data.js              # Database seeding
│           ├── check-password.js         # Password testing utility
│           ├── check-user.js             # User validation utility
│           ├── check-user2.js            # Alternative user check
│           ├── test-jwt-secret.js        # JWT testing
│           ├── test-role.js              # Role testing
│           ├── test-users-api.http       # HTTP API tests for users
│           ├── test-applicants-api.http  # HTTP API tests for applicants
│           ├── test-contracts-api.http   # HTTP API tests for contracts
│           └── test-cv.pdf               # Sample CV for testing
│
├── 📁 front-end/                         # Frontend Application
│   │
│   ├── 📁 src/                           # Source Code Directory
│   │   │
│   │   ├── 📁 components/                # React Components
│   │   │   │
│   │   │   ├── 📁 ui/                    # Shadcn UI Components (54 files)
│   │   │   │   ├── button.tsx            # Button component
│   │   │   │   ├── card.tsx              # Card component
│   │   │   │   ├── dialog.tsx            # Dialog/Modal component
│   │   │   │   ├── form.tsx              # Form components
│   │   │   │   ├── input.tsx             # Input component
│   │   │   │   ├── table.tsx             # Table component
│   │   │   │   ├── toast.tsx             # Toast notification
│   │   │   │   └── *.tsx                 # 40+ more UI components
│   │   │   │
│   │   │   ├── 📁 layout/                # Layout Components
│   │   │   │   ├── Header.tsx            # Application header
│   │   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   │   ├── Footer.tsx            # Application footer
│   │   │   │   └── *.tsx                 # Additional layout components
│   │   │   │
│   │   │   ├── 📁 dashboard/             # Dashboard Components
│   │   │   │   ├── StatsCard.tsx         # Statistics display card
│   │   │   │   ├── RecentActivities.tsx  # Activity feed
│   │   │   │   ├── QuickActions.tsx      # Quick action buttons
│   │   │   │   └── *.tsx                 # 6+ more dashboard components
│   │   │   │
│   │   │   ├── 📁 admin/                 # Admin-specific Components
│   │   │   │   └── *.tsx                 # Admin UI components
│   │   │   │
│   │   │   ├── 📁 client/                # Client-specific Components
│   │   │   │   └── *.tsx                 # Client UI components
│   │   │   │
│   │   │   ├── 📁 profile/               # Profile Components
│   │   │   │   └── *.tsx                 # Profile management UI
│   │   │   │
│   │   │   ├── 📁 agora/                 # Video Call Components
│   │   │   │   └── *.tsx                 # Agora video integration
│   │   │   │
│   │   │   ├── ProtectedRoute.tsx        # Route protection HOC
│   │   │   └── AgoraVideoCall.tsx        # Video call interface
│   │   │
│   │   ├── 📁 pages/                     # Page Components
│   │   │   │
│   │   │   ├── 📁 auth/                  # Authentication Pages
│   │   │   │   ├── Login.tsx             # Login page
│   │   │   │   └── Register.tsx          # Registration page
│   │   │   │
│   │   │   ├── 📁 admin/                 # Admin Dashboard Pages (12 files)
│   │   │   │   ├── AdminDashboard.tsx    # Main admin dashboard
│   │   │   │   ├── Clients.tsx           # Client management
│   │   │   │   ├── ClientDetail.tsx      # Client details view
│   │   │   │   ├── Users.tsx             # User management
│   │   │   │   ├── Jobs.tsx              # Job management
│   │   │   │   ├── JobDetails.tsx        # Job details view
│   │   │   │   ├── Contracts.tsx         # Contract management
│   │   │   │   ├── Reports.tsx           # Reports & analytics
│   │   │   │   ├── Settings.tsx          # System settings
│   │   │   │   ├── AgoraSettings.tsx     # Agora configuration
│   │   │   │   ├── Profile.tsx           # Admin profile
│   │   │   │   └── ApplicantProfile.tsx  # Applicant view
│   │   │   │
│   │   │   ├── 📁 hr/                    # HR Pages (9 files)
│   │   │   │   ├── HRDashboard.tsx       # HR dashboard
│   │   │   │   ├── Jobs.tsx              # Job postings
│   │   │   │   ├── Candidates.tsx        # Candidate list
│   │   │   │   ├── CandidateProfile.tsx  # Candidate details
│   │   │   │   ├── Interviews.tsx        # Interview management
│   │   │   │   ├── Reports.tsx           # HR reports
│   │   │   │   ├── Profile.tsx           # HR profile
│   │   │   │   └── HRSettings.tsx        # HR settings
│   │   │   │
│   │   │   ├── 📁 sales/                 # Sales Pages (18 files)
│   │   │   │   ├── SalesDashboard.tsx    # Sales dashboard
│   │   │   │   ├── SalesClients.tsx      # Client management
│   │   │   │   ├── SalesJobs.tsx         # Job management
│   │   │   │   ├── SalesContracts.tsx    # Contract management
│   │   │   │   ├── Revenue.tsx           # Revenue tracking
│   │   │   │   ├── Targets.tsx           # Sales targets
│   │   │   │   ├── SalesReminders.tsx    # Reminders & follow-ups
│   │   │   │   ├── SalesArchive.tsx      # Archived data
│   │   │   │   ├── SalesReports.tsx      # Sales reports
│   │   │   │   ├── Profile.tsx           # Sales profile
│   │   │   │   └── SalesSettings.tsx     # Sales settings
│   │   │   │
│   │   │   ├── 📁 client/                # Client Portal Pages (12 files)
│   │   │   │   ├── ClientDashboard.tsx   # Client dashboard
│   │   │   │   ├── ClientJobs.tsx        # Client's job listings
│   │   │   │   ├── ClientCandidates.tsx  # Candidate review
│   │   │   │   ├── Contracts.tsx         # Contract viewing
│   │   │   │   ├── RequestJob.tsx        # Job request form
│   │   │   │   ├── ClientProfile.tsx     # Client profile
│   │   │   │   └── ClientSettings.tsx    # Client settings
│   │   │   │
│   │   │   ├── 📁 applicant/             # Applicant Pages (9 files)
│   │   │   │   ├── ApplicantDashboard.tsx      # Applicant dashboard
│   │   │   │   ├── ApplicantJobs.tsx           # Job browsing
│   │   │   │   ├── JobDetails.tsx              # Job details & apply
│   │   │   │   ├── ApplicantApplications.tsx   # Application status
│   │   │   │   ├── ApplicationTimeline.tsx     # Application timeline
│   │   │   │   ├── ApplicantInterviews.tsx     # Interview schedule
│   │   │   │   ├── ApplicantProfile.tsx        # Profile management
│   │   │   │   └── ApplicantSettings.tsx       # Settings
│   │   │   │
│   │   │   ├── Index.tsx                 # Landing/Home page
│   │   │   ├── Homepage.tsx              # Homepage content
│   │   │   ├── Partners.tsx              # Partners page
│   │   │   ├── CandidateTimeline.tsx     # Timeline feature
│   │   │   ├── ContractManagement.tsx    # Contract management
│   │   │   ├── WhatsAppIntegration.tsx   # WhatsApp feature
│   │   │   └── NotFound.tsx              # 404 page
│   │   │
│   │   ├── 📁 services/                  # API Service Layer
│   │   │   ├── apiService.ts             # Base API service
│   │   │   ├── activeJobsApi.ts          # Active jobs API
│   │   │   ├── applicantApi.ts           # Applicant API
│   │   │   ├── clientApi.ts              # Client API
│   │   │   ├── contractsApi.ts           # Contracts API
│   │   │   ├── hrApi.ts                  # HR API
│   │   │   ├── hr-api-service.ts         # HR service layer
│   │   │   ├── salesApi.ts               # Sales API
│   │   │   ├── agoraService.ts           # Agora video service
│   │   │   └── revenueService.ts         # Revenue API
│   │   │
│   │   ├── 📁 contexts/                  # React Context Providers
│   │   │   ├── AuthContext.tsx           # Authentication state
│   │   │   ├── ThemeContext.tsx          # Theme management
│   │   │   └── LanguageContext.tsx       # Internationalization
│   │   │
│   │   ├── 📁 hooks/                     # Custom React Hooks
│   │   │   ├── use-toast.ts              # Toast notification hook
│   │   │   └── use-mobile.tsx            # Mobile detection hook
│   │   │
│   │   ├── 📁 lib/                       # Utility Libraries
│   │   │   ├── api.ts                    # API client configuration
│   │   │   ├── settingsApi.ts            # Settings API
│   │   │   └── utils.ts                  # Utility functions
│   │   │
│   │   ├── 📁 types/                     # TypeScript Type Definitions
│   │   │   ├── index.ts                  # Main type exports
│   │   │   └── job.ts                    # Job-related types
│   │   │
│   │   ├── 📁 assets/                    # Static Assets
│   │   │   └── hero-crm.jpg              # Hero images
│   │   │
│   │   ├── App.tsx                       # Main app component
│   │   ├── App.css                       # App-specific styles
│   │   ├── main.tsx                      # React entry point
│   │   ├── index.css                     # Global styles
│   │   └── vite-env.d.ts                 # Vite type definitions
│   │
│   ├── 📁 public/                        # Public Assets
│   │   ├── logo.png                      # Application logo
│   │   ├── placeholder.svg               # Placeholder images
│   │   ├── robots.txt                    # SEO robots file
│   │   └── _redirects                    # Netlify redirects
│   │
│   ├── 🔧 Configuration Files
│   ├── package.json                      # Frontend dependencies
│   ├── package-lock.json                 # Dependency lock file
│   ├── bun.lockb                         # Bun lock file
│   ├── tsconfig.json                     # TypeScript config
│   ├── tsconfig.app.json                 # App-specific TS config
│   ├── tsconfig.node.json                # Node-specific TS config
│   ├── vite.config.ts                    # Vite configuration
│   ├── tailwind.config.ts                # Tailwind CSS config
│   ├── components.json                   # Shadcn components config
│   ├── eslint.config.js                  # ESLint configuration
│   ├── index.html                        # HTML entry point
│   ├── README.md                         # Frontend documentation
│   ├── profile.md                        # Profile documentation
│   └── project.md                        # Project documentation
│
├── 📝 Root Level Files
├── README.md                             # Main project documentation (Arabic)
├── package.json                          # Root package configuration
├── package-lock.json                     # Root dependency lock
│
├── 🧪 Test Scripts (Root Level)
├── test-client-api.js                    # Client API testing
├── test-fresh-token.js                   # Token testing
├── test-jobs-api.js                      # Jobs API testing
├── test-jobs-only.js                     # Jobs-only testing
├── test-jwt-secret.js                    # JWT secret testing
├── test-jwt.js                           # JWT testing
├── test-login.js                         # Login testing
├── test-new-token.js                     # New token testing
│
└── 📋 Utility Files
    ├── extract-translation-keys.js       # i18n key extraction
    └── missing-translation-keys.txt      # Missing translation tracking
```

---

## 🎯 Key Features by Module

### 🔐 Authentication (`auth/`)
- JWT-based authentication
- Role-based access control (RBAC)
- Support for 5 user roles: ADMIN, HR, SALES, CLIENT, APPLICANT
- Password hashing with bcrypt
- Protected routes with guards

### 👨‍💼 Admin Module (`admin/`)
- System-wide dashboard with statistics
- User management (CRUD)
- Client management
- Candidate oversight
- System settings and configuration
- Agora video settings

### 👥 HR Module (`hr/`)
- Candidate management
- Interview scheduling
- Job posting management
- Application tracking
- Feedback collection
- Timeline management
- Reports generation

### 💼 Sales Module (`sales/`)
- Client relationship management (CRM)
- Contract management
- Revenue tracking
- Sales targets and goals
- Reminders and follow-ups
- Commission tracking
- Sales reports and analytics

### 🏢 Client Module (`client/`)
- Job request submission
- Candidate review
- Contract viewing
- Job status tracking
- Communication with HR team

### 📝 Applicant Module (`applicants/`)
- Job browsing and search
- Application submission
- CV/Resume upload
- Interview scheduling
- Application timeline tracking
- Profile management

### 📹 Agora Integration (`agora/`)
- Video interview functionality
- Real-time video calls
- Token generation
- Recording capabilities
- Settings management

### 📊 Additional Features
- **Jobs Module**: Job posting, management, and tracking
- **Contracts Module**: Contract creation, tracking, and management
- **Interviews Module**: Scheduling, management, and recording
- **Timeline Module**: Application progress tracking
- **Feedback Module**: Candidate evaluation
- **Reports Module**: Analytics and reporting
- **Settings Module**: User and system settings

---

## 🗃️ Database Models (40+ Models in Prisma Schema)

### Core Models
- **User**: System users (all roles)
- **Profile**: Extended user profiles
- **UserSettings**: User preferences

### Recruitment Models
- **Job**: Job postings
- **JobRequest**: Client job requests
- **JobApplication**: Applications from candidates
- **Applicant**: Applicant profiles
- **Experience**: Work experience
- **Education**: Educational background
- **Project**: Portfolio projects
- **Qualification**: Certifications and qualifications

### Client & Business Models
- **Client**: Client companies
- **Contract**: Business contracts
- **Note**: Client notes
- **Reminder**: Task reminders
- **Revenue**: Revenue tracking

### Interview & Feedback Models
- **Interview**: Interview scheduling and management
- **Feedback**: Candidate feedback
- **ApplicationTimeline**: Application status tracking

### Sales Models
- **SalesClient**: Sales-specific client data
- **SalesJob**: Sales job tracking
- **SalesContract**: Sales contracts
- **SalesRevenue**: Revenue from sales
- **SalesTarget**: Sales goals
- **SalesReminder**: Sales reminders
- **SalesContractMilestone**: Contract milestones
- **SalesContractDocument**: Contract documents

### Integration Models
- **AgoraSettings**: Video conferencing configuration

---

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript 5.7
- **ORM**: Prisma 6.15
- **Database**: PostgreSQL (Docker)
- **Authentication**: Passport JWT
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer
- **Video**: Agora SDK

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript 5.8
- **Build Tool**: Vite 5.4
- **UI Library**: Shadcn UI (Radix UI primitives)
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts 3.1
- **Icons**: Lucide React
- **Video**: Agora RTC SDK

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Linting**: ESLint 9
- **Testing**: Jest, Supertest
- **Package Manager**: npm

---

## 📦 Key Dependencies

### Backend (`back-end/server/package.json`)
```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/jwt": "^11.0.0",
  "@prisma/client": "^6.15.0",
  "bcrypt": "^6.0.0",
  "passport-jwt": "^4.0.1",
  "agora-token": "^2.0.5"
}
```

### Frontend (`front-end/package.json`)
```json
{
  "react": "^18.3.1",
  "@radix-ui/react-*": "Latest",
  "tailwindcss": "^3.4.17",
  "react-router-dom": "^6.30.1",
  "@tanstack/react-query": "^5.83.0",
  "agora-rtc-sdk-ng": "^4.24.0"
}
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (via Docker)

### Setup Steps
1. **Database**: `cd back-end/server && docker-compose up -d postgres`
2. **Backend**: 
   ```bash
   cd back-end/server
   npm install
   npx prisma generate
   npx prisma migrate dev
   node create_users.js
   npm run start:dev
   ```
3. **Frontend**:
   ```bash
   cd front-end
   npm install
   npm run dev
   ```

### Default Users
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Pass123! |
| HR | hr@test.com | Pass123! |
| Sales | sales@test.com | Pass123! |
| Client | client@test.com | Pass123! |
| Applicant | applicant@test.com | Pass123! |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user

### HR
- `GET /api/hr/candidates` - List candidates
- `POST /api/hr/interviews` - Schedule interview
- `GET /api/hr/reports` - Generate reports

### Sales
- `GET /api/sales/clients` - List clients
- `POST /api/sales/contracts` - Create contract
- `GET /api/sales/revenue` - Revenue data

### Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `POST /api/jobs/:id/apply` - Apply to job

### Interviews
- `GET /api/interviews` - List interviews
- `POST /api/interviews` - Create interview
- `GET /api/interviews/:id/agora-token` - Get video token

---

## 🔒 Security Features
- JWT token authentication
- Role-based authorization
- Password hashing (bcrypt)
- CORS configuration
- Request validation
- File upload security

---

## 📊 User Roles & Permissions

| Feature | ADMIN | HR | SALES | CLIENT | APPLICANT |
|---------|-------|----|----|--------|-----------|
| User Management | ✅ | ❌ | ❌ | ❌ | ❌ |
| Candidate Management | ✅ | ✅ | ❌ | ✅ | ❌ |
| Job Posting | ✅ | ✅ | ✅ | ❌ | ❌ |
| Job Application | ❌ | ❌ | ❌ | ❌ | ✅ |
| Interview Scheduling | ✅ | ✅ | ❌ | ❌ | ❌ |
| Contract Management | ✅ | ❌ | ✅ | ✅ | ❌ |
| Sales Tracking | ✅ | ❌ | ✅ | ❌ | ❌ |
| Reports & Analytics | ✅ | ✅ | ✅ | ✅ | ❌ |
| System Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📈 Project Stats
- **Total Backend Modules**: 15+
- **Total Frontend Pages**: 70+
- **Total UI Components**: 54+
- **Total Database Models**: 40+
- **Total API Endpoints**: 100+
- **Supported User Roles**: 5

---

## 🌐 Deployment
- Backend: Port 3000 (configurable)
- Frontend: Port 5173 (development)
- Database: PostgreSQL on port 5432 (Docker)

---

## 📝 Documentation Files
- `README.md` - Main project documentation (Arabic)
- `front-end/README.md` - Frontend documentation
- `front-end/profile.md` - Profile feature documentation
- `front-end/project.md` - Project details

---

## 🎯 Core Workflows

### Recruitment Workflow
1. Client requests a job posting
2. Admin/HR approves and publishes job
3. Applicants browse and apply
4. HR reviews applications
5. HR schedules interviews (with video integration)
6. Feedback and timeline updates
7. Contract creation for successful candidates

### Sales Workflow
1. Lead generation (new client)
2. Client negotiation
3. Contract creation
4. Revenue tracking
5. Target monitoring
6. Commission calculation
7. Reporting and analytics

---

## 🔄 Integration Points
- **Agora Video SDK**: Real-time video interviews
- **File Storage**: Local uploads directory
- **Email**: (Potential integration point)
- **WhatsApp**: (Integration UI available)

---

This structure represents a comprehensive, production-ready HR Management System with role-based access, video interviewing, sales tracking, and complete recruitment lifecycle management.


