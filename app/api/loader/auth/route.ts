import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// CORS headers configuration
const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-admin-key",
};

// Common logic for auth processing
async function processAuth(data: { username?: string; password?: string; hwid?: string }) {
    const { username, password, hwid } = data;

    if (!username || !password || !hwid) {
        return { error: "Username, password and HWID are required", status: 400 };
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
        return { error: "Invalid credentials", status: 401 };
    }

    if (user.is_banned) {
        return { error: "User is banned", status: 403 };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { error: "Invalid credentials", status: 401 };
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
        return { error: "Invalid Hardware Identifier", status: 403 };
    }

    const fullAvatarUrl = user.avatar_url
        ? (user.avatar_url.startsWith('http') ? user.avatar_url : `http://141.227.151.21:3000${user.avatar_url.replace('/cdn/avatars/', '/avatars/')}`)
        : "http://141.227.151.21:3000/default-avatar.png";

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
        hwid: hwid
    };

    return { data: responseData, status: 200 };
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username") || undefined;
    const password = searchParams.get("password") || undefined;
    const hwid = searchParams.get("hwid") || undefined;

    const result = await processAuth({ username, password, hwid });

    if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status, headers: corsHeaders });
    }

    console.log('API SENDING TO LOADER (GET):', result.data);
    return NextResponse.json(result.data, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const textData = await req.text();
        let body = {};

        if (textData) {
            try {
                body = JSON.parse(textData);
            } catch (e) {
                return NextResponse.json({ error: "Invalid JSON input" }, { status: 400, headers: corsHeaders });
            }
        }

        const result = await processAuth(body);

        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: result.status, headers: corsHeaders });
        }

        console.log('API SENDING TO LOADER (POST):', result.data);
        return NextResponse.json(result.data, { headers: corsHeaders });
    } catch (error) {
        console.error("Loader auth POST error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500, headers: corsHeaders });
    }
}

export async function OPTIONS() {
    return new Response(null, { status: 204, headers: corsHeaders });
}
