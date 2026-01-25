import React from 'react';

export default function EditorialBrandAvatar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative ${className} rounded-full overflow-hidden border border-[#d4d0c7] bg-[#0b1b2b] flex items-center justify-center`}>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="100%" 
        height="100%" 
        viewBox="0 0 24 24" 
        className="p-1.5"
        role="img" 
        aria-label="C-Suite Magazine Crown"
      >
        <path 
          fill="#c8ab3d" 
          d="M6 16l-1-6 3.5 2.5L12 6l3.5 6.5L19 10l-1 6H6zm0 2h12v2H6v-2z"
        />
      </svg>
    </div>
  );
}
