import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const adminKey = req.headers.get("x-admin-key");

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                username: true,
                email: true,
                avatar_url: true,
                hwid: true,
                subscription_expires_at: true,
                createdAt: true,
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Admin fetch users error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
