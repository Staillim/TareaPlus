
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, Settings, PlusCircle, List, Gift, LogOut, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsCards } from "@/components/admin/stats-cards";
import { CreateTaskForm } from "@/components/admin/create-task-form";
import { ManageTasksTable } from "@/components/admin/manage-tasks-table";
import { ManageRewards } from "@/components/admin/manage-rewards";
import { ManageUsersTable } from "@/components/admin/manage-users-table";

type AdminData = {
  username: string;
};

type View = 'dashboard' | 'create-task' | 'manage-tasks' | 'manage-rewards' | 'manage-users';

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [activeView, setActiveView] = useState<View>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setUser(currentUser);
          const data = userDoc.data();
          setAdminData({
            username: data.username || "Admin",
          });
          setLoading(false);
        } else {
          // Not an admin or document doesn't exist, redirect
          router.push("/dashboard");
        }
      } else {
        // Not logged in
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading || !adminData) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return <StatsCards />;
      case 'create-task':
        return <CreateTaskForm />;
      case 'manage-tasks':
        return <ManageTasksTable />;
      case 'manage-rewards':
        return <ManageRewards />;
      case 'manage-users':
        return <ManageUsersTable />;
      default:
        return <StatsCards />;
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
        <Sidebar collapsible="icon" className="hidden md:flex">
            <SidebarHeader>
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${adminData.username}`} />
                        <AvatarFallback>{adminData.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="font-semibold text-lg">{adminData.username}</p>
                        <p className="text-sm text-gray-500">Administrador</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'} tooltip="Dashboard">
                            <LayoutDashboard />
                            <span>Dashboard</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveView('create-task')} isActive={activeView === 'create-task'} tooltip="Crear Tarea">
                            <PlusCircle />
                           <span>Crear Tarea</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveView('manage-tasks')} isActive={activeView === 'manage-tasks'} tooltip="Gestionar Tareas">
                            <List />
                            <span>Gestionar Tareas</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveView('manage-users')} isActive={activeView === 'manage-users'} tooltip="Gestionar Usuarios">
                            <Users />
                            <span>Usuarios</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={() => setActiveView('manage-rewards')} isActive={activeView === 'manage-rewards'} tooltip="Gestionar Recompensas">
                            <Gift />
                            <span>Recompensas</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                     <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Cerrar Sesión">
                            <LogOut />
                             <span>Cerrar Sesión</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
            <header className="flex h-14 items-center justify-between gap-4 border-b bg-white px-6 dark:bg-gray-800 md:justify-end">
                <SidebarTrigger className="md:hidden" />
                <Button variant="ghost" size="icon">
                    <Settings className="h-6 w-6" />
                    <span className="sr-only">Settings</span>
                </Button>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
                {renderContent()}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
