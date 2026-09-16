'use me';
'use server';

import { supabase } from '@/lib/supabase';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'member' | 'receipt';
  url: string;
}

export async function globalSearch(query: string): Promise<SearchResultItem[]> {
  const searchTerm = query.trim();
  if (!searchTerm || searchTerm.length < 2) return [];

  const results: SearchResultItem[] = [];

  try {
    // 1. Search Members by name or phone
    const { data: members } = await supabase
      .from('members')
      .select('id, full_name, phone_number, role')
      .or(`full_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`)
      .limit(4);

    if (members) {
      members.forEach((m) => {
        results.push({
          id: m.id,
          title: m.full_name || 'Unnamed Member',
          subtitle: `Member • ${m.phone_number || m.role || ''}`,
          type: 'member',
          url: `/dashboard/members/${m.id}`,
        });
      });
    }

    // 2. Search Contributions by receipt/mpesa_code or transaction details
    const { data: contributions } = await supabase
      .from('contributions')
      .select('id, mpesa_code, amount_paid, status, member:members(full_name)')
      .or(`mpesa_code.ilike.%${searchTerm}%`)
      .limit(4);

    if (contributions) {
      contributions.forEach((c) => {
        // Handle joined relation safely whether array or object
        const memberObj = Array.isArray(c.member) ? c.member[0] : c.member;
        const memberName = memberObj?.full_name || 'Member';

        results.push({
          id: c.id,
          title: c.mpesa_code ? `Receipt: ${c.mpesa_code}` : `Payment KSh ${c.amount_paid}`,
          subtitle: `${memberName} • KSh ${Number(c.amount_paid).toLocaleString()}`,
          type: 'receipt',
          url: `/savings?receipt=${c.mpesa_code || c.id}`,
        });
      });
    }
  } catch (err) {
    console.error('[GlobalSearch] Error during search execution:', err);
  }

  return results;
}