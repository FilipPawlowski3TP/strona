import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
            select: { username: true, subscription_expires_at: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const currentExpiry = new Date(user.subscription_expires_at);
        const now = new Date();

        // If already expired, start from now. If active, extend from current expiry.
        const baseDate = currentExpiry > now ? currentExpiry : now;
        const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: userId },
            data: { subscription_expires_at: newExpiry }
        });

        // Revalidate paths for real-time updates
        revalidatePath("/admin");
        revalidatePath("/dashboard");

        return NextResponse.json({
            success: true,
            message: `Success: Added ${days} days to ${user.username}`
        });
    } catch (error) {
        console.error("Admin update-days error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
