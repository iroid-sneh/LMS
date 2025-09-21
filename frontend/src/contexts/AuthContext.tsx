import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import api from "../config/axios";

interface User {
    id: string;
    name: string;
    email: string;
    role: "employee" | "hr";
    department: string;
    position: string;
    employeeId: string;
    phone?: string;
    joiningDate: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (userData: RegisterData) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    department: string;
    position: string;
    employeeId: string;
    phone?: string;
    role?: "employee" | "hr";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            const response = await api.get("/auth/me");
            setUser(response.data.user);
        } catch (error) {
            localStorage.removeItem("token");
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { token, user: userData } = response.data;

            localStorage.setItem("token", token);
            setUser(userData);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || "Login failed");
        }
    };

    const register = async (userData: RegisterData) => {
        try {
            const response = await api.post("/auth/register", userData);
            const { token, user: newUser } = response.data;

            localStorage.setItem("token", token);
            setUser(newUser);
        } catch (error: any) {
            throw new Error(
                error.response?.data?.message || "Registration failed"
            );
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};
