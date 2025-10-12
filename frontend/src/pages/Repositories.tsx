import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { RepoDataTable } from "@/components/RepoDataTable";
import { columns } from "@/components/RepoColumns";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
}

export default function Repositories() {
  const [repos, setRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/api/repo/all', { withCredentials: true })
      .then(res => {
        setRepos(res.data.repos || res.data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch repositories");
        navigate('/dashboard');
      });
  }, [navigate]);

  const handleDelete = async () => {
    if (selectedRepos.length === 0) return;
    if (selectedRepos.length > 50) {
      toast.error("You can only delete up to 50 repositories at once");
      return;
    }

    setIsDeleting(true);
    setShowConfirm(false);

    try {
      const repoNames = selectedRepos.map(r => r.name);
      const response = await axios.delete('http://localhost:3000/api/repos/bulk', {
        data: { repoNames },
        withCredentials: true
      });

      const { summary } = response.data;

      toast.success(`Successfully deleted ${summary.successfulDeletions} of ${summary.total} repositories`);

      setRepos(repos.filter(r => !repoNames.includes(r.name)));
      setSelectedRepos([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete repositories");
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ededed]">Loading repositories...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-[#ededed] hover:bg-[#ededed]/10"
            >
              <ArrowLeft />
            </Button>
            <h1 className="text-3xl font-bold text-[#ededed]">
              Repositories ({repos.length})
            </h1>
          </div>

          {selectedRepos.length > 0 && (
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete {selectedRepos.length} Selected
              {selectedRepos.length > 50 && " (Max 50)"}
            </Button>
          )}
        </div>

        <RepoDataTable
          columns={columns}
          data={repos}
          onSelectionChange={setSelectedRepos}
        />

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent className="bg-[#0a0a0a] border-[#ededed]/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[#ededed]">
                Delete {selectedRepos.length} repositories?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[#ededed]/60">
                This action cannot be undone. The following repositories will be permanently deleted:
                <div className="mt-4 max-h-40 overflow-y-auto">
                  <ul className="list-disc list-inside text-sm">
                    {selectedRepos.slice(0, 10).map(repo => (
                      <li key={repo.id}>{repo.full_name}</li>
                    ))}
                    {selectedRepos.length > 10 && (
                      <li>...and {selectedRepos.length - 10} more</li>
                    )}
                  </ul>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-[#ededed]/20 text-[#ededed]">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
