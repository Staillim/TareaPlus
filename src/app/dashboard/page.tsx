"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { TasksSection } from "@/components/dashboard/tasks-section";
import { ReferralsSection } from "@/components/dashboard/referrals-section";
import { RedeemSection } from "@/components/dashboard/redeem-section";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Home, Gift, Users, LogOut } from "lucide-react";
import { Loader2 } from "lucide-react";

type UserData = {
  username: string;
  points: number;
  referrals: number;
  referralCode: string;
  role: 'user' | 'admin';
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          
          if (data.role === 'admin') {
            router.push('/admin/dashboard');
            return;
          }

          setUserData({
            username: data.username || "Usuario",
            points: data.points || 1250,
            referrals: data.referrals || 5,
            referralCode: data.referralCode || "AB-12345",
            role: data.role || 'user',
          });
        } else {
           // Fallback mock data for user
           setUserData({
            username: "Usuario",
            points: 1250,
            referrals: 5,
            referralCode: "AB-12345",
            role: 'user',
          });
        }
      } else {
        router.push("/");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };
  
  if (!user || !userData) {
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

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header username={userData.username} points={userData.points} onLogout={handleLogout} />
      
      <main className="flex-grow overflow-y-auto p-4 pb-20">
        {activeTab === "home" && <TasksSection />}
        {activeTab === "redeem" && <RedeemSection userPoints={userData.points} />}
        {activeTab === "referrals" && <ReferralsSection referrals={userData.referrals} referralCode={userData.referralCode} />}
      </main>

      <BottomNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
