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
  email?: string | null;
}

export interface GetMembersResult {
  members: MemberWithStats[];
  isAdmin: boolean;
}

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
  email?: string | null;
  contributions: ContributionRow[] | null;
}

export interface UserParam {
  email?: string | null;
  phone?: string | null;
  app_role?: string | null;
  user_role?: string | null;
}

export async function getMembers(
  searchTerm = '',
  currentUser?: UserParam | null
): Promise<GetMembersResult> {
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
        email,
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

    if (error) {
      console.error('Error fetching members:', error.message);
      return { members: [], isAdmin: false };
    }

    const membersData = (data as unknown as MemberRow[]) || [];

    const members: MemberWithStats[] = membersData.map((member) => {
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
        email: member.email || null,
        total_contributions: totalContributions,
      };
    });

    // Determine Admin Status using passed currentUser metadata or matching database record
    let isAdmin = false;

    if (currentUser) {
      // Check explicit metadata roles first
      if (
        currentUser.app_role?.toLowerCase() === 'admin' ||
        currentUser.user_role?.toLowerCase() === 'admin'
      ) {
        isAdmin = true;
      } else {
        const userEmail = currentUser.email?.trim().toLowerCase();
        const userPhoneDigits = (currentUser.phone || '').replace(/\D/g, '');

        const matchingMember = members.find((m) => {
          const memberEmail = m.email?.trim().toLowerCase();
          const memberPhoneDigits = m.phone_number?.replace(/\D/g, '') || '';

          const emailMatch = Boolean(userEmail && memberEmail && userEmail === memberEmail);
          const phoneMatch = Boolean(
            userPhoneDigits.length >= 8 &&
            memberPhoneDigits.length >= 8 &&
            memberPhoneDigits.endsWith(userPhoneDigits.slice(-8))
          );

          return emailMatch || phoneMatch;
        });

        if (matchingMember?.role?.toLowerCase() === 'admin') {
          isAdmin = true;
        }
      }
    }

    return { members, isAdmin };
  } catch (err) {
    console.error('Unexpected error fetching members:', err);
    return { members: [], isAdmin: false };
  }
}