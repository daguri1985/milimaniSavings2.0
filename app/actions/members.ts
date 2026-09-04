'use server';

import { supabase } from '@/lib/supabase';

export interface MemberWithStats {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  total_contributions: number;
}

// Database response type definition to satisfy ESLint
interface ContributionRow {
  amount_paid: number | string | null;
  status?: string | null;
}

interface MemberRow {
  id: string;
  full_name: string;
  phone_number: string;
  role: string | null;
  status: string | null;
  created_at: string;
  contributions: ContributionRow[] | null;
}

export async function getMembers(searchTerm = ''): Promise<MemberWithStats[]> {
  try {
    let query = supabase
      .from('members')
      .select(`
        id,
        full_name,
        phone_number,
        role,
        status,
        created_at,
        contributions (
          amount_paid,
          status
        )
      `)
      .order('full_name', { ascending: true });

    const cleanSearch = searchTerm.trim();
    if (cleanSearch !== '') {
      query = query.or(`full_name.ilike.%${cleanSearch}%,phone_number.ilike.%${cleanSearch}%`);
    }

    const { data, error } = await query;
    console.log('--- DB DEBUG START ---');
console.log('Error:', error);
console.log('Data count:', data?.length);
console.log('Raw Data:', JSON.stringify(data, null, 2));
console.log('--- DB DEBUG END ---');

    if (error) {
      console.error('Error fetching members:', error.message);
      return [];
    }

    const membersData = (data as unknown as MemberRow[]) || [];

    return membersData.map((member) => {
      const rawContributions = Array.isArray(member.contributions)
        ? member.contributions
        : [];

      const totalContributions = rawContributions.reduce((sum, c) => {
        const amount = typeof c.amount_paid === 'number'
          ? c.amount_paid
          : Number(c.amount_paid || 0);

        const statusStr = (c.status || '').toLowerCase();
        const isValid = statusStr === 'verified' || statusStr === 'paid';

        return sum + (isValid ? amount : 0);
      }, 0);

      return {
        id: member.id,
        full_name: member.full_name,
        phone_number: member.phone_number,
        role: member.role || 'Member',
        status: (member.status as 'active' | 'inactive' | 'suspended') || 'active',
        created_at: member.created_at,
        total_contributions: totalContributions,
      };
    });
  } catch (err) {
    console.error('Unexpected error fetching members:', err);
    return [];
  }
}