import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookMarked, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'sonner';

interface User {
    username: string;
    email: string;
    avatarUrl: string;
    deletedRepoCount: number;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
            .then(res => {
                setUser(res.data);
                setLoading(false);
            })
            .catch(() => {
                navigate('/');
            });
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch {
            toast.error('Logout failed, please try again');
            return;
        }
        navigate('/');
    };

    if (loading) {
        return (
            <div className="h-full w-full bg-[var(--app-bg)] flex items-center justify-center">
                <div className="text-[var(--app-fg-muted)] text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[var(--app-bg)] flex items-center justify-center overflow-y-auto">
            {/* Top-right controls */}
            <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-md text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="border border-[var(--app-border)] text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] hover:text-[var(--app-fg)] cursor-pointer"
                    style={{ backgroundColor: 'transparent' }}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Button>
            </div>

            <div className="container mx-auto px-4 max-w-2xl py-20">
                <div className="space-y-12">
                    <div className="text-center space-y-6">
                        <Avatar className="h-24 w-24 mx-auto border-2 border-[var(--app-border)]">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback
                                className="text-2xl"
                                style={{
                                    backgroundColor: 'var(--app-fg)',
                                    color: 'var(--app-bg)',
                                }}
                            >
                                {user?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--app-fg)] mb-2">
                                {user?.username}
                            </h1>
                            <p className="text-[var(--app-fg-muted)] text-base">{user?.email}</p>
                        </div>
                    </div>

                    <div className="border-t border-b border-[var(--app-border)] py-8">
                        <div className="flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[var(--app-fg)]">
                                    {user?.deletedRepoCount}
                                </p>
                                <p className="text-[var(--app-fg-muted)] text-sm mt-1">
                                    repositories deleted
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={() => navigate('/repos')}
                        className="w-full h-14 text-lg font-semibold cursor-pointer hover:scale-[0.975] transition-transform duration-200"
                        style={{
                            backgroundColor: 'var(--app-fg)',
                            color: 'var(--app-bg)',
                        }}
                    >
                        <BookMarked className="mr-2 h-5 w-5" />
                        Manage Repositories
                    </Button>
                </div>
            </div>
        </div>
    );
}
