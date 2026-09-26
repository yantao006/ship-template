import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { readSession } from '@/lib/request-context';
import { auth } from '@/lib/config';
import { workerEnv } from '@/lib/env';
import { isInviteAdmin } from '@/lib/invites';
import { InviteAdmin } from '@/components/invite-admin';
import { messages, site } from '@/lib/config';

export default async function InviteAdminPage() {
  if (!auth.invite.required) notFound();
  const session = await readSession(workerEnv(), await headers());
  if (!session || !isInviteAdmin(session.user.email)) notFound();
  return <InviteAdmin copy={messages[site.defaultLocale as keyof typeof messages].invites} />;
}
