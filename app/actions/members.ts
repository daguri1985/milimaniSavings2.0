'use server';

import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

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

export interface AddMemberInput {
  full_name: string;
  phone_number: string;
  role: string;
  email?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
}

/**
 * Server action to fetch members list and verify admin status
 */
export async function getMembers(
  searchTerm = '',
  currentUser?: UserParam | null
): Promise<GetMembersResult> {
  try {
    const supabase = await createClient();

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

    let isAdmin = false;

    if (currentUser) {
      const appRole = (currentUser.app_role || '').trim().toLowerCase();
      const userRole = (currentUser.user_role || '').trim().toLowerCase();

      if (appRole === 'admin' || userRole === 'admin') {
        isAdmin = true;
      } else {
        const userEmail = currentUser.email?.trim().toLowerCase();
        const userPhoneDigits = (currentUser.phone || '').replace(/\D/g, '');

        let dbAdminMatch = false;

        // Check DB by email
        if (userEmail) {
          const { data: adminByEmail } = await supabase
            .from('members')
            .select('role')
            .ilike('email', userEmail)
            .maybeSingle();

          if (adminByEmail?.role?.trim().toLowerCase() === 'admin') {
            dbAdminMatch = true;
          }
        }

        // Check DB by phone (last 9 digits)
        if (!dbAdminMatch && userPhoneDigits.length >= 9) {
          const last9Digits = userPhoneDigits.slice(-9);
          const { data: adminByPhone } = await supabase
            .from('members')
            .select('role, phone_number')
            .ilike('phone_number', `%${last9Digits}`)
            .maybeSingle();

          if (adminByPhone?.role?.trim().toLowerCase() === 'admin') {
            dbAdminMatch = true;
          }
        }

        isAdmin = dbAdminMatch;
      }
    }

    return { members, isAdmin };
  } catch (err) {
    console.error('Unexpected error fetching members:', err);
    return { members: [], isAdmin: false };
  }
}

/**
 * Server action to add a new member using supabaseAdmin (bypasses RLS)
 */
export async function addMember(input: AddMemberInput) {
  try {
    // 1. Verify that the client calling this action has a valid authenticated session
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized. You must be logged in to add members.' };
    }

    // 2. Perform insert via supabaseAdmin to bypass RLS policies
    const { data, error } = await supabaseAdmin
      .from('members')
      .insert([
        {
          full_name: input.full_name,
          phone_number: input.phone_number,
          role: input.role || 'Member',
          email: input.email || null,
          status: input.status || 'active',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting new member via admin client:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in addMember:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred while adding the member.';
    return { success: false, error: errorMessage };
  }
}