// This file configures the initialization of Sentry on the server side.
// The config you add here will be used whenever the server handles a request.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: process.env.NODE_ENV === 'development',

  beforeSend(event, hint) {
    // Don't send sensitive data
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    if (event.request?.headers) {
      // Keep only non-sensitive headers
      const allowedHeaders = ['content-type', 'user-agent', 'referer'];
      Object.keys(event.request.headers).forEach(key => {
        if (!allowedHeaders.includes(key.toLowerCase()) && event.request?.headers) {
          delete event.request.headers[key];
        }
      });
    }
    return event;
  },
});