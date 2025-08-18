# ChittyBeacon Application

## Overview

ChittyBeacon is a comprehensive application monitoring and tracking dashboard built as part of the ChittyOS ecosystem. The application provides real-time monitoring of connected applications, tracking their status, performance metrics, workflow pipelines, and activity across various platforms. It features a React-based frontend with a modern dark theme UI, engaging hero section with live metrics, and an Express.js backend with PostgreSQL database integration.

The system is designed to track applications across multiple platforms (Replit, GitHub, Vercel, etc.) and provides analytics on app distribution, activity patterns, workflow execution, and health monitoring. It integrates with ChittyPM for package management, ChittyFlow for workflow automation, ChittyIntel for AI-powered analytics and insights, and the broader ChittyID identity system with OAuth-style authentication flows for easy onboarding and synchronization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **API Design**: RESTful endpoints with CORS support
- **Development Setup**: Custom Vite integration for hot module replacement
- **Error Handling**: Centralized error middleware with structured logging

### Database Schema
- **Users Table**: Stores user information including ChittyID integration
- **Apps Table**: Tracks connected applications with platform-specific metadata
- **App Events Table**: Logs application lifecycle events (startup, shutdown, heartbeat, package operations)
- **Packages Table**: Tracks installed packages across applications with ChittyPM integration
- **Workflows Table**: Tracks deployment pipelines, CI/CD workflows, and automation processes with ChittyFlow integration
- **Relationships**: One-to-many relationships between users and apps, apps and events/packages/workflows

### Authentication & Authorization
- **ChittyID Integration**: OAuth-style flow for user authentication
- **Session Management**: Cookie-based sessions with PostgreSQL session store
- **Identity Management**: Universal ChittyID system for cross-platform identity

### Real-time Features
- **Live Metrics**: 30-second refresh intervals for dashboard statistics
- **Activity Monitoring**: 10-second updates for recent application events
- **Status Tracking**: Real-time application health and connectivity status

### UI/UX Design
- **Dark Theme**: Custom color palette with chitty-green accent color
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Component Library**: Comprehensive set of reusable UI components
- **Accessibility**: ARIA labels and semantic HTML structure

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database URL**: Environment-based configuration for database connections

### UI Component Libraries
- **Radix UI**: Headless UI primitives for accessibility and functionality
- **Lucide React**: Icon library for consistent iconography
- **TanStack React Query**: Server state management and caching

### Development Tools
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Fast bundling for production builds
- **Replit Integration**: Development environment integration with cartographer plugin

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer
- **Google Fonts**: Inter font family for typography

### Build & Development
- **Vite**: Development server and build tool
- **TypeScript**: Type safety and development experience
- **Node.js**: Server runtime environment

### Third-party Integrations
- **ChittyPM Integration**: Package management tracking and synchronization with ChittyOS package manager
- **ChittyFlow Integration**: Workflow automation, CI/CD pipeline tracking, and deployment monitoring
- **ChittyIntel Integration**: AI-powered analytics, predictive insights, anomaly detection, and intelligent recommendations
- **ChittyID Authentication**: OAuth-style authentication flow for user identity management
- **Platform Detection**: Support for Replit, GitHub, Vercel platform metadata
- **Git Integration**: Repository information tracking and branch monitoring
- **Environment Detection**: Development vs production environment handling