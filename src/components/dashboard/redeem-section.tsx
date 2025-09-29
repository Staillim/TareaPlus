
"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
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
            });
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


  const handleRedeem = (card: GiftCard) => {
      toast({
          title: "¡Canje Exitoso!",
          description: `Has canjeado una tarjeta de ${card.name} por ${card.points.toLocaleString()} puntos.`,
      })
  }

  if (loading) {
    return (
        <section className="space-y-6">
          <h2 className="text-2xl font-bold font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Canjear Recompensas</h2>
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
      <h2 className="text-2xl font-bold font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Canjear Recompensas</h2>
      <div className="grid grid-cols-2 gap-6">
        {rewards.map((card) => {
          const canAfford = userPoints >= card.points;
          return (
            <Card key={card.id} className={cn("animated-card flex flex-col aspect-[3/4] p-0 overflow-hidden", !canAfford && "opacity-50 grayscale")}>
              <div className="particles-container">
                {[...Array(15)].map((_, i) => <div key={i} className="particle"></div>)}
              </div>
              <CardContent className="p-0 flex-grow relative w-full h-full">
                <Image 
                    src={getGoogleDriveImageUrl(card.logoUrl)} 
                    alt={`${card.name} logo`} 
                    layout="fill" 
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
                        <Button className="w-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm shadow-lg transition-all duration-300 transform hover:scale-105 disabled:bg-white/10" disabled={!canAfford}>
                            {card.points.toLocaleString()} Puntos
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card/80 backdrop-blur-xl border-border/50">
                        <AlertDialogHeader>
                        <AlertDialogTitle>¿Confirmar canje?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esto deducirá {card.points.toLocaleString()} puntos de tu saldo para obtener una tarjeta de regalo de {card.name}{card.value ? ` de ${card.value}` : ''}.
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
