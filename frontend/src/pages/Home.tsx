import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';
import DarkVeil from '@/components/DarkVeil';
import { useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function Home() {
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
                        className="bg-[#ededed] text-xl cursor-pointer text-black hover:bg-[#ededed]/90 hover:text-black font-semibold px-8 h-14 rounded-md transition-all duration-200"
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
