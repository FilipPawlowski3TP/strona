/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: Request,
    { params }: { params: { shareCode: string } }
) {
    try {
        const code = params.shareCode;
        let radarSession;

        // Handle both ID and share_code lookups for flexibility
        if (code.includes('-') && code.length > 10) {
            radarSession = await prisma.radarSession.findUnique({ where: { id: code } });
        } else {
            radarSession = await prisma.radarSession.findUnique({ where: { share_code: code.toUpperCase() } });
        }

        if (!radarSession) {
            return NextResponse.json({ error: "Session not found or expired" }, { status: 404 });
        }

        const owner = await prisma.user.findUnique({
            where: { id: radarSession.user_id },
            select: { username: true }
        });

        return NextResponse.json({
            success: true,
            session: {
                id: radarSession.id,
                mapName: radarSession.map_name,
                owner: owner?.username || "Unknown",
                createdAt: radarSession.created_at.toISOString(),
                expiresAt: radarSession.expires_at.toISOString()
            }
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
