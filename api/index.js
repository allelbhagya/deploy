const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Logs = require('./models/Logs');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const upload = multer();
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const jwt = require('jsonwebtoken'); // Import JWT

const app = express();

const salt = bcrypt.genSaltSync(10);
const secret = 'asdfe45we45w345wegw345werjktjwertkj';

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(cookieParser());
app.use(
  expressSession({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://bsp:bsp@bsp.liemt4a.mongodb.net/?retryWrites=true&w=majority');

app.get('/', (req, res) => {
  res.send('Hello, this is the root endpoint!');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userDoc = await User.create({
      username,
      password: bcrypt.hashSync(password, salt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(400).json(e);
  }
});


passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });

      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Middleware to ensure that the user is authenticated
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, continue to the next middleware or route handler
  } else {
    res.status(401).json({ error: 'Unauthorized' }); // User is not authenticated, return 401 Unauthorized
  }
};


app.post('/login', passport.authenticate('local'), (req, res) => {
  const token = jwt.sign({ id: req.user._id, username: req.user.username }, secret);
  res.cookie('token', token, { httpOnly: true });
  res.json({ id: req.user._id, username: req.user.username });
});

app.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error during logout:', err);
      return res.status(500).json({ error: 'Internal server error during logout' });
    }
    // Clear the session data
    req.session.destroy();
    // Clear the token cookie
    res.clearCookie('token');
    // Send a successful response
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/profile', ensureAuthenticated, (req, res) => {
  res.json({ id: req.user._id, username: req.user.username });
});


app.post('/log', upload.none(), ensureAuthenticated, async (req, res) => {
  try {
    const { createdAt, time, duration, region, sensorID, stoppage, profile, comment, measure } = req.body;
    const logCreatedAt = createdAt || new Date().toISOString();

    const logDoc = await Logs.create({
      createdAt: logCreatedAt,
      time,
      duration,
      region,
      sensorID,
      stoppage,
      profile,
      comment,
      measure,
      author: req.user._id,
    });

    res.json(logDoc);
  } catch (error) {
    console.error('Error creating log:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/log', ensureAuthenticated, async (req, res) => {
  res.json(
    await Logs.find()
      .populate('author', ['username'])
      .sort({ createdAt: -1 })
  );
});

app.delete('/log/:id', ensureAuthenticated, async (req, res) => {
  const logId = req.params.id;
  try {
    const deletedLog = await Logs.findByIdAndDelete(logId);

    if (deletedLog) {
      res.json({ message: 'Log deleted successfully', log: deletedLog });
    } else {
      res.status(404).json({ message: 'Log not found' });
    }
  } catch (error) {
    console.error('Error deleting log:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/log/:id', ensureAuthenticated, async (req, res) => {
  try {
    const log = await Logs.findById(req.params.id);
    res.json(log);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching log data' });
  }
});

app.put('/log/:id', ensureAuthenticated, async (req, res) => {
  const logId = req.params.id;
  const updatedLog = req.body;

  try {
    const updatedLogResult = await Logs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedLogResult);
  } catch (error) {
    console.error('Error updating log:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(4000);
