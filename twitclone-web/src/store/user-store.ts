import { create } from 'zustand';

interface User {
    id: string;
    username: string;
    display_name: string;
    displayUsername: string | null;
    bio: string;
    avatar_url: string;
    banner_url: string;
    verified: boolean;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    onboarded: boolean;
    createdAt: string;
    updatedAt: string;
}

interface UserState {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    needsEmailVerification: boolean;
    fetchUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    isLoading: true,
    error: null,
    needsEmailVerification: false,
    fetchUser: async () => {
        set({ isLoading: true, error: null, needsEmailVerification: false });
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
            const response = await fetch(`${baseUrl}/api/v1/profile/me`, {
                credentials: 'include',
            });
            if (response.status === 403) {
                set({
                    user: null,
                    isLoading: false,
                    error: "EMAIL_NOT_VERIFIED",
                    needsEmailVerification: true,
                });
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const data = await response.json();
            set({ user: data.user, isLoading: false, needsEmailVerification: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false, needsEmailVerification: false });
        }
    },
}));
