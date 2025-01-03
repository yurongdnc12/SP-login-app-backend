import { router } from './router.mjs';
import config from './server.mjs';
import Koa from 'koa';
import logger from 'koa-logger';
import session from 'koa-session';
import cors from 'koa2-cors';
import crypto from 'node:crypto';

// Create Koa app
const app = new Koa();

// Dynamic PORT for Render
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Logging middleware for debugging
app.use(async (ctx, next) => {
  console.log(`${ctx.method} ${ctx.url}`);
  await next();
});

// Enable logging and CORS
app.use(logger());

app.use(
  cors({
    origin: 'https://yr-learningmonth24.netlify.app/', // Explicitly allow your frontend URL
    credentials: true, // Allow cookies and credentials
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
  })
);
app.proxy = true; // Trust proxy headers

// Session store to persist session data
function createInMemorySessionStore() {
  const map = new Map();
  return {
    get: (key) => map.get(key),
    set: (key, value) => map.set(key, value),
    destroy: (key) => map.delete(key),
  };
}

// Setup sessions
app.keys = [crypto.randomBytes(8).toString('hex')];
app.use(
  session(
    {
      store: createInMemorySessionStore(),
      sameSite: 'none',
      httpOnly: true,
      // secure: false,
      secure: process.env.NODE_ENV === 'production', // Only secure in production
    },
    app
  )
);

// Routes
app.use(router.routes());
