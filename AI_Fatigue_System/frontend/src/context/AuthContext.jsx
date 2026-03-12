import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // 1. Initialize State with Safety Checks
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("AuthContext: Error parsing saved user", error);
            return null;
        }
    });
    
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // 2. Computed Auth State
    const isAuthenticated = !!token;

    // 3. Persist Changes to LocalStorage automatically
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // 4. Login Action
    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
    };

    // 5. Logout Action
    const logout = () => {
        setUser(null);
        setToken(null);
        // Using clear() is safer to ensure no ghost data remains
        localStorage.clear();
        // We use a small delay for smoother UI transitions
        setTimeout(() => {
            window.location.href = '/login';
        }, 100);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
