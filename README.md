# Stack to the Future - Freelance Time Tracker (FTT)

A comprehensive full-stack time tracking application built for freelancers to manage projects, track time, and monitor earnings. Features Docker containerization, MongoDB integration, and Zabbix monitoring for production-ready deployment.

## ✨ Key Features

### 🎯 Core Functionality
- **User Authentication** - JWT-based secure registration and login system
- **Project Management** - Create, update, and track multiple client projects
- **Time Tracking** - Detailed time entries with start/end times and work descriptions
- **Earnings Calculation** - Automatic calculation based on hourly rates per project
- **Dashboard Analytics** - Visual charts and statistics using Chart.js and ng2-charts
- **Project Status Management** - Track active, completed, paused, or cancelled projects
- **Persistent Timer** - Continue timing across browser sessions

### 📱 Frontend Features
- **Modern Angular 20** - Standalone components with latest Angular architecture  
- **Responsive Design** - Mobile-first design that works on all devices
- **Theme Support** - Dark/light mode with theme selector component
- **Interactive Dashboard** - Real-time project overview with visual charts
- **Toast Notifications** - User feedback system for actions and errors
- **Loading States** - Spinner components for better UX during API calls
- **Route Guards** - Protected routes with authentication checks

### 🔧 Backend Features
- **RESTful API** - Comprehensive endpoints for all application functionality
- **MongoDB Integration** - NoSQL database with Mongoose ODM and optimized schemas
- **JWT Authentication** - Secure token-based authentication with refresh capability
- **Input Validation** - Server-side validation and error handling
- **Security Middleware** - Helmet, CORS, rate limiting, and request size limits
- **Health Monitoring** - Built-in health check and metrics endpoints
- **Docker Support** - Full containerization with multi-service orchestration

### 🐳 DevOps & Monitoring
- **Docker Compose** - Multi-container setup with MongoDB, app, and monitoring
- **Zabbix Integration** - Complete monitoring stack with PostgreSQL backend
- **Health Checks** - Application and database health monitoring
- **Metrics Collection** - Memory usage, response times, and system metrics
- **Container Networking** - Secure internal communication between services
- **Volume Persistence** - Data persistence for MongoDB and Zabbix

## 🛠 Tech Stack

### Backend
- **Node.js 20** - Latest LTS runtime environment
- **Express.js 5** - Modern web application framework
- **MongoDB 7** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for stateless authentication
- **bcryptjs** - Secure password hashing
- **Helmet** - Security headers and protection
- **CORS** - Cross-origin resource sharing configuration
- **Morgan** - HTTP request logger middleware
- **dotenv** - Environment variable management

### Frontend
- **Angular 20** - Latest version with standalone components
- **TypeScript 5.8** - Strong typing and modern JavaScript features
- **RxJS** - Reactive programming and async data handling
- **Chart.js & ng2-charts** - Data visualization and analytics
- **Angular Forms** - Reactive forms with validation
- **Angular Router** - Client-side routing with guards
- **HTTP Interceptors** - Automatic JWT token injection

### Development & Testing
- **Jest** - JavaScript testing framework
- **Karma & Jasmine** - Angular testing utilities
- **Supertest** - HTTP assertion testing
- **Prettier** - Code formatting with Angular parser
- **Nodemon** - Development server with auto-reload
- **Angular CLI** - Development tooling and build system

### Infrastructure & Monitoring
- **Docker & Docker Compose** - Containerization and orchestration
- **MongoDB 7** - Primary application database
- **PostgreSQL 15** - Zabbix monitoring database
- **Zabbix 6.4** - Complete monitoring solution with web interface
- **Nginx** - Web server for Zabbix frontend
- **Alpine Linux** - Lightweight container base images

## 🚀 Installation & Setup

### Prerequisites
- **Node.js 20+** - Latest LTS version required for Angular 20
- **Docker & Docker Compose** - For containerized deployment (recommended)
- **MongoDB** - Database (included in Docker setup)
- **Angular CLI 20+** - Frontend development tools

### 🐳 Quick Start with Docker (Recommended)

The easiest way to run the complete application with monitoring:

```bash
# Clone the repository
git clone <repository-url>
cd FreelanceTimeTracker

# Start the complete stack (app + database + monitoring)
docker-compose up -d

# Access the applications
# - FreelanceTimeTracker: http://localhost:3000
# - Frontend development: ng serve (http://localhost:4200)  
# - Zabbix Monitoring: http://localhost:8080 (Admin/zabbix)
```

This starts:
- ✅ FreelanceTimeTracker API server (port 3000)
- ✅ MongoDB database with initialization
- ✅ Zabbix monitoring stack (web interface on port 8080)
- ✅ PostgreSQL for Zabbix data
- ✅ Health checks and metrics collection

### 📋 Manual Development Setup

For development without Docker:

#### Backend Setup

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

## 📊 Monitoring & Health Checks

The application includes comprehensive monitoring capabilities with three built-in endpoints:

