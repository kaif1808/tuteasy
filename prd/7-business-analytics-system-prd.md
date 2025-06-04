# Business Analytics System - Sub-PRD

## Overview
The Business Analytics System provides comprehensive data visualization, reporting, and insights to help tutors and agencies make informed business decisions. This system transforms raw data into actionable intelligence through dashboards, automated reports, and trend analysis.

## Target Users
- **Primary**: Tutors analyzing their business performance
- **Secondary**: Tutoring agencies managing multiple tutors
- **Tertiary**: Platform administrators monitoring system usage
- **Quaternary**: Business development teams for strategic planning

## Feature Requirements

### Core Features (MVP)
- **Performance Dashboard**
  - Revenue tracking and visualization
  - Session volume and utilization metrics
  - Student acquisition and retention rates
  - Payment history and projections
  - Key performance indicators at a glance

- **Financial Analytics**
  - Income breakdown by subject/student
  - Hourly rate analysis
  - Revenue trends over time
  - Outstanding payment tracking
  - Cost and profit margin analysis

- **Operational Insights**
  - Scheduling efficiency metrics
  - Peak hour utilization
  - Cancellation and no-show tracking
  - Session feedback analysis
  - System usage statistics

### Advanced Features (Phase 2)
- **Predictive Analytics**
  - Revenue forecasting
  - Student churn prediction
  - Seasonal trend analysis
  - Growth opportunity identification
  - Demand forecasting by subject

- **Advanced Reporting**
  - Customizable report builder
  - Scheduled automated reports
  - Export capabilities (PDF, Excel, CSV)
  - White-label reports for agencies
  - Comparative benchmarking

- **Business Intelligence**
  - Market positioning analysis
  - Competitive rate benchmarking
  - Subject demand heatmaps
  - Customer segmentation
  - Cross-selling opportunity identification

## Technical Requirements

### Recommended Tech Stack

#### Frontend
```typescript
// Core Libraries
- React 18+ with TypeScript
- TanStack Query for data fetching
- date-fns for date handling
- Tailwind CSS for styling

// Visualization Components
- Recharts for interactive charts
- react-table for data grids
- @tanstack/react-table for advanced tables
- visx for custom visualizations
- react-datepicker for date ranges

// Dashboard Components
- GridLayout for dashboard layouts
- react-grid-layout for draggable components
- react-pdf for report generation
```

#### Backend
```typescript
// Core Framework
- Node.js 18+ LTS
- Express.js with TypeScript
- PostgreSQL for data storage
- Redis for caching aggregated data

// Data Processing
- node-cron for scheduled reports
- csv-parser and json2csv for data export
- simple-statistics for statistical analysis
- node-xlsx for Excel file generation

// Analytics Services
- Custom analytics engine
- Cube.js for OLAP operations (optional)
- Prisma with raw SQL for complex queries
```

### Database Schema

```sql
-- Analytics data warehouse tables
-- These complement the application's transactional tables

-- Time dimension
CREATE TABLE dim_time (
    time_id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    day INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    month INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    year INTEGER NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN NOT NULL
);

-- Session facts
CREATE TABLE fact_sessions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id),
    tutor_id INTEGER REFERENCES tutors(id),
    student_id INTEGER REFERENCES students(id),
    time_id INTEGER REFERENCES dim_time(time_id),
    subject_id INTEGER,
    duration_minutes INTEGER NOT NULL,
    hourly_rate DECIMAL(10,2) NOT NULL,
    revenue DECIMAL(10,2) NOT NULL,
    session_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    is_first_session BOOLEAN,
    session_rating INTEGER
);

-- Financial facts
CREATE TABLE fact_finances (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id),
    tutor_id INTEGER REFERENCES tutors(id),
    student_id INTEGER REFERENCES students(id),
    time_id INTEGER REFERENCES dim_time(time_id),
    amount DECIMAL(10,2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20),
    platform_fee DECIMAL(10,2),
    net_amount DECIMAL(10,2)
);

-- User activity
CREATE TABLE fact_user_activity (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    time_id INTEGER REFERENCES dim_time(time_id),
    activity_type VARCHAR(50) NOT NULL,
    feature_used VARCHAR(50) NOT NULL,
    duration_seconds INTEGER,
    device_type VARCHAR(20),
    browser VARCHAR(50)
);

-- Saved reports
CREATE TABLE saved_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    report_name VARCHAR(100) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_run_at TIMESTAMP WITH TIME ZONE
);

-- Dashboard preferences
CREATE TABLE dashboard_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    layout JSONB NOT NULL,
    widgets JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## User Stories

### As a Tutor
- I want to see my monthly revenue trends so I can plan my finances
- I want to identify my busiest teaching hours to optimize my schedule
- I want to analyze which subjects generate the most income
- I want to track student retention rates to improve my services
- I want to receive automated weekly performance reports

### As an Agency
- I want to monitor performance across all tutors in our organization
- I want to identify top-performing tutors for potential incentives
- I want to analyze market demand for different subjects
- I want to track agency growth metrics year-over-year
- I want to generate custom reports for business planning

### As a Platform Administrator
- I want to monitor overall platform usage and growth
- I want to analyze user engagement with different features
- I want to identify potential bottlenecks or issues
- I want to track key business metrics for platform health

## API Endpoints

```typescript
// Dashboard Data
GET    /api/analytics/dashboard               // Get user dashboard data
PUT    /api/analytics/dashboard/preferences   // Update dashboard preferences

