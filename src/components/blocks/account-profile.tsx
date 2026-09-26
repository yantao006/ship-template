import React, { type Ref } from 'react';

export function Avatar({ name, image, large = false }: { name: string; image?: string | null; large?: boolean }) {
  const initials = name.trim().split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return <span className={`replica-avatar${large ? ' replica-avatar-large' : ''}`} aria-hidden="true">{image ? <img src={image} alt="" width={large ? 44 : 34} height={large ? 44 : 34} /> : initials}</span>;
}

export function ProfileHeader({ name, email, image }: { name: string; email?: string; image?: string | null }) {
  return <div className="account-profile"><Avatar name={name} image={image} large /><div><strong>{name}</strong>{email && <small>{email}</small>}</div></div>;
}

export function AvatarTrigger({ name, image, label, open, onClick, buttonRef }: { name: string; image?: string | null; label: string; open: boolean; onClick: () => void; buttonRef?: Ref<HTMLButtonElement> }) {
  return <button ref={buttonRef} className="replica-avatar-trigger" type="button" aria-label={label} aria-haspopup="menu" aria-expanded={open} onClick={onClick}><Avatar name={name} image={image} /></button>;
}
