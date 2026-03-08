import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const adminKey = req.headers.get("x-admin-key");

    if (adminKey !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { hwid: null }
        });

        return NextResponse.json({ success: true, message: "HWID reset successfully" });
    } catch (error) {
        console.error("Admin HWID reset error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
