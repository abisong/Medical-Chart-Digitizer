
import React from 'react';
import type { User } from '../types';

interface HeaderProps {
    user: User;
    onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm10.5 5.5a.5.5 0 00-1 0v3a.5.5 0 001 0v-3zM8 8a.5.5 0 000 1h4a.5.5 0 000-1H8zm0 3a.5.5 0 000 1h4a.5.5 0 000-1H8z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Medical Chart Digitizer</h1>
            <span className="hidden sm:inline bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">Clinical PRO</span>
        </div>
        <div className="flex items-center space-x-4">
            <div className="text-right">
                <p className="font-semibold text-sm text-slate-700">{user.name}</p>
                <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <button
                onClick={onLogout}
                className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-all text-sm"
                aria-label="Logout"
                title="Sign out of your account"
            >
                Logout
            </button>
        </div>
      </div>
    </header>
  );
};
