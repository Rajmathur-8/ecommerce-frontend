# E-commerce Next.js App with Firebase Authentication

A modern e-commerce application built with Next.js 14, TypeScript, Tailwind CSS, and Firebase Authentication.

## Features

### 🔐 Authentication System
- **Email/Phone Registration & Login** - Users can register and login using email or phone number
- **Google Authentication** - One-click login with Google account
- **Password Reset** - Forgot password functionality with email reset
- **OTP Verification** - 6-digit OTP verification system
- **Modern UI** - Beautiful, responsive design with Tailwind CSS

### 📱 Pages
- `/` - Home page with navigation
- `/auth/register` - User registration with Google login
- `/auth/login` - User login with Google login
- `/auth/otp` - OTP verification
- `/auth/forgot-password` - Forgot password
- `/auth/reset-password` - Reset password

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing project
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google sign-in
4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web app or create a new one
   - Copy the config object

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:5000/api
```

### 4. API Configuration

The app uses a centralized API configuration located in `src/lib/config.ts`:

```typescript
// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000, // 10 seconds
};

// Helper functions
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
```

### 5. Using Base URL in Components

The app uses a centralized API service (`src/lib/api.ts`) that automatically uses the base URL configuration. For direct API calls, use the helper functions:

```typescript
import { getApiUrl, getAuthHeaders } from '@/lib/config';

// Fetch data
const response = await fetch(getApiUrl('/web/banners'), {
  headers: getAuthHeaders()
});

// Using the API service (recommended)
import { apiService } from '@/lib/api';
const response = await apiService.auth.login(loginData);
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Authentication Features

### Register Page (`/auth/register`)
- Email/phone registration with OTP verification
- Google authentication integration
- Form validation with react-hook-form
- Responsive design

### Login Page (`/auth/login`)
- Email/phone login
- Google authentication
- Remember me functionality
- Password reset link

### OTP Verification (`/auth/otp`)
- 6-digit OTP input
- Resend OTP functionality
- Auto-focus on input fields
- Timer for resend button

## API Integration

The frontend communicates with the backend API using the following endpoints:

- **Authentication**: `/web/login`, `/web/register`, `/web/verify-otp`
- **Banners**: `/web/banners`
- **Products**: `/web/products`
- **Categories**: `/web/categories`
- **Cart**: `/web/cart/*`

## Development

### Project Structure
```
src/
├── app/                 # Next.js app directory
│   ├── auth/           # Authentication pages
│   ├── cart/           # Shopping cart
│   ├── product/        # Product details
│   └── products/       # Product listing
├── components/         # Reusable components
├── contexts/          # React contexts
├── hooks/             # Custom hooks
└── lib/               # Utility functions
    ├── api.ts         # API service
    ├── config.ts      # API configuration
    └── firebase.ts    # Firebase configuration
```

### Adding New API Calls

When adding new API calls, use the centralized API service:

```typescript
import { apiService } from '@/lib/api';

// The API service automatically uses the base URL configuration
const response = await apiService.auth.login(loginData);
```

For direct fetch calls, use the helper functions:

```typescript
import { getApiUrl, getAuthHeaders } from '@/lib/config';

const response = await fetch(getApiUrl('/endpoint'), {
  headers: getAuthHeaders(),
  body: JSON.stringify(data)
});
```

## Deployment

For production deployment, update the environment variables:

```env
NEXT_PUBLIC_BASE_URL=https://your-api-domain.com/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_production_firebase_key
# ... other production Firebase config
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Authentication and backend services
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications
