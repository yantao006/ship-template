import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { createAuth } from '@/lib/auth';
import { auth, site } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { isInviteAdmin } from '@/lib/invites';
import { InviteAdmin } from '@/components/invite-admin';

export default async function InviteAdminPage() {
  if (!auth.invite.required) notFound();
  const session = await createAuth(workerEnv(), new URL(site.url).hostname).api.getSession({ headers: await headers() });
  if (!session || !isInviteAdmin(session.user.email)) notFound();
  return <InviteAdmin />;
}
