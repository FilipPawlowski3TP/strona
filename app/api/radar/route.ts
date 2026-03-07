import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

function generateShareCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function GET() {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const radarSessions = await prisma.radarSession.findMany({
            where: { user_id: user.id },
            orderBy: { created_at: 'desc' }
        });

        // Convert Prisma objects to match what the frontend expects
        const formattedSessions = radarSessions.map(rs => ({
            id: rs.id,
            share_code: rs.share_code,
            map_name: rs.map_name,
            created_at: rs.created_at.toISOString(),
            expires_at: rs.expires_at.toISOString()
        }));

        return NextResponse.json({ success: true, sessions: formattedSessions });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await request.json();
        const mapName = body.mapName || 'Unknown';
        const shareCode = generateShareCode();
        // 24 hours expiry
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const newSession = await prisma.radarSession.create({
            data: {
                user_id: user.id,
                share_code: shareCode,
                map_name: mapName,
                expires_at: expiresAt
            }
        });

        return NextResponse.json({
            success: true,
            session: {
                id: newSession.id,
                shareCode: newSession.share_code,
                mapName: newSession.map_name,
                expiresAt: newSession.expires_at.toISOString()
            }
        });
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