// Performance Metrics
GET    /api/analytics/performance/revenue     // Get revenue metrics
GET    /api/analytics/performance/sessions    // Get session metrics
GET    /api/analytics/performance/students    // Get student metrics
GET    /api/analytics/performance/subjects    // Get subject performance

// Financial Analytics
GET    /api/analytics/finances/summary        // Get financial summary
GET    /api/analytics/finances/projections    // Get financial projections
GET    /api/analytics/finances/outstanding    // Get outstanding payments

// Operational Analytics
GET    /api/analytics/operations/scheduling   // Get scheduling metrics
GET    /api/analytics/operations/utilization  // Get utilization metrics
GET    /api/analytics/operations/feedback     // Get feedback analytics

// Reports
GET    /api/reports                           // List saved reports
POST   /api/reports                           // Create new report
GET    /api/reports/:id                       // Get report data
PUT    /api/reports/:id                       // Update report
DELETE /api/reports/:id                       // Delete report
POST   /api/reports/:id/generate              // Generate report (PDF/Excel)
```

## Data Visualization Types

```typescript
// Revenue Visualizations
interface RevenueChart {
  type: 'bar' | 'line' | 'area';
  timePeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  compareWithPrevious?: boolean;
  showProjection?: boolean;
  breakdownBy?: 'subject' | 'student' | 'sessionType';
}

// Session Analytics
interface SessionAnalytics {
  type: 'calendar' | 'heatmap' | 'bar';
  metrics: Array<'count' | 'duration' | 'revenue' | 'rating'>;
  groupBy: 'hourOfDay' | 'dayOfWeek' | 'date';
  dateRange: [Date, Date];
}

// Student Insights
interface StudentInsights {
  type: 'pie' | 'bar' | 'table';
  metrics: Array<'retention' | 'acquisition' | 'sessionsPerStudent' | 'revenuePerStudent'>;
  segmentBy?: 'ageGroup' | 'subject' | 'gradeLevel';
}
```

## Success Metrics
- Dashboard usage frequency: >3 times/week per user
- Report generation count: >5/month per user
- Data export frequency: >2/month per user
- Time spent analyzing data: 15+ minutes per session
- User-reported value from insights: >4.5/5
- Business decisions influenced by analytics: >60%

## Security & Compliance
- Role-based access to analytics data
- Data anonymization for aggregate reports
- PII protection in all exports
- GDPR compliance for EU users
- Audit logging for all analytics access
- Data retention policies for historical analytics

## Implementation Timeline
- **Week 1-2**: Core dashboard infrastructure and basic metrics
- **Week 3-4**: Financial analytics implementation
- **Week 5-6**: Operational insights development
- **Week 7-8**: Reporting system and export capabilities
- **Week 9-10**: Advanced visualizations and custom dashboard support
- **Week 11-12**: Testing, optimization, and user feedback implementation

## Performance Considerations
- Pre-aggregation of common metrics
- Caching strategy for dashboard components
- Asynchronous report generation for large datasets
- Progressive loading of dashboard widgets
- Data sampling for very large historical analyses
- Query optimization for complex analytics

## Data Pipeline

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Application    │────►│  ETL Process    │────►│  Analytics      │
│  Database       │     │  (Daily)        │     │  Data Warehouse │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  User           │◄────│  Dashboard      │◄────│  Analytics      │
│  Interface      │     │  Engine         │     │  Engine         │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Future Enhancements
- Machine learning for predictive analytics
- Natural language query interface
- Anomaly detection and alerting
- Advanced segmentation capabilities
- Cohort analysis for student groups
- Integration with external business intelligence tools
- Mobile analytics app for on-the-go insights
- Competitive benchmarking with anonymized market data