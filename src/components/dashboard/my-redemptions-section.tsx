
"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle, XCircle, Copy } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from "next/image";
import { getGoogleDriveImageUrl } from "@/lib/utils";
import { Button } from "../ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";

type Redemption = {
    id: string;
    rewardName: string;
    rewardLogoUrl: string;
    pointsUsed: number;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: any;
    code: string | null;
};

const statusConfig = {
    pending: { label: "Pendiente", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    approved: { label: "Aprobado", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
    rejected: { label: "Rechazado", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export function MyRedemptionsSection({ userId }: { userId: string }) {
    const [redemptions, setRedemptions] = useState<Redemption[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(firestore, 'redemptions'), 
            where('userId', '==', userId),
            orderBy('requestedAt', 'desc')
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data: Redemption[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Redemption));
            setRedemptions(data);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching redemptions: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cargar tu historial de canjes.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId, toast]);

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast({ title: 'Código Copiado', description: 'El código de tu tarjeta ha sido copiado.' });
    };

    return (
        <section className="space-y-6">
             <h2 className="text-2xl font-bold font-headline text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Mis Canjes</h2>
            <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Historial de Canjes</CardTitle>
                    <CardDescription>Aquí puedes ver todas las recompensas que has canjeado.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center p-10">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : redemptions.length === 0 ? (
                        <p className="text-center text-muted-foreground py-10">Aún no has realizado ningún canje.</p>
                    ) : (
                        <ScrollArea className="h-[400px] pr-4">
                            <div className="space-y-4">
                                {redemptions.map(item => {
                                    const StatusIcon = statusConfig[item.status].icon;
                                    return (
                                        <div key={item.id} className={`p-4 rounded-lg border ${statusConfig[item.status].bg}`}>
                                            <div className="flex items-start gap-4">
                                                <Image src={getGoogleDriveImageUrl(item.rewardLogoUrl)} alt={item.rewardName} width={48} height={48} className="rounded-md border-2 border-white/20" />
                                                <div className="flex-1">
                                                    <p className="font-bold">{item.rewardName}</p>
                                                    <p className="text-sm text-muted-foreground">{item.pointsUsed.toLocaleString()} puntos</p>
                                                    <p className="text-xs text-muted-foreground/80">
                                                        {item.requestedAt ? format(item.requestedAt.toDate(), "dd 'de' LLLL 'de' yyyy, HH:mm", { locale: es }) : ''}
                                                    </p>
                                                </div>
                                                <div className={`flex items-center gap-1.5 text-sm font-semibold ${statusConfig[item.status].color}`}>
                                                    <StatusIcon className="h-4 w-4" />
                                                    <span>{statusConfig[item.status].label}</span>
                                                </div>
                                            </div>
                                            {item.status === 'approved' && item.code && (
                                                <>
                                                <Separator className="my-3 bg-border/50" />
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-semibold text-muted-foreground">CÓDIGO DE TU TARJETA:</p>
                                                        <p className="font-mono text-base font-bold text-primary tracking-wider">{item.code}</p>
                                                    </div>
                                                    <Button size="sm" onClick={() => handleCopyCode(item.code!)}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        Copiar Código
                                                    </Button>
                                                </div>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </section>
    );
}

    