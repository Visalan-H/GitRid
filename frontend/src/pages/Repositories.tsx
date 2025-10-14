import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RepoDataTable } from '@/components/RepoDataTable';
import { columns } from '@/components/RepoColumns';
import { ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export interface Repository {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    forks: number;
    updatedAt: string;
}

export default function Repositories() {
    const [repos, setRepos] = useState<Repository[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [tableKey, setTableKey] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`${import.meta.env.VITE_API_URL}/api/repo/all`, { withCredentials: true })
            .then(res => {
                setRepos(res.data.repos || res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to fetch repositories');
                navigate('/dashboard');
            });
    }, [navigate]);

    const handleDelete = async () => {
        if (selectedRepos.length === 0) return;
        if (selectedRepos.length > 50) {
            toast.error('You can only delete up to 50 repositories at once');
            return;
        }

        if (confirmText !== 'delete my repos') {
            toast.error('Please type "delete my repos" to confirm');
            return;
        }

        setIsDeleting(true);
        setShowConfirm(false);
        setConfirmText('');

        try {
            const repoNames = selectedRepos.map(r => r.name);
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/repo/delete`, {
                data: { repoNames },
                withCredentials: true,
            });

            const { summary } = response.data;

            toast.success(
                `Successfully deleted ${summary.successfulDeletions} of ${summary.total} repositories`
            );

            setRepos(repos.filter(r => !repoNames.includes(r.name)));
            setSelectedRepos([]);
            setTableKey(prev => prev + 1); // Force table to reset
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete repositories');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-[#ededed] animate-spin" />
                    <p className="text-[#ededed]/60 text-lg">Loading repositories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="container mx-auto px-4 py-10">
                <div className="rounded-lg bg-black border border-[#ededed]/10 p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/dashboard')}
                                className="bg-black border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10 hover:text-[#ededed]"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-[#ededed]">
                                    Repositories ({repos.length})
                                </h1>
                            </div>
                        </div>

                        {selectedRepos.length > 0 && (
                            <Button
                                onClick={() => setShowConfirm(true)}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-[#ededed] font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                                {isDeleting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete {selectedRepos.length} Selected
                                {selectedRepos.length > 50 && (
                                    <span className="ml-2 text-[#ededed]">(Max 50)</span>
                                )}
                            </Button>
                        )}
                    </div>

                    <RepoDataTable
                        key={tableKey}
                        columns={columns}
                        data={repos}
                        onSelectionChange={setSelectedRepos}
                    />

                    <AlertDialog
                        open={showConfirm}
                        onOpenChange={open => {
                            setShowConfirm(open);
                            if (!open) setConfirmText('');
                        }}
                    >
                        <AlertDialogContent className="bg-[#0a0a0a] border border-[#ededed]/10">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-[#ededed] text-xl font-bold">
                                    Delete {selectedRepos.length} repositories?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#ededed]/60">
                                    This action cannot be undone. The following repositories will be
                                    permanently deleted:
                                    <div className="mt-4 max-h-40 overflow-y-auto rounded-lg bg-black p-4 border border-[#ededed]/10">
                                        <ul className="list-disc list-inside text-sm space-y-1">
                                            {selectedRepos.slice(0, 10).map(repo => (
                                                <li key={repo.id} className="text-[#ededed]/70">
                                                    {repo.fullName}
                                                </li>
                                            ))}
                                            {selectedRepos.length > 10 && (
                                                <li className="text-[#ededed]/50">
                                                    ...and {selectedRepos.length - 10} more
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="mt-6 space-y-2">
                                        <p className="text-sm font-medium text-[#ededed]">
                                            Type{' '}
                                            <span className="font-mono bg-[#ededed]/10 px-2 py-0.5 rounded text-red-400">
                                                delete my repos
                                            </span>{' '}
                                            to confirm:
                                        </p>
                                        <Input
                                            value={confirmText}
                                            onChange={e => setConfirmText(e.target.value)}
                                            className="bg-black border-[#ededed]/20 text-[#ededed] placeholder:text-[#ededed]/40"
                                            autoComplete="off"
                                        />
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                                <AlertDialogCancel
                                    className="bg-black border border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10 hover:text-[#ededed] cursor-pointer focus-visible:ring-[#ededed]/30"
                                    onClick={() => setConfirmText('')}
                                >
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    disabled={confirmText !== 'delete my repos'}
                                    className="bg-red-600 hover:bg-red-700 text-[#ededed] hover:text-[#ededed] cursor-pointer border-0 focus-visible:ring-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
