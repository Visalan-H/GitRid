import { Button } from '@/components/ui/button';
import { Github, Loader2 } from 'lucide-react';
import DarkVeil from '@/components/DarkVeil';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

export default function Home() {
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

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
        const checkAuth = async () => {
            try {
                await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                    withCredentials: true,
                });
                navigate('/dashboard');
            } catch {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (isChecking) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-[#ededed] animate-spin" />
                    <p className="text-[#ededed]/60 text-lg">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* DarkVeil Background */}
            <div className="absolute inset-0">
                <DarkVeil speed={2} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen">
                <div className="text-center space-y-12 px-4">
                    <div className="space-y-6">
                        <h1 className="text-[4rem] md:text-[6rem] font-bold text-[#ededed] tracking-[-0.02em] leading-none">
                            GitRid
                        </h1>
                        <p className="text-[#ededed]/70 text-lg md:text-xl font-medium max-w-xl mx-auto">
                            Get rid of Multiple GitHub repositories in a single click.
                        </p>
                    </div>

                    <Button
                        size="lg"
                        onClick={handleLogin}
                        className="bg-[#ededed] text-xl cursor-pointer text-black hover:bg-[#ededed]/90 hover:text-black hover:scale-[0.95] font-semibold px-8 h-14 rounded-md transition-all duration-200"
                    >
                        <Github
                            className="size-7 mr-2 bg-black p-[4px] rounded-full"
                            fill="#ededed"
                            stroke="#ededed"
                        />
                        Sign in with Github
                    </Button>
                </div>
            </div>
        </div>
    );
}
