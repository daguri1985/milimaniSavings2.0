// app/actions/payments.ts
'use server';

import { getCurrentUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export interface PaymentFilterParams {
  search?: string;
  status?: string;
  weekId?: string;
}

export interface MemberRelation {
  full_name: string;
  phone_number: string;
}

export interface WeekRelation {
  id: number;
  month_name: string;
}

export interface TransactionRecord {
  id: string;
  amount_paid: number;
  status: string;
  mpesa_receipt_number?: string | null;
  paid_at?: string | null;
  created_at: string;
  member?: MemberRelation | MemberRelation[] | null;
  week?: WeekRelation | WeekRelation[] | null;
}

export interface RecordPaymentPayload {
  member_id: string;
  week_id: number;
  amount_paid: number;
  mpesa_receipt_number?: string;
  status?: 'verified' | 'pending' | 'failed';
}

/**
 * Server Action: Record a new payment (Admin Restricted)
 */
export async function recordPayment(payload: RecordPaymentPayload) {
  // 1. Authenticate & Verify Admin Role
  const user = await getCurrentUser();

  if (!user || !user.isAdmin) {
    return {
      success: false,
      error: 'Unauthorized: Only administrators can record payments.',
    };
  }

  // 2. Validate Input Payload
  if (!payload.member_id || !payload.week_id || !payload.amount_paid) {
    return {
      success: false,
      error: 'Missing required payment details (member, week, or amount).',
    };
  }

  try {
    // 3. Insert Contribution Record into Supabase
    const { data, error } = await supabase
      .from('contributions')
      .insert([
        {
          member_id: payload.member_id,
          week_id: payload.week_id,
          amount_paid: payload.amount_paid,
          mpesa_receipt_number: payload.mpesa_receipt_number || null,
          status: payload.status || 'verified',
          paid_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting payment:', error.message);
      return { success: false, error: error.message };
    }

    // 4. Revalidate cache for real-time UI updates
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/payments');

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error recording payment:', err);
    return { success: false, error: 'Internal server error while saving payment.' };
  }
}

/**
 * Fetch Filtered Payments List
 */
export async function getFilteredPayments(filters: PaymentFilterParams = {}) {
  try {
    let query = supabase
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
      .order('created_at', { ascending: false });

    // Filter by Status
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    // Filter by Specific Week
    if (filters.weekId && filters.weekId !== 'all') {
      query = query.eq('week_id', Number(filters.weekId));
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payments:', error.message);
      return [];
    }

    // Cast raw response to TransactionRecord array safely
    const records = (data as unknown as TransactionRecord[]) || [];

    // Client-side search filter
    if (filters.search && filters.search.trim() !== '') {
      const term = filters.search.toLowerCase().trim();
      return records.filter((item) => {
        const memberObj = Array.isArray(item.member)
          ? item.member[0]
          : item.member;

        return (
          memberObj?.full_name?.toLowerCase().includes(term) ||
          memberObj?.phone_number?.includes(term) ||
          item.mpesa_receipt_number?.toLowerCase().includes(term)
        );
      });
    }

    return records;
  } catch (err) {
    console.error('Unexpected error fetching payments:', err);
    return [];
  }
}