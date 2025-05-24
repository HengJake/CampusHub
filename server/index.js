const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

// Serve a simple admin interface at root
app.get('/', (req, res) => {
  res.send(`
  niggers
  `);
});

// API endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'active',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    health: 'OK',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});