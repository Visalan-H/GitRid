import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, GitBranch, LogOut } from "lucide-react";

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
    axios.get('http://localhost:3000/api/auth/me', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        navigate('/');
      });
  }, [navigate]);

  const handleLogout = async () => {
    await axios.post('http://localhost:3000/api/auth/logout', {}, { withCredentials: true });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#ededed]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#ededed]">Dashboard</h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-[#ededed]/20 text-[#ededed] hover:bg-[#ededed]/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-[#0a0a0a] border-[#ededed]/10">
            <CardHeader>
              <CardTitle className="text-[#ededed]">Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-[#ededed] text-black">
                  {user?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-[#ededed]">{user?.username}</h2>
                <p className="text-[#ededed]/60">{user?.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0a0a0a] border-[#ededed]/10">
            <CardHeader>
              <CardTitle className="text-[#ededed]">Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-[#ededed] text-2xl font-bold">
                <Trash2 className="h-6 w-6 text-red-500" />
                {user?.deletedRepoCount} repos deleted
              </div>
            </CardContent>
          </Card>
        </div>

        <Button
          size="lg"
          onClick={() => navigate('/repos')}
          className="w-full bg-[#ededed] text-black hover:bg-[#ededed]/90 h-14 text-base font-semibold"
        >
          <GitBranch className="mr-2 h-5 w-5" />
          Manage Repositories
        </Button>
      </div>
    </div>
  );
}
