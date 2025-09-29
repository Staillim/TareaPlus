
"use client";

import { useState, useEffect, useTransition } from "react";
import { collection, onSnapshot, doc, updateDoc, getDocs, writeBatch, increment } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Clock, XCircle, Copy, TicketCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from "next/image";
import { getGoogleDriveImageUrl } from "@/lib/utils";
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
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type Redemption = {
    id: string;
    userId: string;
    userEmail: string;
    rewardName: string;
    rewardLogoUrl: string;
    pointsUsed: number;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: any;
    code: string | null;
}

const statusConfig = {
    pending: { label: "Pendiente", icon: Clock, color: "bg-yellow-500" },
    approved: { label: "Aprobado", icon: CheckCircle, color: "bg-green-500" },
    rejected: { label: "Rechazado", icon: XCircle, color: "bg-red-500" },
}

export function ManageRedemptions() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const fetchAllRedemptions = async () => {
        try {
            const usersSnapshot = await getDocs(collection(firestore, "users"));
            const allRedemptions: Redemption[] = [];
            
            for (const userDoc of usersSnapshot.docs) {
                const redemptionsSnapshot = await getDocs(collection(firestore, `users/${userDoc.id}/redemptions`));
                redemptionsSnapshot.forEach(redemptionDoc => {
                    allRedemptions.push({ id: redemptionDoc.id, ...redemptionDoc.data() } as Redemption);
                });
            }
            
            // Sort by date descending
            allRedemptions.sort((a, b) => b.requestedAt.toDate() - a.requestedAt.toDate());

            setRedemptions(allRedemptions);
        } catch (error) {
            console.error("Error fetching redemptions: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar los canjes.' });
        } finally {
            setLoading(false);
        }
    };
    
    fetchAllRedemptions();
    
    // Note: This component will not update in real-time to avoid complex listener management.
    // It fetches data once on component mount. A pull-to-refresh or a manual refresh button would be a good addition.

  }, [toast]);

  const handleUpdateStatus = (item: Redemption, newStatus: 'approved' | 'rejected') => {
    startTransition(async () => {
        if (newStatus === 'approved' && !code) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes introducir un código para aprobar el canje.' });
            return;
        }

        try {
            const batch = writeBatch(firestore);
            
            const redemptionRef = doc(firestore, "users", item.userId, "redemptions", item.id);
            batch.update(redemptionRef, {
                status: newStatus,
                code: newStatus === 'approved' ? code : null,
            });

            if (newStatus === 'rejected') {
                const userRef = doc(firestore, "users", item.userId);
                batch.update(userRef, {
                    points: increment(item.pointsUsed)
                });
            }

            await batch.commit();

            // Optimistically update local state
            setRedemptions(prev => prev.map(r => r.id === item.id ? {...r, status: newStatus, code: newStatus === 'approved' ? code : null} : r));

            if (newStatus === 'rejected') {
                toast({ title: 'Canje Rechazado', description: `Se han devuelto ${item.pointsUsed.toLocaleString()} puntos al usuario.` });
            } else {
                toast({ title: 'Estado Actualizado', description: `El canje ha sido marcado como ${statusConfig[newStatus].label.toLowerCase()}.` });
            }
            
            setCode(""); 
        } catch (error) {
            console.error("Error updating status: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo actualizar el estado del canje.' });
        }
    });
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado", description: "El código ha sido copiado." });
  }

  if (loading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gestionar Canjes</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestionar Solicitudes de Canje</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Recompensa</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones / Código</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {redemptions.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.userEmail}</TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Image src={getGoogleDriveImageUrl(item.rewardLogoUrl)} alt={item.rewardName} width={24} height={24} className="rounded-sm" />
                        <span>{item.rewardName}</span>
                    </div>
                </TableCell>
                <TableCell>{item.pointsUsed.toLocaleString()}</TableCell>
                <TableCell>{item.requestedAt ? formatDistanceToNow(item.requestedAt.toDate(), { addSuffix: true, locale: es }) : 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={statusConfig[item.status].color}>
                    {statusConfig[item.status].label}
                  </Badge>
                </TableCell>
                <TableCell>
                    {item.status === 'pending' && (
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button size="sm">
                                    <TicketCheck className="mr-2 h-4 w-4" />
                                    Revisar
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Revisar Canje</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Aprueba o rechaza la solicitud para {item.rewardName} del usuario {item.userEmail}. Al aprobar, introduce el código. Al rechazar, los puntos se devolverán al usuario.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-2">
                                    <Label htmlFor="card-code">Código de la Tarjeta (si se aprueba)</Label>
                                    <Input id="card-code" onChange={(e) => setCode(e.target.value)} placeholder="Ej: ABCD-1234-EFGH" />
                                </div>
                                <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setCode("")}>Cancelar</AlertDialogCancel>
                                 <Button variant="destructive" onClick={() => handleUpdateStatus(item, 'rejected')} disabled={isPending}>
                                     {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                     Rechazar
                                </Button>
                                <AlertDialogAction onClick={() => handleUpdateStatus(item, 'approved')} disabled={isPending || !code}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Aprobar
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {item.status === 'approved' && item.code && (
                        <div className="flex items-center gap-2">
                           <span className="font-mono text-sm bg-muted p-1 rounded">{item.code}</span>
                           <Button variant="ghost" size="icon" onClick={() => handleCopy(item.code!)}>
                                <Copy className="h-4 w-4" />
                           </Button>
                        </div>
                    )}
                     {item.status === 'rejected' && (
                        <span className="text-sm text-muted-foreground">Rechazado</span>
                    )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
