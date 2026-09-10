'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Initialize Service Role Admin Client (bypasses RLS safely on the server)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function recordContribution(data: {
  member_id: string;
  week_id: number;
  amount_paid: number;
  mpesa_receipt_number?: string;
}) {
  // 1. Validate the active admin session using cookies
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return { success: false, message: 'Unauthorized: Session missing. Please log in again.' };
  }

  // 2. Verify admin status in public.members table
  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();

  if (memberError || member?.role !== 'admin') {
    return { success: false, message: 'Unauthorized: Only administrators can record payments.' };
  }

  // 3. Perform write using Service Role
  const { member_id, week_id, amount_paid, mpesa_receipt_number } = data;

  const formattedReceipt = mpesa_receipt_number
    ? mpesa_receipt_number.toUpperCase().trim()
    : null;

  const { error } = await supabaseAdmin.from('contributions').insert({
    member_id,
    week_id,
    amount_paid,
    status: 'PAID',
    mpesa_receipt_number: formattedReceipt,
    paid_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error logging contribution:', error);
    return { success: false, message: error.message };
  }

  // Revalidate cache
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/members');

  return { success: true };
}