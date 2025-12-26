'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange, getUserData, UserData, signOut as firebaseSignOut } from '@/lib/firebase/auth';

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
    signOut: async () => { },
    refreshUserData: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUserData = async () => {
        if (user) {
            try {
                const data = await getUserData(user.uid);
                setUserData(data);
            } catch (error) {
                console.warn('Failed to fetch user data from Firestore:', error);
                // Continue with null userData - app still works
            }
        }
    };

    const handleSignOut = async () => {
        await firebaseSignOut();
        setUser(null);
        setUserData(null);
    };

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                try {
                    const data = await getUserData(firebaseUser.uid);
                    setUserData(data);
                } catch (error) {
                    console.warn('Failed to fetch user data from Firestore:', error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                userData,
                loading,
                signOut: handleSignOut,
                refreshUserData,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
