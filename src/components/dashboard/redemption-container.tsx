
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RedeemSection } from "./redeem-section";
import { MyRedemptionsSection } from "./my-redemptions-section";
import { User } from "firebase/auth";

type RedemptionContainerProps = {
    user: User;
    userPoints: number;
}

export function RedemptionContainer({ user, userPoints }: RedemptionContainerProps) {

    return (
        <Tabs defaultValue="redeem" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="redeem">Canjear Recompensas</TabsTrigger>
                <TabsTrigger value="my-redemptions">Mis Canjes</TabsTrigger>
            </TabsList>
            <TabsContent value="redeem">
                <RedeemSection userPoints={userPoints} />
            </TabsContent>
            <TabsContent value="my-redemptions">
                <MyRedemptionsSection userId={user.uid} />
            </TabsContent>
        </Tabs>
    )
}
