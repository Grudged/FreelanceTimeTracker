# FreelanceTimeTracker - Full Docker Stack with Zabbix Monitoring

## Overview
This document describes the complete containerized setup including the FreelanceTimeTracker application, MongoDB database, and Zabbix monitoring stack.

## 🚀 Quick Start

### 1. Start Complete Stack
```bash
docker-compose up -d
```

This starts:
- **FreelanceTimeTracker App** (http://localhost:3000)
- **MongoDB Database** (internal networking)
- **Zabbix Server** (monitoring backend)
- **Zabbix Web Interface** (http://localhost:8080)
- **Zabbix Agent** (host monitoring)
- **PostgreSQL** (Zabbix database)

### 2. Access Applications
- **App**: http://localhost:3000
- **Zabbix**: http://localhost:8080 (Admin/zabbix)

## 📊 Monitoring Endpoints

Your application now provides three monitoring endpoints:

### Health Check - `/api/health`
```bash
curl http://localhost:3000/api/health
```
**Container URL for Zabbix:** `http://freelance-app:3000/api/health`
Returns comprehensive health information including:
- API status
- Database connectivity 
- Response time
- Memory usage
- System metrics

### Detailed Metrics - `/api/metrics`
```bash
curl http://localhost:3000/api/metrics
```
**Container URL for Zabbix:** `http://freelance-app:3000/api/metrics`
Returns detailed application metrics for monitoring:
- Database statistics
- Memory and CPU usage
- System load averages
- Available endpoints

### Simple Status - `/api/status`
```bash
curl http://localhost:3000/api/status
```
**Container URL for Zabbix:** `http://freelance-app:3000/api/status`
Returns basic uptime status for simple monitoring.

## 🔧 Configuring Zabbix Monitoring

### Step 1: Import Template (Optional)
1. In Zabbix web interface, go to **Configuration → Templates**
2. Click **Import**
3. Upload the `zabbix-config.json` file
4. Configure the template for your host

### Step 2: Manual Setup (Recommended)
1. Go to **Configuration → Hosts**
2. Click **Create host**
3. Fill in:
   - **Host name**: `FreelanceTimeTracker-Local`
   - **Visible name**: `FreelanceTimeTracker Application`
   - **Groups**: Create new group "Applications"

### Step 3: Add HTTP Monitoring Items
1. In your host, go to **Items** tab
2. Click **Create item** for each monitoring check:

#### API Health Check
- **Name**: API Health Status
- **Type**: HTTP agent
- **Key**: `api.health.status`
- **URL**: `http://freelance-app:3000/api/health`
- **Request type**: GET
- **Update interval**: 60s
- **Preprocessing**: JSONPath `$.status`

#### Response Time Monitoring
- **Name**: API Response Time
- **Type**: HTTP agent  
- **Key**: `api.response.time`
- **URL**: `http://freelance-app:3000/api/health`
- **Request type**: GET
- **Update interval**: 60s
- **Preprocessing**: JSONPath `$.responseTime`
- **Units**: ms

#### Memory Usage
- **Name**: Application Memory Usage
- **Type**: HTTP agent
- **Key**: `app.memory.used`
- **URL**: `http://freelance-app:3000/api/metrics`
- **Request type**: GET
- **Update interval**: 120s
- **Preprocessing**: JSONPath `$.application.memory.heapUsed`
- **Units**: B

#### Database Status
- **Name**: Database Connection Status
- **Type**: HTTP agent
- **Key**: `db.connection.status`
- **URL**: `http://freelance-app:3000/api/health`
- **Request type**: GET  
- **Update interval**: 120s
- **Preprocessing**: JSONPath `$.database.connected`

### Step 4: Create Triggers
1. Go to **Configuration → Hosts → [Your Host] → Triggers**
2. Click **Create trigger** for each alert:

#### API Down Alert
- **Name**: FreelanceTimeTracker API is down
- **Expression**: `last(/FreelanceTimeTracker-Local/api.health.status)<>"OK"`
- **Severity**: High

#### High Response Time Alert
- **Name**: API response time is high  
- **Expression**: `last(/FreelanceTimeTracker-Local/api.response.time)>5000`
- **Severity**: Warning

#### Database Connection Alert
- **Name**: Database connection failed
- **Expression**: `last(/FreelanceTimeTracker-Local/db.connection.status)=0`
- **Severity**: High

#### High Memory Usage Alert
- **Name**: High memory usage
- **Expression**: `last(/FreelanceTimeTracker-Local/app.memory.used)>100000000`
- **Severity**: Warning

## 📈 What You'll Monitor

### Application Health
- ✅ API responsiveness
- ✅ Response times
- ✅ Database connectivity
- ✅ Memory usage
- ✅ System load

### Key Metrics
- **Uptime**: How long the application has been running
- **Response Time**: API endpoint response times
- **Memory Usage**: Heap memory consumption
- **Database**: Connection status and query performance
- **System Load**: CPU and memory usage

## 🔧 Management Commands

### Complete Stack
```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f freelance-app
docker-compose logs -f zabbix-web

# Restart specific service
docker-compose restart freelance-app
docker-compose restart zabbix-web

# Rebuild and restart app after code changes
docker-compose up --build -d freelance-app
```

### Application Testing
```bash
# Check health
curl http://localhost:3000/api/health

# Check metrics
curl http://localhost:3000/api/metrics

# Test from inside Docker network (for debugging)
docker exec -it zabbix-server curl http://freelance-app:3000/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Zabbix web interface not accessible**
   - Check containers: `docker ps | grep zabbix`
   - Check logs: `docker-compose -f docker-compose.zabbix.yml logs zabbix-web`

2. **Application monitoring not working**
   - Verify app is running: `curl http://localhost:3000/api/health`
   - Check server logs for errors

3. **Database monitoring fails**
   - Ensure MongoDB container is running: `docker ps | grep mongodb`
   - Test database connection in health endpoint

### Logs
- **Application**: Check console output when running `npm start`
- **Zabbix**: `docker-compose -f docker-compose.zabbix.yml logs`
- **MongoDB**: `docker logs mongodb`

## 📊 Dashboard Creation

In Zabbix, create custom dashboards by:
1. Go to **Monitoring → Dashboard**
2. Click **Create dashboard**
3. Add widgets for:
   - API response time graphs
   - Memory usage trends  
   - Database connection status
   - System load averages

## 🔐 Security Notes

- Change default Zabbix admin password after setup
- Consider restricting access to monitoring endpoints in production
- Use HTTPS for production Zabbix deployments
- Secure MongoDB with authentication in production

## 📞 Next Steps

1. Set up email/SMS notifications for critical alerts
2. Create custom dashboards for business metrics
3. Add frontend performance monitoring
4. Configure log file monitoring
5. Set up automated reporting