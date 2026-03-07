import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface SessionUser {
    id: string;
    username: string;
    email: string;
}

interface UpdateData {
    email?: string;
    avatar_url?: string;
}

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as SessionUser)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { email, avatar_url, avatarUrl } = body;
        const finalAvatarUrl = avatarUrl || avatar_url;

        // Prepare update data
        const updateData: UpdateData = {};
        if (email) {
            // Check if email is already used by someone else
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser && existingUser.id !== (session.user as SessionUser).id) {
                return NextResponse.json({ error: "Email is already in use by another account." }, { status: 400 });
            }
            updateData.email = email;
        }

        if (finalAvatarUrl !== undefined) {
            updateData.avatar_url = finalAvatarUrl;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        // Update database
        const userId = (session.user as SessionUser).id;

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully"
        });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
