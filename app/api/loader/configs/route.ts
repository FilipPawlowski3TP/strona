import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const username = url.searchParams.get("username");
        const hwid = url.searchParams.get("hwid");

        if (!username || !hwid) {
            return NextResponse.json(
                { error: "Username and HWID required" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username },
            include: { cloud_configs: true }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid user" },
                { status: 401 }
            );
        }

        if (user.hwid !== hwid) {
            return NextResponse.json(
                { error: "Invalid HWID" },
                { status: 403 }
            );
        }

        if (user.is_banned) {
            return NextResponse.json(
                { error: "User is banned" },
                { status: 403 }
            );
        }

        const configs = user.cloud_configs.map((config) => ({
            id: config.id,
            user_name: user.username,
            name: config.name,
            data: config.data,
            created_at: config.created_at,
        }));

        return NextResponse.json({
            status: "success",
            configs
        });

    } catch (error) {
        console.error("Loader configs error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
