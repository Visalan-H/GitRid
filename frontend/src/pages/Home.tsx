import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export default function Home() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3000/api/auth/github/url';
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ededed] rounded-full filter blur-[150px] opacity-[0.08] animate-float"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ededed] rounded-full filter blur-[150px] opacity-[0.08] animate-float-delay"></div>
      </div>

      {/* Dot grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ededed 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-12 px-4">
        <div className="space-y-6">
          <h1 className="text-[4rem] md:text-[6rem] font-bold text-[#ededed] tracking-[-0.02em] leading-none">
            GitRid
          </h1>
          <p className="text-[#ededed]/50 text-lg md:text-xl font-light max-w-xl mx-auto">
            Bulk delete GitHub repositories in seconds
          </p>
        </div>
        
        <Button
          size="lg"
          onClick={handleLogin}
          className="bg-[#ededed] text-xl cursor-pointer text-black hover:bg-[#ededed]/90 font-semibold px-6 h-12 rounded-lg shadow-lg hover:shadow-xl hover:scale-[0.95] transition-all duration-200"
        >
            <Github className="size-7 mr-2 bg-black p-[4px] rounded-full" fill="#ededed" stroke="#ededed"  />
          Sign in with Github
        </Button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-30px, -30px) scale(1.1);
          }
        }
        
        .animate-float {
          animation: float 25s ease-in-out infinite;
        }
        
        .animate-float-delay {
          animation: float 25s ease-in-out infinite;
          animation-delay: -12.5s;
        }
      `}</style>
    </div>
  );
}
