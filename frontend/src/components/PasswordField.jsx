import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordField({
  id,
  name,
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  autoComplete,
  className = 'form-control',
  disabled = false,
  showIcon = true,
  style = {}
}) {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(prev => !prev);
  };

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      {showIcon && (
        <Lock 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '0.85rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--color-text-muted, #9ca3af)',
            pointerEvents: 'none'
          }} 
        />
      )}
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        className={className}
        style={{
          width: '100%',
          paddingLeft: showIcon ? '2.5rem' : '0.85rem',
          paddingRight: '2.5rem'
        }}
      />
      <button
        type="button"
        onClick={toggleVisibility}
        tabIndex={-1}
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: '0.65rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: '0.25rem',
          cursor: 'pointer',
          color: 'var(--color-text-secondary, #6b7280)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '4px'
        }}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export { PasswordField };
