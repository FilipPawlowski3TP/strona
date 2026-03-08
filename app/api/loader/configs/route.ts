import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch all configs for a specific user after HWID verification
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const hwid = searchParams.get("hwid");

    if (!username || !hwid) {
        return NextResponse.json({ error: "Missing username or hwid" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                hwid: true,
                avatar_url: true,
                subscription_expires_at: true,
                cloud_configs: true,
            }
        });

        if (!user || user.hwid !== hwid) {
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }

        const fullAvatarUrl = user.avatar_url
            ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://141.227.151.21${user.avatar_url}`)
            : "http://141.227.151.21/default-avatar.png";

        const responseData = {
            is_active: daysLeft > 0,
            days_left: daysLeft,
            avatar_url: fullAvatarUrl,
            configs: user.cloud_configs.map(config => ({
                id: config.id,
                name: config.name,
                data: config.data
            }))
        };

        console.log('API SENDING CONFIGS TO LOADER:', responseData);
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Fetch configs error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Save or overwrite a user configuration
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, hwid, name, data } = body;

        if (!username || !hwid || !name || !data) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                hwid: true,
                avatar_url: true,
                username: true,
                subscription_expires_at: true,
            }
        });

        if (!user || user.hwid !== hwid) {
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }

        // Upsert logic: find existing by name and userId
        const existingConfig = await prisma.cloudConfig.findFirst({
            where: {
                userId: user.id,
                name: name
            }
        });

        if (existingConfig) {
            await prisma.cloudConfig.update({
                where: { id: existingConfig.id },
                data: { data }
            });
        } else {
            await prisma.cloudConfig.create({
                data: {
                    userId: user.id,
                    name: name,
                    data: data
                }
            });
        }

        const fullAvatarUrl = user.avatar_url
            ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://141.227.151.21${user.avatar_url}`)
            : "http://141.227.151.21/default-avatar.png";

        const responseData = {
            success: true,
            message: "Config saved",
            is_active: daysLeft > 0,
            days_left: daysLeft,
            avatar_url: fullAvatarUrl
        };

        console.log('API SENDING SAVE STATUS TO LOADER:', responseData);
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Save config error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: Remove a configuration by name
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const hwid = searchParams.get("hwid");
    const name = searchParams.get("name");

    if (!username || !hwid || !name) {
        return NextResponse.json({ error: "Missing required query params" }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                hwid: true,
                avatar_url: true,
                username: true,
                subscription_expires_at: true,
            }
        });

        if (!user || user.hwid !== hwid) {
            return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
        }

        const configToDelete = await prisma.cloudConfig.findFirst({
            where: {
                userId: user.id,
                name: name
            }
        });

        if (!configToDelete) {
            return NextResponse.json({ error: "Config not found" }, { status: 404 });
        }

        await prisma.cloudConfig.delete({
            where: { id: configToDelete.id }
        });

        const fullAvatarUrl = user.avatar_url
            ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://141.227.151.21${user.avatar_url}`)
            : "http://141.227.151.21/default-avatar.png";

        const responseData = {
            success: true,
            message: "Config deleted",
            is_active: daysLeft > 0,
            days_left: daysLeft,
            avatar_url: fullAvatarUrl
        };

        console.log('API SENDING DELETE STATUS TO LOADER:', responseData);
        return NextResponse.json(responseData);
    } catch (error) {
        console.error("Delete config error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
