import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/(auth)/sign-in(.*)',
  '/(auth)/sign-up(.*)',
  '/api/webhook(.*)'
])

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    const userId = auth.protect();
    if (!userId) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return Response.redirect(signInUrl);
    }
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/']
}