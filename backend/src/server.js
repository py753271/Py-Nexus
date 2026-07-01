require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middlewares/errorHandlers');

// Security check: Fail securely if JWT_SECRET is not configured in production
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'py_nexus_secret_key')) {
    console.error('FATAL ERROR: A secure JWT_SECRET must be configured in production environment.');
    process.exit(1);
}

// Import routes (we will create these next)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const categoryRoutes = require('./routes/categories');
const enrollmentRoutes = require('./routes/enrollments');
const lessonRoutes = require('./routes/lessons');
const announcementRoutes = require('./routes/announcement');
const forumRoutes = require('./routes/forum');
const reportRoutes = require('./routes/reports');
const articleRoutes = require('./routes/articles');
const aiRoutes = require('./routes/ai');
const analyticsRoutes = require('./routes/analytics');
const organizationRoutes = require('./routes/organization');
const departmentRoutes = require('./routes/department');
const roleRoutes = require('./routes/role');
const mentorRoutes = require('./routes/mentor');
const programRoutes = require('./routes/program');
const lifecycleRoutes = require('./routes/lifecycle');
const attendanceRoutes = require('./routes/attendance');
const taskRoutes = require('./routes/task');
const certificateRoutes = require('./routes/certificate');
const notificationRoutes = require('./routes/notification');

const app = express();
app.set('trust proxy', 1);

// Rate Limiter configuration with development environment bypass
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Higher threshold for local development
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 30, // Higher threshold for authentication in development
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Middlewares
app.use(helmet());

let allowedOrigins = ['http://localhost:5173'];
if (process.env.FRONTEND_URL) {
    let origin = process.env.FRONTEND_URL.trim().replace(/\/$/, "");
    if (!origin.startsWith('http://') && !origin.startsWith('https://')) {
        origin = 'https://' + origin;
    }
    allowedOrigins.push(origin);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Apply global rate limiting to all api calls
app.use('/api', globalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/lifecycles', lifecycleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/notifications', notificationRoutes);

// Root Welcome Route
app.get('/', (req, res) => {
    res.status(200).json({ 
        success: true, 
        message: 'Py Nexus API is LIVE for PostgreSQL.',
        version: '1.0.0',
        documentation: '/api/health'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Py Nexus API is running.' });
});

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`CORS Allowed Origins: ${allowedOrigins.join(', ')}`);
});
