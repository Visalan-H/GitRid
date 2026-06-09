import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RepoDataTable } from '@/components/RepoDataTable';
import { columns } from '@/components/RepoColumns';
import { ArrowLeft, Trash2, Loader2, Lock, Unlock, X, Sun, Moon } from 'lucide-react';
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
import { useTheme } from '@/components/ThemeProvider';

export interface Repository {
    id: number;
    name: string;
    fullName: string;
    private: boolean;
    fork: boolean;
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
    const [isMakingPrivate, setIsMakingPrivate] = useState(false);
    const [isMakingPublic, setIsMakingPublic] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showPrivateConfirm, setShowPrivateConfirm] = useState(false);
    const [showPublicConfirm, setShowPublicConfirm] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [pendingDeleteRepos, setPendingDeleteRepos] = useState<Repository[]>([]);
    const [pendingPrivateRepos, setPendingPrivateRepos] = useState<Repository[]>([]);
    const [pendingPublicRepos, setPendingPublicRepos] = useState<Repository[]>([]);
    const [tableKey, setTableKey] = useState(0);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();

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

    const allSelectedArePublic = selectedRepos.length > 0 && selectedRepos.every(r => !r.private);
    const allSelectedArePrivate = selectedRepos.length > 0 && selectedRepos.every(r => r.private);
    const isOperating = isDeleting || isMakingPrivate || isMakingPublic;

    const handleMakePrivate = async () => {
        if (pendingPrivateRepos.length === 0) return;
        if (pendingPrivateRepos.length > 50) {
            toast.error('You can only update up to 50 repositories at once');
            return;
        }

        setIsMakingPrivate(true);
        setShowPrivateConfirm(false);

        try {
            const repoNames = pendingPrivateRepos.map(r => r.name);
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/repo/visibility`,
                { repoNames },
                { withCredentials: true }
            );

            const { results, summary } = response.data;

            if (summary.successful > 0) {
                toast.success(`Made ${summary.successful} of ${summary.total} repositories private`);
            }
            if (summary.failed > 0) {
                results
                    .filter((r: { success: boolean }) => !r.success)
                    .forEach((r: { repo: string; error?: string }) =>
                        toast.error(`${r.repo}: ${r.error ?? 'Unknown error'}`)
                    );
            }

            const repoSet = new Set(repoNames);
            setRepos(prev => prev.map(r => (repoSet.has(r.name) ? { ...r, private: true } : r)));
            setSelectedRepos([]);
            setPendingPrivateRepos([]);
            setTableKey(prev => prev + 1);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to make repositories private');
        } finally {
            setIsMakingPrivate(false);
        }
    };

    const handleMakePublic = async () => {
        if (pendingPublicRepos.length === 0) return;
        if (pendingPublicRepos.length > 50) {
            toast.error('You can only update up to 50 repositories at once');
            return;
        }

        setIsMakingPublic(true);
        setShowPublicConfirm(false);

        try {
            const repoNames = pendingPublicRepos.map(r => r.name);
            const response = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/repo/visibility/public`,
                { repoNames },
                { withCredentials: true }
            );

            const { results, summary } = response.data;

            if (summary.successful > 0) {
                toast.success(`Made ${summary.successful} of ${summary.total} repositories public`);
            }
            if (summary.failed > 0) {
                results
                    .filter((r: { success: boolean }) => !r.success)
                    .forEach((r: { repo: string; error?: string }) =>
                        toast.error(`${r.repo}: ${r.error ?? 'Unknown error'}`)
                    );
            }

            const repoSet = new Set(repoNames);
            setRepos(prev => prev.map(r => (repoSet.has(r.name) ? { ...r, private: false } : r)));
            setSelectedRepos([]);
            setPendingPublicRepos([]);
            setTableKey(prev => prev + 1);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to make repositories public');
        } finally {
            setIsMakingPublic(false);
        }
    };

    const handleDelete = async () => {
        if (pendingDeleteRepos.length === 0) return;
        if (pendingDeleteRepos.length > 50) {
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

        const repoNames = pendingDeleteRepos.map(r => r.name);

        try {
            const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/repo/delete`, {
                data: { repoNames },
                withCredentials: true,
            });

            const { summary } = response.data;
            toast.success(
                `Successfully deleted ${summary.successfulDeletions} of ${summary.total} repositories`
            );

            // Fix: use functional updater to avoid stale closure over `repos`
            const repoSet = new Set(repoNames);
            setRepos(prev => prev.filter(r => !repoSet.has(r.name)));
            setSelectedRepos([]);
            setPendingDeleteRepos([]);
            setTableKey(prev => prev + 1);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || 'Failed to delete repositories');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full bg-[var(--app-bg)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 text-[var(--app-fg)] animate-spin" />
                    <p className="text-[var(--app-fg-muted)] text-lg">Loading repositories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-[var(--app-bg)] flex flex-col">
            <div className="flex-none px-8 pt-6 pb-4 border-b border-[var(--app-border)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="border border-[var(--app-border)] text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] hover:text-[var(--app-fg)]"
                            style={{ backgroundColor: 'transparent' }}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-bold text-[var(--app-fg)]">
                            Repositories ({repos.length})
                        </h1>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedRepos.length > 0 && (
                            <>
                                {allSelectedArePublic && (
                                    <Button
                                        onClick={() => {
                                            setPendingPrivateRepos([...selectedRepos]);
                                            setShowPrivateConfirm(true);
                                        }}
                                        disabled={isOperating}
                                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isMakingPrivate ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Lock className="mr-2 h-4 w-4" />
                                        )}
                                        Make {selectedRepos.length} Private
                                    </Button>
                                )}
                                {allSelectedArePrivate && (
                                    <Button
                                        onClick={() => {
                                            setPendingPublicRepos([...selectedRepos]);
                                            setShowPublicConfirm(true);
                                        }}
                                        disabled={isOperating}
                                        className="bg-green-700 hover:bg-green-800 text-white font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                    >
                                        {isMakingPublic ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Unlock className="mr-2 h-4 w-4" />
                                        )}
                                        Make {selectedRepos.length} Public
                                    </Button>
                                )}
                                <Button
                                    onClick={() => {
                                        setPendingDeleteRepos([...selectedRepos]);
                                        setShowConfirm(true);
                                    }}
                                    disabled={isOperating}
                                    className="bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete {selectedRepos.length} Selected
                                    {selectedRepos.length > 50 && (
                                        <span className="ml-2">(Max 50)</span>
                                    )}
                                </Button>
                            </>
                        )}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-[var(--app-fg-muted)] hover:text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <Sun className="h-5 w-5" />
                            ) : (
                                <Moon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 px-8 pb-4">
                <RepoDataTable
                    key={tableKey}
                    columns={columns}
                    data={repos}
                    onSelectionChange={setSelectedRepos}
                />
            </div>

            {/* Make Private Dialog */}
            <AlertDialog
                open={showPrivateConfirm}
                onOpenChange={open => {
                    setShowPrivateConfirm(open);
                    if (!open) setPendingPrivateRepos([]);
                }}
            >
                <AlertDialogContent
                    className="border"
                    style={{
                        backgroundColor: 'var(--app-surface)',
                        borderColor: 'var(--app-border)',
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[var(--app-fg)] text-xl font-bold">
                            Make {pendingPrivateRepos.length} repositories private?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild className="text-[var(--app-fg-muted)]">
                            <div>
                                The following repositories will be set to private. This can be
                                undone on GitHub.
                                <div
                                    className="mt-4 max-h-52 overflow-y-auto rounded-lg p-4 border custom-scrollbar"
                                    style={{
                                        backgroundColor: 'var(--app-bg)',
                                        borderColor: 'var(--app-border)',
                                    }}
                                >
                                    <ul className="text-sm space-y-1">
                                        {pendingPrivateRepos.map(repo => (
                                            <li
                                                key={repo.id}
                                                className="flex items-center justify-between gap-2 py-1"
                                            >
                                                <span
                                                    className="truncate flex items-center gap-1.5"
                                                    style={{ color: 'var(--app-fg-muted)' }}
                                                >
                                                    {repo.fork && (
                                                        <span className="text-[10px] font-medium text-yellow-500/70 border border-yellow-500/30 rounded px-1">
                                                            fork
                                                        </span>
                                                    )}
                                                    {repo.fullName}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = pendingPrivateRepos.filter(
                                                            r => r.id !== repo.id
                                                        );
                                                        if (updated.length === 0) {
                                                            setShowPrivateConfirm(false);
                                                            setPendingPrivateRepos([]);
                                                        } else {
                                                            setPendingPrivateRepos(updated);
                                                        }
                                                    }}
                                                    className="flex-shrink-0 text-[var(--app-fg-muted)] hover:text-red-400 transition-colors cursor-pointer"
                                                    aria-label={`Remove ${repo.fullName}`}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                {pendingPrivateRepos.some(r => r.fork) && (
                                    <p className="mt-3 text-xs text-yellow-500/80">
                                        ⚠ Forks may fail to go private on GitHub Free — GitHub Pages repos too.
                                    </p>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel
                            className="border text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] hover:text-[var(--app-fg)] cursor-pointer"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: 'var(--app-border)',
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleMakePrivate}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white cursor-pointer border-0"
                        >
                            Make Private
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Make Public Dialog */}
            <AlertDialog
                open={showPublicConfirm}
                onOpenChange={open => {
                    setShowPublicConfirm(open);
                    if (!open) setPendingPublicRepos([]);
                }}
            >
                <AlertDialogContent
                    className="border"
                    style={{
                        backgroundColor: 'var(--app-surface)',
                        borderColor: 'var(--app-border)',
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[var(--app-fg)] text-xl font-bold">
                            Make {pendingPublicRepos.length} repositories public?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild className="text-[var(--app-fg-muted)]">
                            <div>
                                The following repositories will be made public and visible to
                                everyone.
                                <div
                                    className="mt-4 max-h-52 overflow-y-auto rounded-lg p-4 border custom-scrollbar"
                                    style={{
                                        backgroundColor: 'var(--app-bg)',
                                        borderColor: 'var(--app-border)',
                                    }}
                                >
                                    <ul className="text-sm space-y-1">
                                        {pendingPublicRepos.map(repo => (
                                            <li
                                                key={repo.id}
                                                className="flex items-center justify-between gap-2 py-1"
                                            >
                                                <span
                                                    className="truncate"
                                                    style={{ color: 'var(--app-fg-muted)' }}
                                                >
                                                    {repo.fullName}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = pendingPublicRepos.filter(
                                                            r => r.id !== repo.id
                                                        );
                                                        if (updated.length === 0) {
                                                            setShowPublicConfirm(false);
                                                            setPendingPublicRepos([]);
                                                        } else {
                                                            setPendingPublicRepos(updated);
                                                        }
                                                    }}
                                                    className="flex-shrink-0 text-[var(--app-fg-muted)] hover:text-red-400 transition-colors cursor-pointer"
                                                    aria-label={`Remove ${repo.fullName}`}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel
                            className="border text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] hover:text-[var(--app-fg)] cursor-pointer"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: 'var(--app-border)',
                            }}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleMakePublic}
                            className="bg-green-700 hover:bg-green-800 text-white cursor-pointer border-0"
                        >
                            Make Public
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Dialog */}
            <AlertDialog
                open={showConfirm}
                onOpenChange={open => {
                    setShowConfirm(open);
                    if (!open) {
                        setConfirmText('');
                        setPendingDeleteRepos([]);
                    }
                }}
            >
                <AlertDialogContent
                    className="border"
                    style={{
                        backgroundColor: 'var(--app-surface)',
                        borderColor: 'var(--app-border)',
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[var(--app-fg)] text-xl font-bold">
                            Delete {pendingDeleteRepos.length} repositories?
                        </AlertDialogTitle>
                        <AlertDialogDescription asChild className="text-[var(--app-fg-muted)]">
                            <div>
                                This action cannot be undone. The following repositories will be
                                permanently deleted:
                                <div
                                    className="mt-4 max-h-52 overflow-y-auto rounded-lg p-4 border custom-scrollbar"
                                    style={{
                                        backgroundColor: 'var(--app-bg)',
                                        borderColor: 'var(--app-border)',
                                    }}
                                >
                                    <ul className="text-sm space-y-1">
                                        {pendingDeleteRepos.map(repo => (
                                            <li
                                                key={repo.id}
                                                className="flex items-center justify-between gap-2 py-1"
                                            >
                                                <span
                                                    className="truncate"
                                                    style={{ color: 'var(--app-fg-muted)' }}
                                                >
                                                    {repo.fullName}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = pendingDeleteRepos.filter(
                                                            r => r.id !== repo.id
                                                        );
                                                        if (updated.length === 0) {
                                                            setShowConfirm(false);
                                                            setPendingDeleteRepos([]);
                                                            setConfirmText('');
                                                        } else {
                                                            setPendingDeleteRepos(updated);
                                                        }
                                                    }}
                                                    className="flex-shrink-0 text-[var(--app-fg-muted)] hover:text-red-400 transition-colors cursor-pointer"
                                                    aria-label={`Remove ${repo.fullName}`}
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-6 space-y-2">
                                    <p className="text-sm font-medium text-[var(--app-fg)]">
                                        Type{' '}
                                        <span
                                            className="font-mono px-2 py-0.5 rounded text-red-400"
                                            style={{ backgroundColor: 'var(--app-fg-subtle)' }}
                                        >
                                            delete my repos
                                        </span>{' '}
                                        to confirm:
                                    </p>
                                    <Input
                                        value={confirmText}
                                        onChange={e => setConfirmText(e.target.value)}
                                        className="border text-[var(--app-fg)] placeholder:text-[var(--app-fg-muted)]"
                                        style={{
                                            backgroundColor: 'var(--app-bg)',
                                            borderColor: 'var(--app-border)',
                                        }}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel
                            className="border text-[var(--app-fg)] hover:bg-[var(--app-fg-subtle)] hover:text-[var(--app-fg)] cursor-pointer"
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: 'var(--app-border)',
                            }}
                            onClick={() => setConfirmText('')}
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={confirmText !== 'delete my repos'}
                            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
