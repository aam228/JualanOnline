import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <input className={`input ${className}`.trim()} {...props} />
    {error && <div className="input-error">{error}</div>}
  </div>
);

export default Input;
