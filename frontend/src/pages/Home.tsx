import { Button } from '@/components/ui/button';
import { Github, Loader2, Sun, Moon } from 'lucide-react';
import DarkVeil from '@/components/DarkVeil';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { useTheme } from '@/components/ThemeProvider';

export default function Home() {
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { theme, toggleThemeFromPoint } = useTheme();

    const handleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/github/url`;
    };

    useEffect(() => {
        const error = searchParams.get('error');
        if (error) {
            toast.error(error);
        }
    }, [searchParams]);

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_URL}/api/auth/me`, { withCredentials: true })
            .then(() => navigate('/dashboard'))
            .catch(() => setIsChecking(false));
    }, [navigate]);

    if (isChecking) {
        return (
            <div className="h-full w-full bg-[var(--app-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-[var(--app-fg)] animate-spin" />
                    <p className="text-[var(--app-fg-muted)] text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full relative overflow-hidden">
            {/* Theme toggle */}
            <button
                onClick={(e) => toggleThemeFromPoint(e.clientX, e.clientY)}
                className="absolute top-5 right-5 z-20 p-2 rounded-md text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Background — only shown in dark mode */}
            {theme === 'dark' && (
                <div className="absolute inset-0">
                    <DarkVeil speed={2} />
                </div>
            )}
            {theme === 'light' && (
                <div className="absolute inset-0 bg-[var(--app-bg)]" />
            )}

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
                <div className="text-center space-y-12 px-4">
                    <div className="space-y-6">
                        <h1 className="text-[4rem] md:text-[6rem] font-bold text-[var(--app-fg)] tracking-[-0.02em] leading-none">
                            GitRid
                        </h1>
                        <p className="text-[var(--app-fg-muted)] text-lg md:text-xl font-medium max-w-xl mx-auto">
                            Get rid of multiple GitHub repositories in a single click.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleLogin}
                        className="text-xl cursor-pointer font-semibold px-8 h-14 rounded-md transition-all duration-200 hover:scale-[0.95]"
                        style={{
                            backgroundColor: 'var(--app-fg)',
                            color: 'var(--app-bg)',
                        }}
                    >
                        <Github
                            className="size-7 mr-2 p-[4px] rounded-full"
                            style={{
                                background: 'var(--app-bg)',
                                fill: 'var(--app-fg)',
                                stroke: 'var(--app-fg)',
                            }}
                        />
                        Sign in with Github
                    </Button>
                </div>
            </div>
        </div>
    );
}
