import { supabase } from '@/lib/supabase';
import ReportsClient from './ReportsClient';

export const revalidate = 0;

export default async function ReportsPage() {
  const [{ data: members }, { data: contributions }] = await Promise.all([
    supabase.from('members').select('*').order('full_name', { ascending: true }),
    supabase.from('contributions').select('*').order('created_at', { ascending: false }),
  ]);

  return (
    <ReportsClient 
      initialMembers={members || []} 
      initialContributions={contributions || []} 
    />
  );
}