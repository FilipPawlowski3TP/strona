import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                subscription_expires_at: true,
                is_banned: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const now = new Date();
        const expiresAt = new Date(user.subscription_expires_at);
        const isActive = expiresAt > now && !user.is_banned;

        return NextResponse.json({
            isActive,
            expiresAt: user.subscription_expires_at,
            isBanned: user.is_banned,
            serverTime: now.toISOString()
        });
    } catch (error) {
        console.error("User status error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
