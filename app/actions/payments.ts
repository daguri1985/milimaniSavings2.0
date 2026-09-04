// app/actions/payments.ts
'use server';

import { supabase } from '@/lib/supabase';

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