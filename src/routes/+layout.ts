import { browser } from '$app/environment';
import { goto } from '$app/navigation';

export const ssr = false;

export async function load({ url }) {
  if (browser) {
    const publicRoutes = ['/login'];
    const isPublicRoute = publicRoutes.includes(url.pathname);
    const apiKey = localStorage.getItem('apiKey');

    console.log('[Layout Load] path:', url.pathname, 'apiKey exists:', !!apiKey, 'isPublic:', isPublicRoute);

    // Redirect to login if not authenticated and not on public route
    if (!isPublicRoute && !apiKey) {
      console.log('[Layout Load] Redirecting to /login');
      throw goto('/login', { replaceState: true });
    }

    // Redirect to dashboard if authenticated and on login page
    if (isPublicRoute && apiKey) {
      console.log('[Layout Load] Already authenticated, redirecting to /');
      throw goto('/', { replaceState: true });
    }
  }

  return {};
}
