
import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-medium transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[#7C9A92] text-white hover:bg-[#6A867E] safe-shadow",
    secondary: "bg-[#F3E8E2] text-[#8C6D5E] hover:bg-[#EBDAD2]",
    outline: "border-2 border-[#7C9A92] text-[#7C9A92] hover:bg-[#F0F5F3]",
    ghost: "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
