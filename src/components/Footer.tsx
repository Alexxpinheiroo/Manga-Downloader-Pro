import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full md:ml-[280px] md:w-[calc(100%-280px)] border-t border-[#3c4a42]/40 bg-[#060e20]/90 text-[#bbcabf] text-xs font-mono py-4 px-6 text-center select-none z-30 transition-all">
      <div className="max-w-[1440px] mx-auto flex items-center justify-center">
        <span>© 2026 JC Informática TechSupport. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
};
