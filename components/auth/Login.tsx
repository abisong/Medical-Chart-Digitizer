
import React, { useState } from 'react';
import type { User } from '../../types';
import * as authService from '../../services/authService';

interface LoginProps {
    onLogin: (user: User) => void;
    onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        setTimeout(() => { // Simulate network delay
            const user = authService.login(email, password);
            setIsLoading(false);
            if (user) {
                onLogin(user);
            } else {
                setError('Invalid email or password. Please try again.');
            }
        }, 500);
    };

    const handleDemoLogin = (demoEmail: string) => {
        setError(null);
        setIsLoading(true);

        setEmail(demoEmail);
        setPassword('password123');

        setTimeout(() => { 
            const user = authService.login(demoEmail, 'password123');
            setIsLoading(false);
            if (user) {
                onLogin(user);
            } else {
                setError('Demo account login failed. Please contact support.');
            }
        }, 300);
    };
    
    const demoAccounts = [
        { role: 'Doctor', email: 'doctor@clinic.com' },
        { role: 'Nurse', email: 'nurse@clinic.com' },
        { role: 'Biller', email: 'biller@clinic.com' },
        { role: 'Admin', email: 'admin@clinic.com' },
    ];

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-200 animate-fade-in">
             <div className="text-center mb-6">
                 <div className="flex items-center justify-center space-x-3 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm10.5 5.5a.5.5 0 00-1 0v3a.5.5 0 001 0v-3zM8 8a.5.5 0 000 1h4a.5.5 0 000-1H8zm0 3a.5.5 0 000 1h4a.5.5 0 000-1H8z" clipRule="evenodd" />
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-800">Medical Chart Digitizer</h1>
                </div>
                <p className="text-slate-500">Sign in to continue</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
                <h4 className="font-semibold text-blue-800 mb-2 text-center">One-Click Demo Login</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {demoAccounts.map(acc => (
                        <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleDemoLogin(acc.email)}
                            disabled={isLoading}
                            className="text-left w-full bg-white text-blue-800 p-2 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-wait"
                            title={`Log in as ${acc.role}`}
                        >
                            <span className="font-bold">{acc.role}</span>
                            <span className="block text-xs opacity-80">{acc.email}</span>
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="user@clinic.com"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="••••••••"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                    title="Sign in with the provided credentials"
                >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-6">
                Don't have an account?{' '}
                <button onClick={onNavigateToRegister} className="font-semibold text-blue-600 hover:underline" title="Create a new account">
                    Register
                </button>
            </p>
        </div>
    );
};
