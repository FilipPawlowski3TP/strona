import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { username, password, hwid } = await req.json();

        if (!username || !password || !hwid) {
            return NextResponse.json(
                { error: "Username, password and HWID are required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                password: true,
                hwid: true,
                avatar_url: true,
                is_banned: true,
                subscription_expires_at: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        if (user.is_banned) {
            return NextResponse.json(
                { error: "User is banned" },
                { status: 403 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // HWID Logic
        if (user.hwid === null || user.hwid === "") {
            // First time login - HWID Lock
            await prisma.user.update({
                where: { id: user.id },
                data: { hwid: hwid },
            });
        } else if (user.hwid !== hwid) {
            // HWID mismatch
            return NextResponse.json(
                { error: "Invalid Hardware Identifier" },
                { status: 403 }
            );
        }

        const fullAvatarUrl = user.avatar_url
            ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://141.227.151.21${user.avatar_url}`)
            : "http://141.227.151.21/default-avatar.png";

        const expiresAt = new Date(user.subscription_expires_at);
        const now = new Date();
        const diffTime = Math.max(0, expiresAt.getTime() - now.getTime());
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const responseData = {
            status: "success",
            username: user.username,
            avatar_url: fullAvatarUrl,
            is_active: daysLeft > 0,
            days_left: daysLeft,
            hwid: user.hwid
        };

        console.log('API SENDING TO LOADER:', responseData);
        return NextResponse.json(responseData);

    } catch (error) {
        console.error("Loader auth error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
