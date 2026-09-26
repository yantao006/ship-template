import React from 'react';
import { LogOut, Wallet, LayoutDashboard, Tags } from 'lucide-react';
import type { PopoverRow } from './account-popover-card';

export type AccountLinks = { workspace: { label: string; href: string }; credits: { label: string; href: string }; pricing: { label: string; href: string } };

export function inviteGateRows(links: AccountLinks | undefined, logout: string, signOut: () => void, pending: boolean): PopoverRow[] {
  return [
    ...(links ? [
      { id: 'workspace', icon: <LayoutDashboard />, label: links.workspace.label, href: links.workspace.href },
      { id: 'credits', icon: <Wallet />, label: links.credits.label, href: links.credits.href },
      { id: 'pricing', icon: <Tags />, label: links.pricing.label, href: links.pricing.href },
    ] : []),
    { id: 'signout', icon: <LogOut />, label: logout, tone: 'danger' as const, disabled: pending, onClick: signOut },
  ];
}
