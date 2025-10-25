
import React, { useState } from 'react';
import type { User, Role } from '../../types';
import * as authService from '../../services/authService';

interface RegisterProps {
    onRegister: (user: User) => void;
    onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegister, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('Nurse');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password.length < 8) {
             setError('Password must be at least 8 characters long.');
             setIsLoading(false);
             return;
        }

        setTimeout(() => { // Simulate network delay
            const result = authService.register({ name, email, password_plaintext: password, role });
            setIsLoading(false);
            if ('error' in result) {
                setError(result.error);
            } else {
                onRegister(result);
            }
        }, 500);
    };

    const roles: Role[] = ['Administrator', 'Doctor', 'Nurse', 'Biller'];

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 border border-slate-200 animate-fade-in">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
                <p className="text-slate-500">Join the Clinical PRO team</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="Dr. Jane Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email-reg" className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                        id="email-reg"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="user@clinic.com"
                    />
                </div>
                <div>
                    <label htmlFor="password-reg" className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                    <input
                        id="password-reg"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                        placeholder="Minimum 8 characters"
                    />
                </div>
                 <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as Role)}
                        required
                        className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-white"
                    >
                        {roles.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300"
                    title="Create your new account"
                >
                    {isLoading ? 'Creating Account...' : 'Register'}
                </button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-6">
                Already have an account?{' '}
                <button onClick={onNavigateToLogin} className="font-semibold text-blue-600 hover:underline" title="Go to the sign-in page">
                    Sign In
                </button>
            </p>
        </div>
    );
};
