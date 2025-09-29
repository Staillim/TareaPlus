"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase/firebase";
import { useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { TasksSection } from "@/components/dashboard/tasks-section";
import { ReferralsSection } from "@/components/dashboard/referrals-section";
import { RedeemSection } from "@/components/dashboard/redeem-section";
import { BottomNav } from "@/components/dashboard/bottom-nav";
import { Home, Gift, Users } from "lucide-react";
import { Loader2 } from "lucide-react";

export type UserData = {
  username: string;
  points: number;
  referrals: number;
  referralCode: string;
  role: 'user' | 'admin';
  completedTasks: string[];
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
        
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data() as UserData;
            if (data.role === 'admin') {
              router.push('/admin/dashboard');
              return;
            }
            setUserData(data);
          } else {
             router.push("/");
          }
          setLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
            router.push("/");
        });

        return () => unsubscribeSnapshot();
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

  return (
    <div className="flex flex-col min-h-screen text-foreground font-body">
      <Header username={userData.username} points={userData.points} onLogout={handleLogout} />
      
      <main className="flex-grow overflow-y-auto p-4 md:p-6 pb-24">
        {activeTab === "home" && <TasksSection userId={user.uid} completedTasks={userData.completedTasks} />}
        {activeTab === "redeem" && <RedeemSection userPoints={userData.points} />}
        {activeTab === "referrals" && <ReferralsSection referrals={userData.referrals} referralCode={userData.referralCode} />}
      </main>

      <BottomNav items={navItems} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
