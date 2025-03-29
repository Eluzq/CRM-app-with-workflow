# 🧠 CRM & Workflow Management System

A comprehensive **Customer Relationship Management (CRM)** and **Workflow Management** platform, designed to help teams manage customer interactions, automate email marketing, and streamline task management with seamless integration and insightful analytics.

Built with modern technology, it showcases best practices in frontend architecture, API integration, and secure data handling.

---

## ✨ Features

### 📇 Customer Management
- Easily create, update, and manage customer profiles
- Segment customers for targeted campaigns

### 📧 Email Marketing
- User-friendly drag-and-drop email editor
- Schedule and automate email campaigns via Mailjet
- Real-time tracking of email opens and link clicks

### ✅ Workflow & Task Management
- Manage tasks efficiently with Trello integration
- Visualize task statuses and automate workflows

### 📊 Analytics Dashboard
- Visualize campaign performance (open/click rates)
- Gain insights into customer engagement
- Monitor task progress and completion rates

### 🔐 Authentication & Security
- Secure authentication using Firebase Auth
- Protected API endpoints secured by CRON_SECRET

---

## 🛠️ Tech Stack

| Layer             | Technologies Used                             |
|-------------------|-----------------------------------------------|
| **Frontend**      | Next.js, React, Tailwind CSS, shadcn/ui       |
| **Backend/API**   | Next.js API Routes, Firebase Functions        |
| **Authentication**| Firebase Authentication                       |
| **Database**      | Firebase Firestore                            |
| **Email Service** | Mailjet API                                   |
| **Task Management**| Trello API                                    |
| **Deployment**    | Vercel (Frontend), Firebase (Backend)         |

---

## ⚙️ Environment Variables

Create a `.env.local` file at your project's root and set the following variables:

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
```

---

## 🚀 Quick Start

1. Clone the repository

```bash
git clone https://github.com/Eluzq/CRM-app-with-workflow.git
cd CRM-app-with-workflow
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view your application.




## 📁 Project Structure

```
CRM-app-with-workflow/
├── components/         # UI components
│   ├── ui/             # Common UI components (buttons, cards, forms, etc.)
│   ├── layout/         # Layout-related components (header, sidebar, footer, etc.)
│   ├── dashboard/      # Dashboard-related components
│   ├── customers/      # Customer management components
│   ├── workflow/       # Workflow-related components
├── pages/              # Application pages and API endpoints
│   ├── api/            # API routes
│   │   ├── trello/     # Trello integration APIs
│   │   ├── mailjet/    # Mailjet integration APIs
│   │   ├── cron/       # Scheduled job APIs
│   ├── dashboard.js    # Dashboard page
│   ├── customers/      # Customer management pages
│   ├── workflow/       # Workflow management pages
│   ├── settings.js     # Settings page
├── lib/                # External integrations
│   ├── firebase.js     # Firebase integration
│   ├── trello.js       # Trello integration
│   ├── mailjet.js      # Mailjet integration
│   ├── utils.js        # Utility functions
├── styles/             # Styling using Tailwind CSS
│   ├── globals.css     # Global styles
├── public/             # Static assets
│   ├── images/         # Image files
│   ├── icons/          # Icon files
├── .env.local          # Environment variables (not committed)
├── next.config.js      # Next.js configuration file
├── tailwind.config.js  # Tailwind CSS configuration file
├── package.json        # Project dependencies
```

---

## 📬 Feedback & Contributions
Your contributions and feedback are welcome! Feel free to open issues, create pull requests, or contact me directly.

---

## 📞 Contact
- GitHub: [Eluzq](https://github.com/Eluzq)
- Email: [yukimukohara09@gmail.com]



