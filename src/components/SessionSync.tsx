'use client';

import { useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

function writeCookies(session: Session | null) {
  if (session?.access_token) {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `sb-access-token=${session.access_token}; path=/; SameSite=Lax${secure}`;
    document.cookie = `sb-refresh-token=${session.refresh_token ?? ''}; path=/; SameSite=Lax${secure}`;
  } else {
    document.cookie = 'sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

/**
 * Syncs Supabase auth session to first-party cookies so
 * server-side API routes can authenticate the user.
 * Uses the app's shared Supabase client (src/lib/supabase.ts).
 */
export default function SessionSync() {
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => writeCookies(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => writeCookies(session));
    return () => subscription.unsubscribe();
  }, []);

  return null;
}
