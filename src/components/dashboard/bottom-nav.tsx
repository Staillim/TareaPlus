"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

type BottomNavProps = {
  items: NavItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
};

export function BottomNav({ items, activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/50 border-t border-border/20 shadow-lg backdrop-blur-sm md:hidden z-20">
      <div className="flex justify-around">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full pt-3 pb-2 text-sm transition-colors duration-200",
              activeTab === item.id
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span className="text-xs">{item.label}</span>
            {activeTab === item.id && (
              <div className="w-8 h-1 bg-primary rounded-t-full mt-1.5"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
