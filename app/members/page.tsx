import { redirect } from 'next/navigation';

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function MembersRedirectPage({ searchParams }: Props) {
  const { id } = await searchParams;

  if (id) {
    // Redirect /members?id=123 -> /dashboard/members/123
    redirect(`/dashboard/members/${id}`);
  }

  // Redirect /members -> /dashboard/members
  redirect('/dashboard/members');
}