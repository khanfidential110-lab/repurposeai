// This file configures the initialization of Sentry on the Edge.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1,
    debug: false,
});
