import { Verified } from "lucide-react";

interface VerificationBadgeProps {
  verified: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VerificationBadge = ({ verified, size = 'md', className = '' }: VerificationBadgeProps) => {
  if (!verified) return null;

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <Verified 
      className={`${sizeClasses[size]} text-primary shrink-0 ${className}`}
      aria-label="Verified user"
    />
  );
};

export default VerificationBadge;
