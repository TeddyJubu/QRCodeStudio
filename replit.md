# QR Code Generator

## Overview

This is a comprehensive QR code generator web application that allows users to create customizable QR codes with advanced styling options. The application supports multiple content types (URLs, text, WiFi credentials, vCard contacts, and email) and provides extensive customization features including colors, gradients, logos, dot styles, and corner styles. The app features a two-column layout with real-time preview and includes QR code history management and template systems.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Custom component library based on Radix UI primitives with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom CSS variables for theme support
- **State Management**: React hooks with React Query for server state management
- **QR Generation**: qr-code-styling library for advanced QR code generation and customization
- **Layout**: Two-column responsive design - left control panel (1/3 width) and right preview area (2/3 width)

### Backend Architecture
- **Framework**: Express.js server with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API with structured route handlers
- **Development**: Hot module replacement via Vite integration
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Design**: Four main entities:
  - Users (authentication and profile data)
  - QR Codes (user-generated QR codes with styling options stored as JSONB)
  - Templates (reusable styling presets with public/private visibility)
  - User Preferences (theme, default settings, auto-save preferences)
- **Local Storage**: Browser localStorage for temporary persistence and theme preferences

### Authentication and Authorization
- **Current State**: Mock authentication system with demo user ID
- **Planned**: Full user authentication system (not yet implemented)
- **Session Handling**: Prepared infrastructure using PostgreSQL session storage

### Theme and Design System
- **Design Approach**: Material Design principles with utility-focused customizations
- **Color System**: CSS custom properties with light/dark mode support
- **Typography**: Inter font family with consistent weight distribution
- **Component Variants**: Class Variance Authority (CVA) for component styling variations
- **Responsive Design**: Mobile-first approach with collapsible layout on smaller screens

## External Dependencies

### Core Libraries
- **qr-code-styling**: Advanced QR code generation with styling capabilities
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight client-side routing
- **date-fns**: Date manipulation and formatting

### UI Component Libraries
- **@radix-ui/***: Headless UI components for accessibility and behavior
- **lucide-react**: Icon library for consistent iconography
- **embla-carousel-react**: Carousel functionality
- **cmdk**: Command menu interface

### Database and Backend
- **@neondatabase/serverless**: PostgreSQL serverless database connection
- **drizzle-orm**: Type-safe database ORM
- **drizzle-zod**: Schema validation integration
- **connect-pg-simple**: PostgreSQL session store for Express

### Development Tools
- **Vite**: Build tool and development server
- **@replit/vite-plugin-***: Replit-specific development plugins
- **esbuild**: JavaScript bundler for production builds
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer

### Form and Validation
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers
- **zod**: TypeScript-first schema validation

The application is designed as a full-stack solution with clear separation of concerns, type safety throughout, and a focus on user experience with real-time preview capabilities and persistent storage options.