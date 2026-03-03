import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

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

        // Success - Return cloud_config and subscription status
        return NextResponse.json({
            status: "success",
            subscription_expires_at: user.subscription_expires_at,
            is_expired: new Date() > new Date(user.subscription_expires_at),
            cloud_config: user.cloud_config,
        });

    } catch (error) {
        console.error("Loader auth error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
