
"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, getDoc, doc } from "firebase/firestore";
import { firestore } from "@/lib/firebase/firebase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, PlusCircle, MinusCircle, HelpCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type HistoryItem = {
    id: string;
    taskId?: string;
    rewardId?: string;
    points: number;
    type: 'earned' | 'spent';
    completedAt: any;
};

type ItemDetails = {
    [id: string]: string; // taskId or rewardId -> name
};

export function PointsHistory({ userId }: { userId: string }) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemDetails, setItemDetails] = useState<ItemDetails>({});

    useEffect(() => {
        const historyQuery = query(collection(firestore, `users/${userId}/completedTasksHistory`), orderBy('completedAt', 'desc'));
        
        const unsubscribe = onSnapshot(historyQuery, async (snapshot) => {
            const historyData: HistoryItem[] = [];
            const detailsToFetch: { type: 'task' | 'reward'; id: string }[] = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                const item: HistoryItem = {
                    id: doc.id,
                    ...data,
                    type: 'earned', // Assuming all history is earning for now
                } as HistoryItem;
                historyData.push(item);
                if (data.taskId && !itemDetails[data.taskId]) {
                    detailsToFetch.push({ type: 'task', id: data.taskId });
                }
                // Add spent logic later
            });

            if (detailsToFetch.length > 0) {
                const newDetails: ItemDetails = {};
                const promises = detailsToFetch.map(async (detail) => {
                    const collectionName = detail.type === 'task' ? 'tasks' : 'rewards';
                    const docRef = doc(firestore, collectionName, detail.id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        newDetails[detail.id] = docSnap.data().title || docSnap.data().name || "Item Desconocido";
                    }
                });
                await Promise.all(promises);
                setItemDetails(prev => ({...prev, ...newDetails}));
            }

            setHistory(historyData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);

    const renderIcon = (item: HistoryItem) => {
        if (item.type === 'earned') {
            return <PlusCircle className="h-5 w-5 text-green-500" />;
        }
        if (item.type === 'spent') {
            return <MinusCircle className="h-5 w-5 text-red-500" />;
        }
        return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    };

    return (
        <Card className="bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Historial de Puntos</CardTitle>
                <CardDescription>Un registro de tus puntos ganados y gastados.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center items-center p-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-10">Aún no tienes movimientos en tu historial.</p>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-4">
                            {history.map(item => {
                                const detailKey = item.taskId || item.rewardId;
                                const description = detailKey ? itemDetails[detailKey] : (item.type === 'earned' ? 'Puntos ganados' : 'Puntos gastados');
                                const timeAgo = item.completedAt ? formatDistanceToNow(item.completedAt.toDate(), { addSuffix: true, locale: es }) : '';

                                return (
                                    <div key={item.id} className="flex items-center gap-4">
                                        {renderIcon(item)}
                                        <div className="flex-1">
                                            <p className="font-semibold">{description}</p>
                                            <p className="text-sm text-muted-foreground">{timeAgo}</p>
                                        </div>
                                        <div className={`font-bold ${item.type === 'earned' ? 'text-green-500' : 'text-red-500'}`}>
                                            {item.type === 'earned' ? '+' : '-'}{item.points.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
