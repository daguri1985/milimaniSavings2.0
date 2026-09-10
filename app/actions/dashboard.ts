// app/actions/dashboard.ts
'use server';

import { supabase } from '@/lib/supabase';
import { Member } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
  try {
    // 1. Fetch total active members
    const { data: members, error: memberErr } = await supabase
      .from('members')
      .select('id, full_name, phone_number')
      .order('full_name', { ascending: true });

    if (memberErr) {
      console.error('Error fetching members:', memberErr.message);
    }

    const allMembers = members || [];
    const totalMembers = allMembers.length;

    // 2. Fetch active weeks
    const { data: weeksData } = await supabase
      .from('weeks')
      .select('id, month_name, target_amount')
      .order('id', { ascending: true });

    const totalWeeks = weeksData?.length || 22;
    const weeklyTargetPerMember = weeksData?.[0]?.target_amount || 100;

    // Filter August weeks specifically
    const augustWeeks = (weeksData || []).filter((w) => {
      const month = (w.month_name || '').toLowerCase();
      return month.includes('august') || month.includes('aug');
    });

    const augustWeeksCount = augustWeeks.length > 0 ? augustWeeks.length : 4;
    const augustTargetPerMember = augustWeeksCount * weeklyTargetPerMember;

    // 3. Fetch contributions
    let contributionsData: { member_id?: string; week_id?: number; amount_paid?: number; status?: string }[] = [];

    const { data: contribs } = await supabase
      .from('contributions')
      .select('member_id, week_id, amount_paid, status');

    if (!contribs || contribs.length === 0) {
      const { data: savings } = await supabase
        .from('savings_records')
        .select('member_id, week_id, amount_paid, status');
      contributionsData = savings || [];
    } else {
      contributionsData = contribs;
    }

    // 4. Calculate total funds saved all time
    const totalSaved = contributionsData
      .filter((c) => {
        const s = (c.status || '').toUpperCase();
        return s === 'PAID' || s === 'VERIFIED';
      })
      .reduce((sum, c) => sum + Number(c.amount_paid || 0), 0);

    // 5. Build member-by-member breakdown up through August
    const augustWeekIds = new Set(augustWeeks.map((w) => w.id));

    const memberContributionsMap = new Map<string, number>();

    contributionsData.forEach((c) => {
      if (!c.member_id) return;
      const s = (c.status || '').toUpperCase();
      const isPaid = s === 'PAID' || s === 'VERIFIED';

      if (isPaid && (augustWeekIds.size === 0 || (c.week_id && augustWeekIds.has(c.week_id)))) {
        const current = memberContributionsMap.get(c.member_id) || 0;
        memberContributionsMap.set(c.member_id, current + Number(c.amount_paid || 0));
      }
    });

    const unpaidMembersList: Array<{
      member_id: string;
      full_name: string;
      phone_number: string;
      amount_paid: number;
      expected_amount: number;
      deficit: number;
      status: 'UNPAID' | 'PARTIAL';
    }> = [];

    allMembers.forEach((m) => {
      const paid = memberContributionsMap.get(m.id) || 0;
      if (paid < augustTargetPerMember) {
        const deficit = augustTargetPerMember - paid;
        unpaidMembersList.push({
          member_id: m.id,
          full_name: m.full_name || 'Unknown Member',
          phone_number: m.phone_number || '',
          amount_paid: paid,
          expected_amount: augustTargetPerMember,
          deficit,
          status: paid === 0 ? 'UNPAID' : 'PARTIAL',
        });
      }
    });

    const augustDeficitTotal = unpaidMembersList.reduce((sum, m) => sum + m.deficit, 0);

    const totalTarget = totalMembers * totalWeeks * weeklyTargetPerMember;
    const progressPercentage =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      totalMembers,
      totalSaved,
      totalTarget,
      totalWeeks,
      augustTargetPerMember,
      unpaidAmount: augustDeficitTotal,
      unpaidMembersCount: unpaidMembersList.length,
      unpaidMembersList,
      progressPercentage,
    };
  } catch (err) {
    console.error('Unexpected error fetching dashboard stats:', err);
    return {
      totalMembers: 0,
      totalSaved: 0,
      totalTarget: 0,
      totalWeeks: 22,
      augustTargetPerMember: 400,
      unpaidAmount: 0,
      unpaidMembersCount: 0,
      unpaidMembersList: [],
      progressPercentage: 0,
    };
  }
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
      console.error('Supabase query error in getRecentTransactions:', error.message);
      // Fallback: If relational joins fail, retrieve plain rows without join relations
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
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching members list:', error.message);
      return [];
    }

    return (data as Member[]) || [];
  } catch (err) {
    console.error('Unexpected error fetching members:', err);
    return [];
  }
}

export async function recordPayment(formData: FormData) {
  try {
    const memberId = formData.get('member_id');
    const weekId = formData.get('week_id');
    const amountPaid = Number(formData.get('amount_paid'));
    const mpesaReceipt = formData.get('mpesa_receipt_number')?.toString().trim();

    if (!memberId || !weekId || !amountPaid) {
      return { success: false, error: 'Missing required contribution details.' };
    }

    const { error } = await supabase.from('contributions').insert({
      member_id: memberId,
      week_id: Number(weekId),
      amount_paid: amountPaid,
      mpesa_receipt_number: mpesaReceipt ? mpesaReceipt.toUpperCase() : null,
      status: 'PAID',
      paid_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Error recording payment in action:', error.message);
      return { success: false, error: error.message };
    }

    // Revalidate dashboard routes so components update automatically
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/payments');
    revalidatePath('/dashboard/members');

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in recordPayment:', err);
    return { success: false, error: 'Internal server error recording payment.' };
  }
}