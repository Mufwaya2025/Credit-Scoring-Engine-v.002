# 🏦 Credit Scoring Engine v1.0

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38B2AC.svg)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.11.1-2D3748.svg)](https://prisma.io/)

A comprehensive credit scoring and applicant field management system built with modern web technologies. This application provides dynamic field configuration, real-time credit scoring, and a complete administrative interface for managing loan application processes.

## ✨ Features

### 🎯 Core Functionality
- **📝 Dynamic Field Management**: Create, read, update, and delete applicant fields with 8 different field types
- **🎨 Real-time Form Generation**: Automatically generate forms based on active field configurations
- **📊 Credit Scoring Engine**: Configurable scoring system with 9 factors and 5-tier score ranges (300-850 FICO-style)
- **🔄 Live API Integration**: Field changes immediately affect all API endpoints without redeployment
- **📈 Analytics Dashboard**: Monitor scoring performance and system metrics

### 🛠️ Technical Stack
- **⚡ Next.js 15** - React framework with App Router
- **📘 TypeScript 5** - Type-safe development
- **🎨 Tailwind CSS 4** - Utility-first CSS framework
- **🧩 shadcn/ui** - High-quality, accessible components
- **🗄️ Prisma ORM** - Database management with SQLite
- **📋 React Hook Form + Zod** - Form validation
- **🔄 TanStack Query** - Data synchronization
- **🎯 Lucide React** - Beautiful icons

### 🏗️ Application Architecture

#### **Field Management System**
- **Field Types**: Text, Number, Select, Checkbox, Date, Radio, and more
- **Categories**: Personal, Financial, Employment, Credit information
- **Validation**: Built-in validation rules with JSON configuration
- **Scoring Integration**: Each field can contribute to credit scoring

#### **Credit Scoring Engine**
- **9 Scoring Factors**: Age, Income, Credit History, Credit Utilization, etc.
- **5 Score Ranges**: Excellent (750-850) to Very Poor (300-599)
- **Dynamic Configuration**: Adjust scoring weights and thresholds in real-time
- **Real-time Prediction**: Instant credit score calculation

#### **Administrative Interface**
- **Field Configuration**: Complete CRUD operations for applicant fields
- **Scoring Configuration**: Manage scoring factors and ranges
- **Rules Engine**: Configure business rules for loan decisions
- **Monitoring**: System health and performance metrics

## 📸 Demo & Screenshots

### 🎥 Live Demo
[![View Demo](https://img.shields.io/badge/View-Demo-brightgreen.svg)](https://your-demo-url.com)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel-blue.svg)](https://vercel.com/)

### 📱 Application Screenshots

#### Field Management Interface
![Field Management](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Field+Management+Interface)
- Dynamic field creation and editing
- Real-time form preview
- Validation and scoring configuration

#### Credit Scoring Dashboard
![Scoring Dashboard](https://via.placeholder.com/800x400/059669/FFFFFF?text=Credit+Scoring+Dashboard)
- Real-time score calculation
- Performance metrics and analytics
- Score range configuration

#### Administrative Panel
![Admin Panel](https://via.placeholder.com/800x400/DC2626/FFFFFF?text=Administrative+Panel)
- User management and permissions
- System monitoring and health checks
- Configuration management

### 🎯 Key Features in Action

#### ✨ Dynamic Form Generation
- **8 Field Types**: Text, Number, Select, Checkbox, Date, Radio, and more
- **Real-time Validation**: Instant feedback and error handling
- **Responsive Design**: Works seamlessly on all devices

#### 📊 Credit Scoring Engine
- **9 Scoring Factors**: Age, Income, Credit History, Credit Utilization, etc.
- **FICO-Style Ranges**: 300-850 with 5-tier classification
- **Real-time Processing**: Instant score calculation and breakdown

#### 🔄 Live Configuration
- **Immediate Updates**: Changes affect APIs without redeployment
- **Version Control**: Track configuration changes over time
- **Rollback Capability**: Revert to previous configurations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/applicant-field-system.git
cd applicant-field-system

# Install dependencies
npm install

# Set up the database
npm run db:push

# Start development server
npm run dev
```

### Database Setup

The application uses SQLite with Prisma ORM. The database will be automatically created when you run:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
# Visit /api/seed-all in your browser
```

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:push      # Push schema to database
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run migrations
npm run db:reset     # Reset database
```

## 📱 Application Pages

### **Field Management** (`/applicant-fields`)
- Create, edit, and delete applicant fields
- Configure field types, validation, and scoring weights
- Real-time form preview

### **Scoring Configuration** (`/scoring-config`)
- Manage credit scoring factors
- Configure score ranges and thresholds
- Adjust scoring weights and calculations

### **Score Ranges** (`/score-range`)
- Define credit score ranges (Excellent, Good, Fair, Poor, Very Poor)
- Configure approval statuses and risk levels
- Set interest rate and loan limit adjustments

### **Rules Engine** (`/rules`)
- Create business rules for loan decisions
- Configure rule conditions and actions
- Manage rule priority and execution order

### **Prediction** (`/prediction`)
- Test credit scoring predictions
- View detailed score breakdowns
- Monitor prediction performance

## 🔌 API Endpoints

### **Field Management**
- `GET /api/applicant-fields` - Get all fields
- `GET /api/applicant-fields?active=true` - Get active fields only
- `POST /api/applicant-fields` - Create new field
- `PUT /api/applicant-fields/[id]` - Update field
- `DELETE /api/applicant-fields/[id]` - Delete field

### **Credit Scoring**
- `POST /api/predict` - Calculate credit score
- `GET /api/scoring-config` - Get scoring configuration
- `GET /api/score-range` - Get score ranges

### **System**
- `GET /api/health` - Health check
- `POST /api/seed-all` - Seed database with sample data

## 🗄️ Database Schema

The application uses the following main models:

- **ApplicantField**: Dynamic field definitions
- **ScoringConfig**: Credit scoring factors configuration
- **ScoreRange**: Credit score ranges and thresholds
- **Rule**: Business rules for loan decisions
- **Prediction**: Credit score predictions and results
- **AuditLog**: System audit trail

## 🎨 UI Components

Built with shadcn/ui components including:
- **Forms**: Dynamic form generation with validation
- **Tables**: Data tables with sorting and filtering
- **Modals**: Edit dialogs and confirmation dialogs
- **Charts**: Score distribution and performance metrics
- **Alerts**: System notifications and error handling

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./db/custom.db"
```

### Customization

- **Field Types**: Extend field types in `src/lib/applicant-field.ts`
- **Scoring Logic**: Modify scoring algorithms in `src/lib/configurable-scoring.ts`
- **UI Components**: Customize components in `src/components/`
- **API Routes**: Add endpoints in `src/app/api/`

## 🧪 Testing

The application includes comprehensive testing:

```bash
# Run the test suite
node test-api.js      # Test API endpoints
node test-db.js       # Test database operations
```

### Test Coverage
- ✅ Database connection and seeding
- ✅ Applicant field CRUD operations
- ✅ Dynamic form generation and validation
- ✅ Credit scoring prediction API
- ✅ Scoring configuration integration
- ✅ UI responsive and error handling

## 🚀 Deployment

### Local Development
```bash
npm install
npm run db:push
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

The application is production-ready with:
- ✅ Optimized build process
- ✅ Comprehensive error handling
- ✅ Security best practices
- ✅ Performance monitoring
- ✅ Database backup strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Components from [shadcn/ui](https://ui.shadcn.com/)
- Database by [Prisma](https://prisma.io/)
- Icons by [Lucide](https://lucide.dev/)

---

**Built for modern loan application processing and credit scoring.** 🏦
