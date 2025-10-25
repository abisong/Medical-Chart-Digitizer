
import type { User } from '../types';

const USERS_KEY = 'medical-chart-users';
const SESSION_KEY = 'medical-chart-session';
const DEMO_ACCOUNTS_CREATED_KEY = 'demo-accounts-created';

// --- Demo Data ---
const demoUsers: User[] = [
    { name: "Dr. Anya Sharma", email: "doctor@clinic.com", password_plaintext: "password123", role: "Doctor" },
    { name: "Carlos Rodriguez", email: "nurse@clinic.com", password_plaintext: "password123", role: "Nurse" },
    { name: "Brenda Miller", email: "biller@clinic.com", password_plaintext: "password123", role: "Biller" },
    { name: "Admin User", email: "admin@clinic.com", password_plaintext: "password123", role: "Administrator" }
];

// --- User Management ---

const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (error) {
        console.error("Error reading users from localStorage", error);
        return [];
    }
};

const saveUsers = (users: User[]) => {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (error) {
        console.error("Error saving users to localStorage", error);
    }
};

export const setupDemoAccounts = () => {
    try {
        const areAccountsCreated = localStorage.getItem(DEMO_ACCOUNTS_CREATED_KEY);
        if (!areAccountsCreated) {
            saveUsers(demoUsers);
            localStorage.setItem(DEMO_ACCOUNTS_CREATED_KEY, 'true');
        }
    } catch (error) {
        console.error("Error setting up demo accounts", error);
    }
};

// --- Authentication ---

export const login = (email: string, password_plaintext: string): User | null => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password_plaintext === password_plaintext);
    if (user) {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error("Error saving session", error);
            return null;
        }
    }
    return null;
};

export const register = (newUser: Omit<User, 'password_plaintext'> & {password_plaintext: string}): User | { error: string } => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === newUser.email.toLowerCase())) {
        return { error: 'A user with this email already exists.' };
    }
    const userToSave: User = { ...newUser };
    const updatedUsers = [...users, userToSave];
    saveUsers(updatedUsers);
    
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userToSave));
        return userToSave;
    } catch (error) {
        console.error("Error saving session on register", error);
        // User is created, but session failed. They can log in manually.
        return userToSave; 
    }
};


export const logout = () => {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch (error) {
        console.error("Error during logout", error);
    }
};

export const getCurrentUser = (): User | null => {
    try {
        const user = sessionStorage.getItem(SESSION_KEY);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error("Error getting current user from session", error);
        return null;
    }
};
