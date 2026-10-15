import React from 'react';

interface HeaderProps {
  userName?: string;
  onOpenSos?: () => void;
  onReadScreen?: () => void;
  onEnlargeFont?: () => void;
  onClose?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName = 'Felicia',
  onOpenSos,
  onReadScreen,
  onEnlargeFont,
  onClose,
}) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#0B132B] border-b border-gray-800 text-white shadow-md">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
          <img 
            src="/healing-Logo.jpeg" 
            alt="Healing Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xl font-bold tracking-tight text-teal-400">Healing</span>
      </div>

      {/* User Profile Tag */}
      <div className="flex items-center space-x-2 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-800">
        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
        <span className="text-sm font-medium text-gray-200">{userName}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onOpenSos}
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <span>SOS</span>
        </button>

        <button 
          onClick={onReadScreen}
          className="flex items-center space-x-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-700"
        >
          <span>Read Screen</span>
        </button>

        <button 
          onClick={onEnlargeFont}
          className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border border-gray-700"
        >
          Enlarge Font
        </button>

        <button 
          onClick={onClose}
          className="flex items-center space-x-1 bg-teal-600 hover:bg-teal-500 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <span>Close</span>
        </button>
      </div>
    </header>
  );
};