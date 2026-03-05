import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const sessionId = params.id;

        // Try to delete the session only if it belongs to the user
        const deletedSession = await prisma.radarSession.deleteMany({
            where: {
                id: sessionId,
                user_id: user.id
            }
        });

        if (deletedSession.count === 0) {
            return NextResponse.json({ error: "Session not found or unauthorized to delete" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Session deleted" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