### Health Check Endpoint - `/api/health`
```bash
curl http://localhost:3000/api/health
```
Returns detailed health information:
- ✅ API status and uptime
- ✅ Database connectivity status
- ✅ Response time metrics
- ✅ Memory usage statistics
- ✅ System performance metrics

### Detailed Metrics - `/api/metrics`  
```bash
curl http://localhost:3000/api/metrics
```
Provides comprehensive application metrics:
- 📈 Database statistics and connection pool
- 📈 Memory usage (heap used/total)
- 📈 CPU load averages
- 📈 Available API endpoints
- 📈 System resource utilization

### Simple Status - `/api/status`
```bash
curl http://localhost:3000/api/status
```
Basic uptime status for simple monitoring checks.

### Zabbix Integration
The Docker setup includes a complete Zabbix monitoring stack:
- **Zabbix Web Interface**: http://localhost:8080 (Admin/zabbix)
- **Automatic Host Discovery**: Pre-configured for container monitoring
- **Health Monitoring**: Tracks API response times and availability
- **Resource Monitoring**: Memory usage, CPU load, database performance
- **Alert Configuration**: Ready for email/SMS notifications

See `MONITORING.md` for complete setup instructions.

## 🛠 API Endpoints

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

### Demo/Test Credentials

For testing purposes, you can create an account with these credentials:
- **Email**: `demo@freelancetracker.com`
- **Password**: `password123`

Or use any email/password combination when registering - the system will create a new account for you.

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

## 🏗 Project Architecture

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

### Available Scripts

```bash
# Development
npm run dev              # Start backend with nodemon
ng serve                 # Start Angular development server

# Testing
npm test                 # Run Jest tests
npm run test:watch       # Run tests in watch mode
ng test                  # Run Angular/Karma tests

# Building
ng build                 # Build Angular application
npm run build            # Build for development
npm run watch            # Build and watch for changes

# Linting
npm run lint             # Lint code with Angular ESLint
```

### Docker Development Workflow

```bash
# Start full development stack
docker-compose up -d

# View logs
docker-compose logs -f freelance-app
docker-compose logs -f mongodb

# Restart after code changes
docker-compose up --build -d freelance-app

# Run shell in container for debugging
docker exec -it freelance-app sh

# Clean up
docker-compose down
docker-compose down -v  # Remove volumes too
```

### Building for Production

#### Traditional Deployment
```bash
# Build Angular app
ng build --configuration production

# Set environment variables
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri
export JWT_SECRET=your-secure-jwt-secret

# Start production server
npm start
```

#### Docker Production Deployment
```bash
# Build production image
docker build -t freelance-time-tracker .

# Run production container
docker run -d \
  --name freelance-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-jwt-secret \
  freelance-time-tracker
```

## 🤝 Contributing

We welcome contributions to the FreelanceTimeTracker project!

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Run tests: `npm test` and `ng test`  
5. Test with Docker: `docker-compose up --build -d`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards
- Use Prettier for code formatting
- Follow Angular style guide for frontend components
- Include tests for new functionality
- Update documentation for API changes
- Ensure Docker builds succeed

## 🔧 Troubleshooting

### Common Issues

**Application not starting:**
- Check Node.js version (requires v20+)
- Verify MongoDB is running: `docker ps | grep mongodb`
- Check environment variables in `.env` file

**Docker issues:**
- Clean up containers: `docker-compose down -v`
- Rebuild images: `docker-compose build --no-cache`
- Check Docker logs: `docker-compose logs [service-name]`

**Frontend build errors:**
- Clear Angular cache: `ng cache clean`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Angular CLI version: `ng version`

**Database connection errors:**
- Verify MongoDB URI format in environment variables
- Check MongoDB authentication credentials
- Test connection: `curl http://localhost:3000/api/health`

## 📚 Additional Resources

- **Monitoring Guide**: See `MONITORING.md` for complete Zabbix setup
- **API Documentation**: Available at `http://localhost:3000/api` when running
- **Docker Compose Reference**: Multi-service configuration with monitoring
- **Angular 20 Documentation**: [Official Angular Docs](https://angular.io/docs)
- **MongoDB Best Practices**: [MongoDB Documentation](https://docs.mongodb.com/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Issues

- **Create an Issue**: [GitHub Issues](https://github.com/your-username/FreelanceTimeTracker/issues)
- **Documentation**: Check `MONITORING.md` for deployment help
- **Community**: Star the repo if you find it useful!

---

## 🏆 Project Highlights

✨ **Modern Stack**: Angular 20 + Node.js 20 + MongoDB 7  
🐳 **Docker Ready**: Full containerization with monitoring  
📊 **Production Monitoring**: Zabbix integration with health checks  
🔐 **Security First**: JWT authentication, CORS, Helmet protection  
📱 **Responsive Design**: Works on desktop, tablet, and mobile  
⚡ **Performance Optimized**: Lazy loading, caching, and efficient queries  
🧪 **Well Tested**: Jest + Karma testing frameworks included  

**Stack to the Future - Freelance Time Tracker**  
*Professional time tracking for modern freelancers*
