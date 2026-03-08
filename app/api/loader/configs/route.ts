import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// CORS headers configuration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

// Common logic for subscription metadata
function getSubscriptionMetadata(user: { subscription_expires_at: Date, avatar_url: string | null, username: string }) {
    const expiresAt = new Date(user.subscription_expires_at);
    const now = new Date();
    const diffTime = Math.max(0, expiresAt.getTime() - now.getTime());
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const fullAvatarUrl = user.avatar_url
        ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://141.227.151.21:3000${user.avatar_url}`)
        : "http://141.227.151.21:3000/default-avatar.png";

    return {
        is_active: daysLeft > 0,
        days_left: daysLeft,
        avatar_url: fullAvatarUrl
    };
}

// GET: Fetch all configs for a specific user after HWID verification
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const hwid = searchParams.get("hwid");

    if (!username || !hwid) {
        return NextResponse.json({ error: "Missing username or hwid" }, { status: 400, headers: corsHeaders });
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
            return NextResponse.json({ error: "Authentication failed" }, { status: 401, headers: corsHeaders });
        }

        const metadata = getSubscriptionMetadata(user);

        const responseData = {
            ...metadata,
            configs: user.cloud_configs.map(config => ({
                id: config.id,
                name: config.name,
                data: config.data
            }))
        };

        console.log('API SENDING CONFIGS TO LOADER:', responseData);
        return NextResponse.json(responseData, { headers: corsHeaders });
    } catch (error) {
        console.error("Fetch configs error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}

// POST: Save or overwrite a user configuration
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { username, hwid, name, data } = body;

        if (!username || !hwid || !name || !data) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: corsHeaders });
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
            return NextResponse.json({ error: "Authentication failed" }, { status: 401, headers: corsHeaders });
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

        const metadata = getSubscriptionMetadata(user);

        const responseData = {
            success: true,
            message: "Config saved",
            ...metadata
        };

        console.log('API SENDING SAVE STATUS TO LOADER:', responseData);
        return NextResponse.json(responseData, { headers: corsHeaders });
    } catch (error) {
        console.error("Save config error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}

// DELETE: Remove a configuration by name
export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");
    const hwid = searchParams.get("hwid");
    const name = searchParams.get("name");

    if (!username || !hwid || !name) {
        return NextResponse.json({ error: "Missing required query params" }, { status: 400, headers: corsHeaders });
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
            return NextResponse.json({ error: "Authentication failed" }, { status: 401, headers: corsHeaders });
        }

        const configToDelete = await prisma.cloudConfig.findFirst({
            where: {
                userId: user.id,
                name: name
            }
        });

        if (!configToDelete) {
            return NextResponse.json({ error: "Config not found" }, { status: 404, headers: corsHeaders });
        }

        await prisma.cloudConfig.delete({
            where: { id: configToDelete.id }
        });

        const metadata = getSubscriptionMetadata(user);

        const responseData = {
            success: true,
            message: "Config deleted",
            ...metadata
        };

        console.log('API SENDING DELETE STATUS TO LOADER:', responseData);
        return NextResponse.json(responseData, { headers: corsHeaders });
    } catch (error) {
        console.error("Delete config error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}
