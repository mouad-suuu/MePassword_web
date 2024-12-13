import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Public routes that don't require any authentication
const publicRoutes = createRouteMatcher([
  '/',                    // Landing page
  '/(auth)/(.*)',        // Auth routes
  '/api/webhook/(.*)'    // Webhooks if needed
])

// Routes that require session-based auth (web UI)
const sessionProtectedRoutes = createRouteMatcher([
  '/(protected)/(.*)',   // Protected UI routes
  '/dashboard/(.*)'      // Dashboard routes
])

// Routes that require either JWT (extension) or session auth (web)
const apiRoutes = createRouteMatcher([
  '/api/((?!webhook).)*' // All API routes except webhooks
])

export default clerkMiddleware((auth, req) => {
  // Allow public routes
  if (publicRoutes(req)) {
    return;
  }

  // For API routes, check either JWT or session
  if (apiRoutes(req)) {
    const token = auth.protect();
    if (!token) {
      return new Response('Unauthorized', { status: 401 });
    }
    return;
  }

  // For dashboard/protected routes, require session-based auth
  if (sessionProtectedRoutes(req)) {
    const session = auth.protect();
    if (!session) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/']
}