'use server';

import { supabase } from '@/lib/supabase';
import { Member, Contribution, Week } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
  // 1. Fetch total members count
  const { count: totalMembers } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true });

  // 2. Fetch total funds collected
  const { data: contributions } = await supabase
    .from('contributions')
    .select('amount_paid, status');

  const totalSaved = contributions
    ? contributions
        .filter((c) => c.status === 'PAID')
        .reduce((sum, c) => sum + Number(c.amount_paid), 0)
    : 0;

  const pendingPayments = contributions
    ? contributions.filter((c) => c.status === 'PENDING').length
    : 0;

  // Total target calculation: 13 members * 22 weeks * KSh 100 = KSh 28,600
  const totalTarget = (totalMembers || 13) * 22 * 100;
  const progressPercentage = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return {
    totalMembers: totalMembers || 0,
    totalSaved,
    totalTarget,
    pendingPayments,
    progressPercentage,
  };
}

export async function getRecentTransactions(limit = 7) {
  try {
    const { data, error } = await supabase
      .from('contributions')
      .select(`
        id,
        amount_paid,
        status,
        mpesa_receipt_number,
        paid_at,
        created_at,
        member:members!member_id (
          full_name,
          phone_number
        ),
        week:weeks!week_id (
          id,
          month_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Supabase query error:', error);
      // Fallback: If relational joins fail, attempt fetching without joins to verify rows exist
      const fallback = await supabase
        .from('contributions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
        
      return fallback.data || [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error fetching transactions:', err);
    return [];
  }
}

export async function getMembersList() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }

  return data as Member[];
}

export async function recordPayment(formData: FormData) {
  // ... insert logic ...

  const { error } = await supabase.from('savings_records').insert({
    member_id: formData.get('member_id'),
    week_id: formData.get('week_id'),
    amount_paid: Number(formData.get('amount_paid')),
    mpesa_receipt_number: formData.get('mpesa_receipt_number'),
    status: 'verified',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Clear cache for dashboard so the new row renders instantly
  revalidatePath('/dashboard');

  return { success: true };
}