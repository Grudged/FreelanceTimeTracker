# Stack to the Future - Freelance Time Tracker (FTT)

A comprehensive time tracking application built for freelancers to manage projects, track time, and monitor earnings.

## Features

### 🎯 Core Features
- **User Authentication** - Secure registration and login system
- **Project Management** - Create, update, and track multiple projects
- **Time Tracking** - Detailed time entry with start/end times and work logs
- **Earnings Calculation** - Automatic calculation based on hourly rates
- **Dashboard Analytics** - Visual overview of projects and time statistics
- **Project Status Management** - Track project progress and completion

### 📱 Frontend Features
- Welcome screen with authentication options
- User profiles with customizable settings
- Home dashboard with project overview
- Project tiles with detailed time tracking tables
- Interactive forms for project and time entry creation
- Responsive design for desktop and mobile

### 🔧 Backend Features
- RESTful API with comprehensive endpoints
- MongoDB database with optimized schemas
- JWT-based authentication
- Input validation and error handling
- Automatic time calculations and project totals
- Rate limiting and security middleware

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### Frontend
- **Angular 20** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **Standalone Components** - Modern Angular architecture
- **Reactive Forms** - Form validation and handling
- **RxJS** - Reactive programming
- **HTTP Client** - API communication

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or MongoDB Atlas)
- Angular CLI (v20 or higher)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FreelanceTimeTracker
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/freelance-timetracker
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:4200
   BCRYPT_ROUNDS=12
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or make sure MongoDB Atlas connection is configured
   ```

5. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

### Frontend Setup

1. **Install Angular CLI** (if not already installed)
   ```bash
   npm install -g @angular/cli@20
   ```

2. **Install frontend dependencies**
   ```bash
   # Frontend dependencies are already included in package.json
   npm install
   ```

3. **Start the Angular development server**
   ```bash
   ng serve
   ```

4. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)

### Projects
- `GET /api/projects` - Get all projects (requires auth)
- `GET /api/projects/stats` - Get project statistics (requires auth)
- `GET /api/projects/:id` - Get specific project (requires auth)
- `POST /api/projects` - Create new project (requires auth)
- `PUT /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)
- `PUT /api/projects/:id/complete` - Mark project as complete (requires auth)

### Time Entries
- `GET /api/time-entries` - Get all time entries (requires auth)
- `GET /api/time-entries/stats` - Get time statistics (requires auth)
- `GET /api/time-entries/daily-summary` - Get daily summary (requires auth)
- `GET /api/time-entries/project/:projectId` - Get time entries for project (requires auth)
- `POST /api/time-entries` - Create new time entry (requires auth)
- `PUT /api/time-entries/:id` - Update time entry (requires auth)
- `DELETE /api/time-entries/:id` - Delete time entry (requires auth)

## Usage Guide

### Getting Started

1. **Create Account**: Visit the welcome page and click "Create New Account"
2. **Login**: Use your credentials to access the dashboard
3. **Create Project**: Click "New Project" to add your first project
4. **Track Time**: Navigate to your project and add time entries
5. **Monitor Progress**: View analytics on the dashboard

### Project Management

- **Project Creation**: Include client name, hourly rate, estimated hours
- **Contract Toggle**: Mark projects as contract or ongoing work
- **Status Tracking**: Monitor active, completed, paused, or cancelled projects
- **Rate Management**: Set different hourly rates per project

### Time Tracking

- **Time Entries**: Record start and end times for work sessions
- **Work Logs**: Add detailed notes about work performed
- **Automatic Calculations**: Hours and earnings calculated automatically
- **Daily Summaries**: Review work completed each day

## Development

### Project Structure
```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard component
│   │   ├── projects/       # Project management components
│   │   └── welcome/        # Welcome page component
│   ├── services/           # Angular services
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   └── environments/       # Environment configurations
├── controllers/            # Express route controllers
├── middleware/             # Express middleware
├── models/                 # MongoDB/Mongoose models
├── routes/                 # Express routes
└── config/                 # Configuration files
```

### Running Tests
```bash
# Backend tests
npm test

# Frontend tests
ng test

# E2E tests
ng e2e
```

### Building for Production
```bash
# Build frontend
ng build --prod

# Start production server
NODE_ENV=production npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email your-email@example.com or create an issue in the GitHub repository.

---

**Stack to the Future - Freelance Time Tracker**  
*Empowering freelancers with professional time management tools*
