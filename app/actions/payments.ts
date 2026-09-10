// app/actions/payments.ts
'use server';

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
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
  status?: string;
}

// Service Role Client to safely bypass RLS policies on the server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Server Action: Record a new payment (Admin Restricted)
 */
export async function recordPayment(payload: RecordPaymentPayload) {
  // 1. Validate session via browser cookies
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

  const {
    data: { user },
    error: authError,
  } = await supabaseAuth.auth.getUser();

  if (authError || !user) {
    return {
      success: false,
      error: 'Unauthorized: Session missing or invalid. Please log in again.',
    };
  }

  // 2. Verify Admin Status in members table using Service Role
  const { data: member, error: memberError } = await supabaseAdmin
    .from('members')
    .select('role')
    .eq('id', user.id)
    .single();

  if (memberError || member?.role?.toLowerCase() !== 'admin') {
    return {
      success: false,
      error: 'Unauthorized: Only administrators can record payments.',
    };
  }

  // 3. Validate Input Payload
  if (!payload.member_id || !payload.week_id || !payload.amount_paid) {
    return {
      success: false,
      error: 'Missing required payment details (member, week, or amount).',
    };
  }

  // 4. Map any incoming status payload to valid DB Enum values ('PAID', 'PENDING', 'OVERDUE')
  const rawStatus = (payload.status || '').toUpperCase().trim();
  let validStatus: 'PAID' | 'PENDING' | 'OVERDUE' = 'PAID';

  if (rawStatus === 'PENDING') {
    validStatus = 'PENDING';
  } else if (rawStatus === 'OVERDUE') {
    validStatus = 'OVERDUE';
  }

  try {
    // 5. Insert Contribution Record into Supabase using Service Role
    const { data, error } = await supabaseAdmin
      .from('contributions')
      .insert([
        {
          member_id: payload.member_id,
          week_id: payload.week_id,
          amount_paid: payload.amount_paid,
          mpesa_receipt_number: payload.mpesa_receipt_number
            ? payload.mpesa_receipt_number.toUpperCase().trim()
            : null,
          status: validStatus,
          paid_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting payment:', error.message);
      return { success: false, error: error.message };
    }

    // 6. Revalidate cache for real-time updates
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/members');

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
    let query = supabaseAdmin
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