'use client';

import Link, { LinkProps } from 'next/link';
import { usePageTransition } from './PageTransitionProvider';
import { ReactNode, MouseEvent } from 'react';

interface TransitionLinkProps extends Omit<LinkProps, 'onClick'> {
  children: ReactNode;
  className?: string;
  onNavigate?: () => void;
}

export function TransitionLink({
  href,
  children,
  className,
  onNavigate,
  ...rest
}: TransitionLinkProps) {
  const navigate = usePageTransition();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate?.();
    navigate(href.toString());
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...rest}>
      {children}
    </Link>
  );
}

export default TransitionLink;
