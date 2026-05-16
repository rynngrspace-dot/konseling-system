"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BookOpenCheck, Lock, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock delay for UX
    setTimeout(() => {
      // Mock routing based on username prefix for now
      const username = (document.getElementById("username") as HTMLInputElement).value;
      if (username.toLowerCase() === "admin") {
        router.push("/dashboard/bk");
      } else {
        router.push("/dashboard/siswa");
      }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-50/50 p-4 overflow-hidden">
      <div className="w-full max-w-[380px] space-y-6 animate-in-fade">
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <BookOpenCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Portal Konseling
            </h1>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-widest">
              SMP Bina Karya Ngamprah
            </p>
          </div>
        </div>

        <Card className="border border-border/50 bg-white rounded-2xl shadow-sm ring-0">
          <CardHeader className="space-y-1.5 pt-8 pb-6">
            <CardTitle className="text-xl font-bold tracking-tight text-center text-slate-800">Selamat Datang</CardTitle>
            <CardDescription className="text-center text-sm px-4 text-slate-500 font-medium">
              Masuk ke akun Anda
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 px-8 pb-2">
              {/* Username */}
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs font-semibold ml-1 text-slate-500 uppercase tracking-widest">Username / NISN</Label>
                <div className="relative group">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    placeholder="Contoh: 12345678"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-primary transition-all rounded-lg text-sm font-medium shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-primary font-semibold hover:underline transition-all"
                  >
                    Lupa?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-primary transition-all rounded-lg text-sm font-medium shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-none bg-transparent pt-4 pb-8 px-8">
              <Button
                type="submit"
                className="w-full h-11 rounded-lg font-bold transition-all hover:opacity-90 active:scale-[0.98] text-sm bg-primary text-primary-foreground shadow-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Memproses...
                  </div>
                ) : "Masuk"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer info */}
        <div className="text-center space-y-0.5 opacity-60">
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            &copy; 2026 Tim Pengembang SMP Bina Karya Ngamprah
          </p>
        </div>
      </div>
    </div>
  );
}
