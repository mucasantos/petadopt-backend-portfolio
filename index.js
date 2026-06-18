const express = require('express');
const cors = require('cors');
const UserRoutes = require('./routes/UserRoutes');
const PetRoutes = require('./routes/PetRoutes');
const AdminRoutes = require('./routes/AdminRoutes');

require('dotenv').config();

const app = express();
app.set('trust proxy', true);
const port = process.env.PORT; // Port assigned by hosting provider or PM2

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");
const helmet = require("helmet");
const cookieParser = require('cookie-parser');

// Configure secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Serve static assets from public folder
app.use(express.static('public'));

// Configure EJS view engine
app.set('view engine', 'ejs');
app.set('views', './views');

const AdminViewRoutes = require('./routes/AdminViewRoutes');

// API routes registration
app.use('/user', UserRoutes);
app.use('/pet', PetRoutes);
app.use('/admin', AdminRoutes);
app.use('/admin-panel', AdminViewRoutes);

// Configure dynamic Swagger API documentation
app.use("/docs", swaggerUi.serve, (req, res, next) => {
  const dynamicSwagger = { ...swaggerFile };
  dynamicSwagger.host = req.get('host');
  dynamicSwagger.schemes = [req.headers['x-forwarded-proto'] || req.protocol];
  req.swaggerDoc = dynamicSwagger;
  next();
}, swaggerUi.setup());

// Handle undefined routes (404)
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Please verify the request body syntax.'
    });
  }
  
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

// Start application listener
if (require.main === module) {
  app.listen(port, function(){  
    console.info(`Server running on port ${port}`);
  });
}

module.exports = app;