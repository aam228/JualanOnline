import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', ...props }) => {
  return (
    <button
      className={`btn ${variant === 'outline' ? 'btn-outline' : 'btn-primary'} ${className}`.trim()}
      {...props}
    />
  );
};

export default Button;
