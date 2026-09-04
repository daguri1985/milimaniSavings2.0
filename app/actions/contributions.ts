'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function recordContribution(data: {
  member_id: string;
  week_id: number;
  amount_paid: number;
  mpesa_receipt_number?: string;
}) {
  const { member_id, week_id, amount_paid, mpesa_receipt_number } = data;

  const formattedReceipt = mpesa_receipt_number
    ? mpesa_receipt_number.toUpperCase().trim()
    : null;

  // Insert a new record for every payment attempt
  const { error } = await supabase.from('contributions').insert({
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

  // Instantly update the cached dashboard pages
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/members');

  return { success: true };
}