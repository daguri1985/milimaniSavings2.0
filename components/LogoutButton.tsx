'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { LogOut, Loader2 } from 'lucide-react';

interface LogoutButtonProps {
  /** Visual variant: 'button' renders a styled button, 'menuItem' renders a flat dropdown link */
  variant?: 'button' | 'menuItem';
  className?: string;
}

export default function LogoutButton({ 
  variant = 'button', 
  className = '' 
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogout() {
    setLoading(true);
    
    // Sign out from Supabase (clears session and browser cookies)
    await supabase.auth.signOut();

    // Refresh route cache and redirect to login page
    router.push('/login');
    router.refresh();
  }

  if (variant === 'menuItem') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50 ${className}`}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogOut className="h-4 w-4" />
        )}
        <span>{loading ? 'Signing out...' : 'Log out'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50 ${className}`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
      ) : (
        <LogOut className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      )}
      <span>{loading ? 'Logging out...' : 'Logout'}</span>
    </button>
  );
}