"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Award } from "lucide-react";

type HeaderProps = {
  username: string;
  points: number;
  onLogout: () => void;
};

export function Header({ username, points, onLogout }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-card shadow-sm">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`} />
          <AvatarFallback>{username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-bold font-headline">{username}</h1>
          <div className="flex items-center gap-1 text-sm text-primary">
            <Award className="h-4 w-4" />
            <span>{(points || 0).toLocaleString()} Puntos</span>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onLogout} aria-label="Cerrar sesión">
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}
