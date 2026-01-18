import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
    merchantId: string;
    token: string;
    email?: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    login: (token: string, merchantId: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored session
        const storedToken = localStorage.getItem('payflow_token');
        const storedMerchantId = localStorage.getItem('payflow_merchant_id');

        if (storedToken && storedMerchantId) {
            setUser({
                token: storedToken,
                merchantId: storedMerchantId
            } as User);
        }
        setIsLoading(false);
    }, []);

    const login = (token: string, merchantId: string) => {
        localStorage.setItem('payflow_token', token);
        localStorage.setItem('payflow_merchant_id', merchantId);
        setUser({ token, merchantId } as User);
    };

    const logout = () => {
        localStorage.removeItem('payflow_token');
        localStorage.removeItem('payflow_merchant_id');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
