# Arnav Abacus Academy Management System

A comprehensive management portal for Arnav Abacus Academy, designed to streamline operations for Admins, Teachers, and Parents.

## Overview

This application serves as the central hub for managing the academy's daily operations. It handles student enrollment, batch scheduling, attendance tracking, fee management, and performance monitoring. The system provides role-based access to ensure secure and tailored experiences for all users.

## Key Features

### 👑 Admin Portal
- **Dashboard**: Real-time overview of total students, active batches, revenue, and attendance trends.
- **Student Management**: Enroll, edit, and manage student profiles.
- **Batch Management**: Create batches, assign teachers, and schedule classes.
- **Fee Management**: Record fee payments, generate invoices, and track due dates.
- **Attendance Reports**: View detailed attendance records and statistics.
- **Activity Logs**: Audit trail of important system actions (e.g., student creation, fee payments).
- **User Management**: Manage teacher and parent accounts.

### 👩‍🏫 Teacher Portal
- **Today's Schedule**: View daily class schedule at a glance.
- **Attendance Marking**: Quickly mark student attendance for assigned batches.
- **Student Progress**: Monitor student performance and levels.

### 👨‍👩‍👧 Parent Portal
- **Child's Dashboard**: View student profile and current level.
- **Attendance History**: Check attendance records.
- **Fee History**: View payment history and download receipts.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5)
- **Testing**: [Vitest](https://vitest.dev/)

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd arnav-abacus
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add the following:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/arnav_abacus"
    AUTH_SECRET="your-super-secret-key"
    NEXTAUTH_URL="http://localhost:3000"
    ```

4.  **Database Setup:**
    ```bash
    # Generate Prisma Client
    npx prisma generate

    # Push schema to database
    npx prisma db push

    # Seed the database with initial data (Admin user, etc.)
    npx prisma db seed
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Run the automated test suite using Vitest:

```bash
npm run test
```

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, database client, and shared logic.
- `src/actions`: Server actions for form handling and data mutations.
- `prisma`: Database schema and seed scripts.
