import React from 'react';
import { cn } from '../../utils/cn';

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-300",
        className
      )}
      {...props}
    />
  );
}; 