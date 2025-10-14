import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitBranch, LogOut } from 'lucide-react';

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
        await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/logout`,
            {},
            { withCredentials: true }
        );
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-[#ededed]/60 text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="container mx-auto px-4 max-w-2xl">
                {/* Logout Button - Top Right */}
                <div className="absolute top-6 right-6">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="bg-black border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10 hover:text-[#ededed]cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>

                {/* Main Content - Centered */}
                <div className="space-y-12">
                    {/* Profile Section */}
                    <div className="text-center space-y-6">
                        <Avatar className="h-24 w-24 mx-auto border-2 border-[#ededed]/30">
                            <AvatarImage src={user?.avatarUrl} />
                            <AvatarFallback className="bg-[#ededed] text-black text-2xl">
                                {user?.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold text-[#ededed] mb-2">
                                {user?.username}
                            </h1>
                            <p className="text-[#ededed]/60 text-base">{user?.email}</p>
                        </div>
                    </div>

                    {/* Stats Section */}
                    <div className="border-t border-b border-[#ededed]/10 py-8">
                        <div className="flex items-center justify-center gap-3">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#ededed]">
                                    {user?.deletedRepoCount}
                                </p>
                                <p className="text-[#ededed]/60 text-sm mt-1">
                                    repositories deleted
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="space-y-4">
                        <Button
                            size="lg"
                            onClick={() => navigate('/repos')}
                            className="w-full bg-[#ededed] text-black hover:bg-[#ededed]/90 h-14 text-lg font-semibold cursor-pointer"
                        >
                            <GitBranch className="mr-2 h-5 w-5" />
                            Manage Repositories
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
