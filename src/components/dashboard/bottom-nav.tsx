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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg md:hidden">
      <div className="flex justify-around">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full pt-2 pb-1 text-sm transition-colors duration-200",
              activeTab === item.id
                ? "text-primary"
                : "text-muted-foreground hover:bg-accent/50"
            )}
          >
            <item.icon className="h-6 w-6 mb-1" />
            <span>{item.label}</span>
            {activeTab === item.id && (
              <div className="w-12 h-1 bg-primary rounded-t-full mt-1"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
