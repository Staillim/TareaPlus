
"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot, collection, query, where, updateDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { TasksSection } from "@/components/dashboard/tasks-section";
import { ReferralsSection } from "@/components/dashboard/referrals-section";
import { RedeemSection } from "@/components/dashboard/redeem-section";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Home, Gift, Users, LogOut } from "lucide-react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export type UserData = {
  username: string;
  points: number;
  referrals: number;
  referralCode: string;
  role: 'user' | 'admin';
  completedTasks: string[];
};

const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const unsubscribeUser = onSnapshot(userDocRef, async (doc) => {
          if (doc.exists()) {
            const data = doc.data() as Omit<UserData, 'referrals'>;
            if (data.role === 'admin') {
              router.push('/admin/dashboard');
              return; 
            }

            if (!data.referralCode) {
                const newReferralCode = generateReferralCode();
                await updateDoc(userDocRef, { referralCode: newReferralCode });
                setUserData(prev => ({ ...prev, referralCode: newReferralCode } as UserData));
            }

            setUserData(prevData => ({ ...prevData, ...data } as UserData));
          } else {
             router.push("/");
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
            router.push("/");
        });

        const referralsRef = collection(firestore, "referrals");
        const q = query(referralsRef, where("referrerId", "==", currentUser.uid));
        const unsubscribeReferrals = onSnapshot(q, (snapshot) => {
            setUserData(prevData => ({ ...prevData, referrals: snapshot.size } as UserData));
        });

        return () => {
          unsubscribeUser();
          unsubscribeReferrals();
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };
  
  if (loading || !user || !userData) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "redeem", label: "Canjear", icon: Gift },
    { id: "referrals", label: "Referidos", icon: Users },
  ];

  const renderContent = () => {
    switch(activeTab) {
      case "home": return <TasksSection userId={user.uid} completedTasks={userData.completedTasks || []} />;
      case "redeem": return <RedeemSection userPoints={userData.points} />;
      case "referrals": return <ReferralsSection referrals={userData.referrals || 0} referralCode={userData.referralCode} />;
      default: return <TasksSection userId={user.uid} completedTasks={userData.completedTasks || []} />;
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar collapsible="icon" className="hidden md:flex bg-sidebar/80 backdrop-blur-xl border-r border-border/20">
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => setActiveTab(item.id)} isActive={activeTab === item.id} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
          <Header username={userData.username} points={userData.points} onLogout={handleLogout}>
             <SidebarTrigger className="md:hidden ml-2" />
          </Header>
          
          <main className="flex-grow overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
            {renderContent()}
          </main>
        </div>

        <BottomNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </SidebarProvider>
  );
}
