# CAD-Bitcoin Exchange Platform

## Overview

This is a professional Canadian Dollar to Bitcoin exchange platform with real-time rates, conversion calculator, and secure trading capabilities. The application provides users with live exchange rates, currency conversion tools, and an administrative dashboard for rate management and system configuration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern UI
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Forms**: React Hook Form with Zod for form validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints for exchange rates, admin authentication, and settings
- **Session Management**: Express sessions for admin authentication
- **Development**: Hot module replacement with Vite middleware in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Development Storage**: In-memory storage implementation for rapid development
- **Connection**: Neon Database serverless driver for production deployment

### Authentication and Authorization
- **Admin Authentication**: Session-based authentication with secure login/logout
- **Session Storage**: Express sessions with configurable session secrets
- **Access Control**: Protected admin routes with authentication middleware
- **Default Credentials**: Admin user (admin/admin123) for initial setup

### Data Architecture
- **Exchange Rates**: Real-time BTC/CAD rates with 24h statistics (change, high, low, volume)
- **Multiple API Sources**: CoinGecko, CoinDesk, and CryptoCompare with automatic failover
- **Historical Data**: Real price history from CoinGecko API with 24h/7d/30d timeframes
- **Site Settings**: Configurable processing fees, transaction limits, and update intervals
- **Manual Overrides**: Admin capability to override automatic rate updates
- **Rate Caching**: 30-second refresh intervals with automatic background updates
- **Trading System**: Real buy/sell transactions that modify user CAD and BTC balances
- **Balance Validation**: Sufficient balance checks before processing trades
- **Fallback System**: Always ensures exchange rates are available even when all APIs fail

### Component Architecture
- **Conversion Calculator**: Real-time bidirectional CAD/BTC conversion with fee calculations
- **Rate Display**: Live exchange rate visualization with 24h change indicators
- **Price Chart**: Interactive Chart.js integration for historical price visualization
- **Real Trading Interface**: Fully functional Bitcoin trading with user balance integration
- **Admin Dashboard**: Comprehensive management interface for rates and settings

### User Interface Design
- **Design System**: shadcn/ui component library with consistent styling
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Accessibility**: ARIA-compliant components with keyboard navigation
- **Color Scheme**: Professional blue/neutral palette optimized for financial applications
- **Typography**: Inter font family for optimal readability

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL for production data storage
- **Drizzle ORM**: Type-safe database operations and schema management

### UI and Visualization
- **shadcn/ui**: Comprehensive React component library built on Radix UI
- **Radix UI**: Unstyled, accessible UI primitives for custom component development
- **Chart.js**: Interactive charts for price visualization and historical data
- **Lucide React**: Consistent icon library for UI elements

### Development Tools
- **Vite**: Fast build tool with hot module replacement and optimized bundling
- **TypeScript**: Static type checking for improved code quality and developer experience
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **PostCSS**: CSS processing with autoprefixer for browser compatibility

### Data Management
- **TanStack Query**: Powerful data fetching and caching with background updates
- **React Hook Form**: Performant forms with minimal re-renders
- **Zod**: Schema validation for form inputs and API responses
- **date-fns**: Lightweight date manipulation and formatting utilities

### Authentication and Security
- **Express Session**: Server-side session management for admin authentication
- **connect-pg-simple**: PostgreSQL session store for production deployments

### Runtime and Deployment
- **Node.js**: JavaScript runtime for server-side execution
- **Express.js**: Web framework for API endpoints and middleware
- **tsx**: TypeScript execution for development and build processes
- **esbuild**: Fast JavaScript bundler for production builds