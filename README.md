# CRM and Workflow Management System

A comprehensive CRM (Customer Relationship Management) system with email marketing, workflow management, and analytics capabilities.

## Features

- **Customer Management**: Track and manage customer information
- **Email Marketing**: 
  - Create and send email campaigns
  - Design emails with a drag-and-drop editor
  - Schedule automated email sending
  - Track email opens and clicks
- **Workflow Management**: 
  - Manage tasks and projects
  - Trello integration for task synchronization
- **Analytics**: Visualize customer data and email campaign performance
- **Firebase Integration**: Store all data securely in Firebase

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Firebase
- **Email Service**: Mailjet
- **Task Management**: Trello API
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore

## Environment Variables

The following environment variables are required:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Trello API
TRELLO_API_KEY=
TRELLO_TOKEN=
TRELLO_BOARD_ID=

# Mailjet Configuration
MAILJET_API_KEY=
MAILJET_API_SECRET=
SENDER_EMAIL=

# Application URL
NEXT_PUBLIC_APP_URL=

# Cron Job Security
CRON_SECRET=

