export function createPageUrl(nameOrQuery) {
  // Accepts either a page key like 'Discovery' or a string containing
  // 'BarberProfile?id=123'. Returns a route path the app uses.
  if (!nameOrQuery) return '/';
  if (typeof nameOrQuery !== 'string') return '/';

  if (nameOrQuery.startsWith('BarberProfile')) {
    const idx = nameOrQuery.indexOf('?');
    return '/barber-profile' + (idx >= 0 ? nameOrQuery.slice(idx) : '');
  }

  const map = {
    Discovery: '/discover',
    MyProfile: '/my-profile',
    Favorites: '/favorites',
    BarberOnboarding: '/barber-onboarding',
    ManageMyBarberProfile: '/manage-barber',
    Admin: '/admin',
  };

  return map[nameOrQuery] || ('/' + String(nameOrQuery).toLowerCase());
}

export default createPageUrl;
