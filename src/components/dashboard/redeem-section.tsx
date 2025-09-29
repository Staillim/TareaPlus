
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { getGoogleDriveImageUrl } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { User } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';

type GiftCard = {
    id: string;
    name: string;
    points: number;
    logoUrl: string;
    value?: string;
}

type RedeemSectionProps = {
    userPoints: number;
}

export function RedeemSection({ userPoints }: RedeemSectionProps) {
  const { toast } = useToast();
  const [rewards, setRewards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRedeeming, setIsRedeeming] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

   useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRewards = async () => {
        try {
            const rewardsCollection = collection(firestore, "rewards");
            const rewardsSnapshot = await getDocs(rewardsCollection);
            const rewardsList = rewardsSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name,
                    points: data.points,
                    logoUrl: data.logoUrl,
                    value: data.value || ""
                } as GiftCard
            }).sort((a, b) => a.points - b.points);
            setRewards(rewardsList);
        } catch (error) {
            console.error("Error fetching rewards:", error);
            toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las recompensas." });
        } finally {
            setLoading(false);
        }
    }
    fetchRewards();
  }, [toast]);


  const handleRedeem = async (card: GiftCard) => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Error", description: "Debes iniciar sesión para canjear." });
        return;
    }

    if (userPoints < card.points) {
        toast({ variant: "destructive", title: "Puntos Insuficientes", description: `Necesitas ${card.points.toLocaleString()} puntos para canjear esta tarjeta.` });
        return;
    }

    setIsRedeeming(card.id);

    try {
        // 1. Deduct points
        const userRef = doc(firestore, "users", currentUser.uid);
        await updateDoc(userRef, {
            points: increment(-card.points)
        });

        // 2. Create redemption record in subcollection
        const redemptionRef = collection(firestore, "users", currentUser.uid, "redemptions");
        await addDoc(redemptionRef, {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            rewardId: card.id,
            rewardName: card.name,
            rewardLogoUrl: card.logoUrl,
            pointsUsed: card.points,
            status: "pending",
            requestedAt: serverTimestamp(),
            code: null
        });

        toast({
            title: "Canje Enviado a Revisión",
            description: "Un administrador verificará tu solicitud y pronto recibirás el código de tu tarjeta.",
        });

    } catch (error) {
        console.error("Error redeeming card: ", error);
        // Optionally, refund points if redemption record fails
        toast({ variant: "destructive", title: "Error", description: "No se pudo procesar tu canje. Inténtalo de nuevo." });
        
        // Quick and dirty refund - in a real app you might use a transaction
        const userRef = doc(firestore, "users", currentUser.uid);
        await updateDoc(userRef, {
            points: increment(card.points)
        });
    } finally {
        setIsRedeeming(null);
    }
  }

  if (loading) {
    return (
        <section className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-card/80 backdrop-blur-sm flex flex-col aspect-[3/4]">
                    <CardContent className="p-4 flex-grow flex flex-col items-center justify-center space-y-2">
                        <div className="h-full w-full bg-muted/50 rounded-lg animate-pulse" />
                    </CardContent>
                    <CardFooter className="p-2 border-t border-border/20">
                        <div className="h-9 w-full bg-muted/50 rounded animate-pulse" />
                    </CardFooter>
                </Card>
            ))}
          </div>
        </section>
      );
  }
  
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {rewards.map((card) => {
          const canAfford = userPoints >= card.points;
          const isProcessing = isRedeeming === card.id;

          return (
            <Card key={card.id} className={cn("animated-card flex flex-col aspect-[3/4] p-0 overflow-hidden", !canAfford && "opacity-50 grayscale")}>
              <div className="particles-container">
                {[...Array(15)].map((_, i) => <div key={i} className="particle"></div>)}
              </div>
              <CardContent className="p-0 flex-grow relative w-full h-full">
                <Image 
                    src={getGoogleDriveImageUrl(card.logoUrl)} 
                    alt={`${card.name} logo`} 
                    fill={true}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm">
                    <p className="font-bold text-base text-white truncate">{card.name}</p>
                    {card.value && <p className="text-xs text-white/80">{card.value}</p>}
                </div>
              </CardContent>
              <CardFooter className="p-2 mt-auto border-t border-white/10 z-10">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-lg transition-all duration-300 transform hover:scale-105 disabled:bg-white/10" disabled={!canAfford || !!isRedeeming}>
                            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isProcessing ? 'Procesando...' : `${card.points.toLocaleString()} Puntos`}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card/80 backdrop-blur-xl border-border/50">
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar canje?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto deducirá {card.points.toLocaleString()} puntos de tu saldo para obtener una tarjeta de regalo de {card.name}{card.value ? ` de ${card.value}` : ''}. Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRedeem(card)}>Confirmar</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
        )})}
      </div>
    </section>
  );
}
