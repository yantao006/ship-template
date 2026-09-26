import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { readSession } from '@/lib/request-context';
import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { isInviteAdmin } from '@/lib/invites';
import { InviteAdmin } from '@/components/invite-admin';

export default async function InviteAdminPage() {
  if (!auth.invite.required) notFound();
  const session = await readSession(workerEnv(), await headers());
  if (!session || !isInviteAdmin(session.user.email)) notFound();
  return <InviteAdmin />;
}
