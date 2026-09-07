// lib/auth.ts
'use server';

import { createClient } from '@/lib/supabase-server';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return null;

  // Match the auth user to your members table via email or auth_id
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('phone_number', user.phone) // or .eq('auth_id', user.id) / .eq('email', user.email)
    .single();

  const role = member?.role?.toLowerCase() || 'member';

  return {
    id: user.id,
    email: user.email || '',
    role,
    isAdmin: role === 'admin' || role === 'super_admin',
  };
}