import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const adminKey = req.headers.get("x-admin-key");

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { userId, days } = await req.json();

        if (!userId || typeof days !== "number") {
            return NextResponse.json({ error: "User ID and days are required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { subscription_expires_at: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const currentExpiry = new Date(user.subscription_expires_at);
        const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
        const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: userId },
            data: { subscription_expires_at: newExpiry }
        });

        return NextResponse.json({ success: true, message: `Added ${days} days. New expiry: ${newExpiry.toISOString()}` });
    } catch (error) {
        console.error("Admin subscription update error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
