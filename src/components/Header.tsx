'use client';

import Link from 'next/link';
import { User, LogOut, Upload, Brain, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Logo from '@/components/icons/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useAuth, useUser } from '@/firebase';

export default function Header() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/quiz" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
            <Brain className="h-6 w-6 text-primary" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-primary transition-colors">
            Quiz<span className="text-primary">athon</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-700 leading-none">{user.displayName?.split(' ')[0] || 'Student'}</span>
              <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
                {user.email === 'admin@gmail.com' ? 'Administrator' : 'Challenger'}
              </span>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-white shadow-md hover:ring-primary/20 transition-all p-0 overflow-hidden">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user?.photoURL ?? "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.uid || "guest")} alt={user?.displayName ?? "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {user?.displayName?.[0] || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mt-2 p-1 border-gray-100 shadow-xl rounded-xl bg-white/95 backdrop-blur-sm" align="end" forceMount>
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal p-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold text-gray-900 leading-none">{user.displayName || 'Student'}</p>
                      <p className="text-xs leading-none text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <div className="p-1 space-y-1">
                    {user.email === 'admin@gmail.com' && (
                      <>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary font-medium">
                          <Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer focus:bg-primary/5 focus:text-primary font-medium">
                          <Link href="/quiz/upload"><Upload className="mr-2 h-4 w-4" />Upload Questions</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-100 my-1" />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 font-medium">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </div>
                </>
              ) : (
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-bold justify-center py-2 bg-primary/5 text-primary">
                  <Link href="/login">Log In</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
