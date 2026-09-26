import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { adminRouter } from './server/adminRoutes';
import { platformRouter } from './server/platformRoutes';
import { stopwatchRouter } from './server/stopwatchRoutes';
import { academicRouter } from './server/academicRoutes';
import { adminStore, DAILY_RESET_TIMEZONE, getSecondsUntilMidnightInTimezone } from './server/adminStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function scheduleDailyLeaderboardReset() {
  const tz = DAILY_RESET_TIMEZONE;
  const delay = Math.max(1000, getSecondsUntilMidnightInTimezone(tz) * 1000 + 1000);
  setTimeout(() => {
    try {
      adminStore.checkAndTriggerDailyReset();
      const tz = DAILY_RESET_TIMEZONE;
      const today = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(new Date());
      if (today === 'Mon') adminStore.finalizeWeeklyLeague(new Date());
    } catch (error) {
      console.error('Daily leaderboard reset failed:', error);
    }
    scheduleDailyLeaderboardReset();
  }, delay);
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON and URL-encoded body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads directory for notes images
  const uploadsDir = path.resolve(__dirname, 'data/uploads');
  app.use('/api/uploads', express.static(uploadsDir));

  // Request logger in dev
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
      if (req.url.startsWith('/api/')) {
        console.log(`[API] ${req.method} ${req.url}`);
      }
      next();
    });
  }

  // Mount API Routers
  app.use('/api/admin', adminRouter);
  app.use('/api/platform', platformRouter);
  app.use('/api/stopwatch', stopwatchRouter);
  app.use('/api/academic', academicRouter);

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Dynamic import to keep Vite as dev dependency
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static build from dist directory
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    scheduleDailyLeaderboardReset();
    console.log(`🚀 NOTIQ Full-Stack Engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
