// app/actions/dashboard.ts
'use server';

import { supabase } from '@/lib/supabase';
import { Member } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function getDashboardStats() {
  try {
    // 1. Fetch total active members count
    const { count: totalMembersCount, error: memberErr } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    if (memberErr) {
      console.error('Error fetching members:', memberErr.message);
    }

    const totalMembers = totalMembersCount || 0;

    // 2. Fetch all weeks to calculate season total and August-ended scope
    const { data: weeksData } = await supabase
      .from('weeks')
      .select('id, month_name, target_amount')
      .order('id', { ascending: true });

    const totalWeeks = weeksData?.length || 22;
    const weeklyTargetPerMember = weeksData?.[0]?.target_amount || 100;

    // Filter weeks strictly up to August
    // (Assumes month_name is stored like 'August', or weeks up to August are filtered)
    const augustWeeks = (weeksData || []).filter((w) => {
      const month = (w.month_name || '').toLowerCase();
      return month.includes('august') || month.includes('aug');
    });

    // If weeks explicitly track August, use augustWeeks.length, otherwise count weeks due up to August end
    const completedWeeksCount = augustWeeks.length > 0 ? augustWeeks.length : 4; // default to 4 weeks for August if not labeled

    // 3. Fetch all contributions with status, amount, and week details
    let contributionsData: { member_id?: string; week_id?: number; amount_paid?: number; status?: string }[] = [];

    const { data: contribs, error: contribErr } = await supabase
      .from('contributions')
      .select('member_id, week_id, amount_paid, status');

    if (contribErr || !contribs) {
      const { data: savings } = await supabase
        .from('savings_records')
        .select('member_id, week_id, amount_paid, status');
      contributionsData = savings || [];
    } else {
      contributionsData = contribs;
    }

    // 4. Calculate total overall funds saved (all time)
    const totalSaved = contributionsData
      .filter((c) => {
        const s = (c.status || '').toUpperCase();
        return s === 'PAID' || s === 'VERIFIED';
      })
      .reduce((sum, c) => sum + Number(c.amount_paid || 0), 0);

    // 5. Calculate August Target & August Deficit strictly
    const augustTarget = totalMembers * completedWeeksCount * weeklyTargetPerMember;

    // Sum paid contributions for August weeks only (or calculate overall deficit against August milestone)
    const augustPaid = contributionsData
      .filter((c) => {
        const s = (c.status || '').toUpperCase();
        const isPaid = s === 'PAID' || s === 'VERIFIED';
        if (!isPaid) return false;
        
        // Match week ID if August weeks exist
        if (augustWeeks.length > 0) {
          return augustWeeks.some((aw) => aw.id === c.week_id);
        }
        return true;
      })
      .reduce((sum, c) => sum + Number(c.amount_paid || 0), 0);

    // Outstanding deficit up to August end
    const augustDeficit = Math.max(0, augustTarget - augustPaid);

    // 6. Find distinct members who have pending balances for August weeks
    const augustWeekIds = new Set(augustWeeks.map((w) => w.id));

    // Get members who paid for August
    const paidMemberIdsInAugust = new Set(
      contributionsData
        .filter((c) => {
          const s = (c.status || '').toUpperCase();
          const isPaid = s === 'PAID' || s === 'VERIFIED';
          return isPaid && (augustWeekIds.size === 0 || augustWeekIds.has(c.week_id!));
        })
        .map((c) => c.member_id)
        .filter(Boolean)
    );

    // Unpaid members up to August end = Total Members minus members who fully cleared August
    const unpaidMembersCount = Math.max(0, totalMembers - paidMemberIdsInAugust.size);

    // Total season target (Full 22 weeks)
    const totalTarget = totalMembers * totalWeeks * weeklyTargetPerMember;

    // Overall progress towards final season goal
    const progressPercentage =
      totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

    return {
      totalMembers,
      totalSaved,
      totalTarget,
      totalWeeks,
      unpaidAmount: augustDeficit,
      unpaidMembersCount,
      progressPercentage,
    };
  } catch (err) {
    console.error('Unexpected error fetching dashboard stats:', err);
    return {
      totalMembers: 0,
      totalSaved: 0,
      totalTarget: 0,
      totalWeeks: 22,
      unpaidAmount: 0,
      unpaidMembersCount: 0,
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