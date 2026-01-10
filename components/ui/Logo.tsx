/**
 * CouncilPAD Logo Component
 */

import Image from 'next/image';

interface LogoProps {
  variant?: 'symbol' | 'wordmark' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Logo({ variant = 'full', size = 'md', className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  };

  if (variant === 'symbol') {
    return (
      <Image
        src="/council-logo.png"
        alt="CouncilPAD"
        width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        className={`${sizeClasses[size]} w-auto ${className}`}
      />
    );
  }

  if (variant === 'wordmark') {
    return (
      <span className={`font-display text-council-charcoal ${className}`}>
        CouncilPAD
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/council-logo.png"
        alt="CouncilPAD"
        width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
        className={`${sizeClasses[size]} w-auto`}
      />
      <span className={`font-semibold text-council-charcoal ${
        size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'
      }`}>
        CouncilPAD
      </span>
    </div>
  );
}

