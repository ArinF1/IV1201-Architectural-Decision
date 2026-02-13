import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationAPI } from '../services/api';

const AuthContext = createContext(null);

/**
 * Reads the stored user from localStorage synchronously.
 * This runs during the initial useState call so the auth state
 * is correct on the very first render (no flash-redirect).
 */
function getStoredUser() {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        localStorage.removeItem('user');
        return null;
    }
}

/**
 * Provides global authentication state to the entire application.
 * Session is restored synchronously from localStorage on first render.
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(getStoredUser);
    const navigate = useNavigate();

    const isAuthenticated = user !== null;

    /**
     * Saves user data to state and localStorage after a successful login.
     * @param {Object} userData - The UserDTO returned from the backend.
     */
    function login(userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }

    /**
     * Clears the auth cookie via the backend, removes local state,
     * and redirects to the login page.
     */
    async function logout() {
        try {
            await applicationAPI.logoutUser();
        } catch {
            // Even if the backend call fails, clear client state
        }
        setUser(null);
        localStorage.removeItem('user');
        navigate('/login');
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to consume auth state anywhere in the component tree.
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
