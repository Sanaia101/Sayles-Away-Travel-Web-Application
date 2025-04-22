const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/destination-weddings', (req, res) => res.render('destination-weddings'));
app.get('/group-travel-services', (req, res) => res.render('group-travel-services'));
app.get('/excursions', (req, res) => res.render('excursions'));
app.get('/make-payment', (req, res) => res.render('make-payment'));
app.get('/terms-of-service', (req, res) => res.render('terms-of-service'));
app.get('/privacy-policy', (req, res) => res.render('privacy-policy'));
app.get('/contact', (req, res) => res.render('contact'));
app.get('/travel-inquiry-form', (req, res) => res.render('travel-inquiry-form'));

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});