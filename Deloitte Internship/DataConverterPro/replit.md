# Telemetry Data Converter

## Overview

This is a full-stack web application built for converting telemetry data between different timestamp formats (ISO 8601 and Unix milliseconds). The application features a modern React frontend with a Node.js/Express backend, designed to handle file uploads, data conversion, and job tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **File Handling**: React Dropzone for drag-and-drop file uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Processing**: Multer for handling multipart form data
- **Session Management**: Express sessions with PostgreSQL store
- **Validation**: Zod for schema validation

### Data Storage
- **Database**: PostgreSQL (configured for Neon serverless) - ACTIVE
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Migrations**: Drizzle Kit for schema management
- **Storage Strategy**: DatabaseStorage implementation using PostgreSQL for persistent data

## Key Components

### Database Schema
- **Users Table**: Basic user management with username/password
- **Conversion Jobs Table**: Tracks file conversion jobs with metadata
  - File information (name, size, format)
  - Processing status (pending, processing, completed, failed)
  - Original and converted data storage
  - Error handling and timestamps

### API Endpoints
- **POST /api/convert**: File upload and conversion endpoint
- **GET /api/jobs**: Retrieve conversion job history
- Job management endpoints for tracking conversion progress

### Frontend Components
- **FileUpload**: Drag-and-drop file upload with progress tracking
- **DataPreview**: Side-by-side view of original and converted data
- **ConversionStatus**: Real-time job status monitoring
- **WorkflowSteps**: Multi-step conversion process UI

### Data Conversion Logic
- **Timestamp Detection**: Automatic detection of ISO vs millisecond formats
- **Format Conversion**: Bidirectional conversion between timestamp formats
- **Data Validation**: Schema validation for telemetry data structure
- **Error Handling**: Comprehensive error reporting and recovery

## Data Flow

1. **File Upload**: User drags/drops JSON files containing telemetry data
2. **Format Detection**: System automatically detects timestamp format
3. **Conversion Processing**: Background job converts timestamps between formats
4. **Status Tracking**: Real-time updates on conversion progress
5. **Result Delivery**: Download converted files or view in-browser preview

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **drizzle-orm**: Type-safe database queries
- **multer**: File upload middleware
- **zod**: Schema validation

### Development Tools
- **Vite**: Development server and build tool
- **TypeScript**: Static type checking
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets
- **Backend**: ESBuild bundles server code with external dependencies
- **Database**: Drizzle migrations handle schema deployment

### Environment Configuration
- **Development**: Local development with hot reload
- **Production**: Bundled server with static file serving
- **Database**: Environment-based connection strings

### File Structure
- **Monorepo**: Client, server, and shared code in single repository
- **Shared Schema**: Common TypeScript types and validation
- **Asset Management**: Vite handles static assets and bundling

The application follows a clean separation of concerns with a type-safe interface between frontend and backend, making it easy to extend and maintain.