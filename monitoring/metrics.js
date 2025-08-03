const express = require('express');
const mongoose = require('mongoose');
const os = require('os');

/**
 * Enhanced monitoring endpoints for Zabbix integration
 */

// Helper function to get database stats
async function getDatabaseStats() {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      connected: mongoose.connection.readyState === 1,
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      avgObjSize: stats.avgObjSize
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

// Helper function to get application metrics
function getApplicationMetrics() {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    system: {
      loadAverage: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
      platform: os.platform(),
      arch: os.arch()
    }
  };
}

// Enhanced health check endpoint
const healthCheck = async (req, res) => {
  const startTime = Date.now();
  
  try {
    const dbStats = await getDatabaseStats();
    const appMetrics = getApplicationMetrics();
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: dbStats.connected ? 'OK' : 'ERROR',
      message: dbStats.connected 
        ? 'Freelancer Time Tracker API is running' 
        : 'Database connection failed',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      responseTime: responseTime,
      database: dbStats,
      application: appMetrics
    };
    
    res.status(dbStats.connected ? 200 : 503).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

// Detailed metrics endpoint for Zabbix
const detailedMetrics = async (req, res) => {
  try {
    const dbStats = await getDatabaseStats();
    const appMetrics = getApplicationMetrics();
    
    const metrics = {
      timestamp: Date.now(),
      database: dbStats,
      application: appMetrics,
      endpoints: {
        health: '/api/health',
        metrics: '/api/metrics',
        auth: '/api/auth/*',
        projects: '/api/projects/*',
        timeEntries: '/api/timeEntries/*'
      }
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to collect metrics',
      message: error.message
    });
  }
};

// Simple status endpoint for uptime monitoring
const statusCheck = (req, res) => {
  res.json({
    status: 'UP',
    uptime: process.uptime(),
    timestamp: Date.now()
  });
};

module.exports = {
  healthCheck,
  detailedMetrics,
  statusCheck
};