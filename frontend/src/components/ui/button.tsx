import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-gray-900 text-white hover:bg-gray-800',
  ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900',
  outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-50',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  icon: 'size-8',
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  asChild?: boolean;
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild, ...props }, ref) => {
    const Component = asChild ? 'span' : 'button';
    const classes = cn(
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      buttonVariants[variant],
      buttonSizes[size],
      className
    );

    return <Component ref={ref as any} className={classes} {...(props as any)} />;
  }
);
Button.displayName = 'Button';

export { Button };
