// Import and initialize Sentry first, before any other modules
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

Sentry.init({
  dsn: "https://94d0f3b4de91473f1dfbd671789f866f@o4510291132219392.ingest.us.sentry.io/4510410075406346",

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,

  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,

  integrations: [
    nodeProfilingIntegration(),
  ],
});

const express = require('express');
const UserRoutes = require('./routes/UserRoutes')
const authRoute = require('./routes/authRoutes')
const ClassRoutes = require('./routes/ClassRoutes')
const CourseRoutes = require('./routes/CourseRoutes')
const ScheduleRoutes = require('./routes/ScheduleRoutes')
const ClassroomRoutes = require('./routes/ClassroomRoutes')
const DebugRoutes = require('./routes/DebugRoutes')
const path = require('path')
const app = express();
const port = process.env.PORT || 3001;
const auth = require('./middlewares/auth')
const cookieParser = require('cookie-parser');
const { Schedule } = require('./db/Schedule');

// Sentry middleware for Express - must be first
// The request handler must be the first middleware on the app
app.use((req, res, next) => {
    Sentry.setContext("request", {
        url: req.url,
        method: req.method,
    });
    next();
});

app.use(cookieParser())

function logger(req, res, next){
    console.log("log ",req.url);
    next()
}

console.log(__dirname);

app.use(express.static(path.join(__dirname, 'public')))

//we can read the body through req.body
app.use(express.json())

app.get('/', (req,res)=>{
    res.send("hello")
})

//app.use('/api/User', logger,auth.validateToken,  UsertRoutes )
app.use('/api/User',  logger,UserRoutes )
app.use('/api/login', logger, authRoute )
app.use('/api/Class', logger, ClassRoutes )
app.use('/api/Course', logger, CourseRoutes )
app.use('/api/Schedule', logger, ScheduleRoutes )
app.use('/api/Classroom', logger, ClassroomRoutes )
app.use('/api/debug', logger, DebugRoutes )

// Sentry error handler middleware - must be registered after all controllers
app.use((err, req, res, next) => {
    // Capture the error in Sentry
    Sentry.captureException(err);

    console.error('Error caught by Express error handler:', err);
    res.status(err.statusCode || 500).json({
        error: err.name || 'Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

//app.use('/api/users', logger,  userRoutes )
//app.use('/api/images', logger,  imageRoutes )
app.listen(port, ()=>console.log("running in port "+port) )
