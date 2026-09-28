import React, { type ButtonHTMLAttributes, type ComponentProps, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type Ref } from 'react';
import Link from 'next/link';

/** Shared visual controls intentionally do not assign size: each surface retains its original geometry. */
export function SolidButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ui-button-solid ${className}`} {...props} />;
}

export function OutlineButton({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`ui-button-outline ${className}`} {...props} />;
}

export function SolidLink({ className = '', ...props }: ComponentProps<typeof Link>) {
  return <Link className={`ui-button-solid ${className}`} {...props} />;
}

export function DialogSurface({ className = '', ref, ...props }: HTMLAttributes<HTMLDivElement> & { ref?: Ref<HTMLDivElement> }) {
  return <div ref={ref} className={`ui-enter-scale ${className}`} role="dialog" aria-modal="true" {...props} />;
}

export function TextInput({ className = '', ref, ...props }: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return <input ref={ref} className={`ui-input ${className}`} {...props} />;
}

export function SidebarItem({ href, active, children, className = '' }: { href: string; active: boolean; children: ReactNode; className?: string }) {
  return <Link href={href} className={`ui-nav-item ${className}${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined}>{children}</Link>;
}
