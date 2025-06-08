require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const axios = require('axios');
const path = require('path');
const connectDB = require('./db');

// DB connection
connectDB();

const app = express();
const PORT = process.env.PORT || 8080;

// Models
const Request = require('./models/Request');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(session({ 
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Passport Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/auth/google/callback",
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// Helper function for Intercom headers
const getIntercomHeaders = () => ({
  'Authorization': `Bearer ${process.env.INTERCOM_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  'Intercom-Version': '2.10'
});

// Improved Intercom Integration
const sendToIntercom = async ({ name, email, message, userId }) => {
  try {
    let contact;
    try {
      const searchRes = await axios.post('https://api.intercom.io/contacts/search', {
        query: {
          field: 'email',
          operator: '=',
          value: email
        }
      }, { headers: getIntercomHeaders() });
      
      contact = searchRes.data.data[0];
    } catch (searchError) {
      console.log('Contact search failed, will create new contact');
    }

    if (!contact) {
      const createRes = await axios.post('https://api.intercom.io/contacts', {
        role: 'user',
        email,
        name,
        external_id: userId.toString() 
      }, { headers: getIntercomHeaders() });
      contact = createRes.data;
    }

    const conversationRes = await axios.post('https://api.intercom.io/conversations', {
      from: { type: 'user', id: contact.id },
      body: message,
      assign_to: process.env.INTERCOM_ADMIN_ID || 'admin' 
    }, { headers: getIntercomHeaders() });

    return {
      contactId: contact.id,
      conversationId: conversationRes.data.id
    };

  } catch (error) {
    console.error('Intercom error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return null;
  }
};

// Routes
app.get('/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', {
    successRedirect: process.env.FRONTEND_SUCCESS_REDIRECT || 'http://localhost:3000/dashboard',
    failureRedirect: process.env.FRONTEND_FAILURE_REDIRECT || '/login'
  })
);

app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Request Handling
app.post('/api/requests', async (req, res) => {
  const { category, comment, user } = req.body;

  try {
    const newRequest = new Request({
      category,
      comment,
      user: {
        id: user.id,
        name: user.displayName || user.name?.givenName,
        email: user.emails?.[0]?.value
      },
      status: 'open'
    });

    await newRequest.save();

    const intercomResult = await sendToIntercom({
      name: user.displayName || user.name?.givenName || "Guest",
      email: user.emails?.[0]?.value || 'no-email@example.com',
      message: `${category}: ${comment}`,
      userId: user.id
    });

    if (intercomResult) {
      await Request.findByIdAndUpdate(newRequest._id, {
        intercomContactId: intercomResult.contactId,
        intercomConversationId: intercomResult.conversationId
      });
    }

    res.json({ 
      success: true,
      requestId: newRequest._id,
      intercomSuccess: !!intercomResult
    });

  } catch (err) {
    console.error("Request handling error:", err);
    res.status(500).json({ 
      error: "Server error",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/api/requests/:category', async (req, res) => {
  try {
    const requests = await Request.find({ 
      category: req.params.category,
      'user.id': req.user.id 
    }).sort({ createdAt: -1 });
    
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    dbState: mongoose.connection.readyState,
    intercom: process.env.INTERCOM_ACCESS_TOKEN ? 'configured' : 'not configured'
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});