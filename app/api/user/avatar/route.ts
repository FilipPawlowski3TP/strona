import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

interface SessionUser {
    id: string;
    username: string;
    email: string;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session.user as SessionUser)?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        // Validate format (.jpg, .png)
        const validTypes = ["image/jpeg", "image/png"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid file type. Only JPG and PNG are allowed." }, { status: 400 });
        }

        // Validate size (max 2MB)
        const MAX_SIZE = 2 * 1024 * 1024; // 2MB
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "File too large. Maximum size is 2MB." }, { status: 400 });
        }

        // Read file content
        const buffer = Buffer.from(await file.arrayBuffer());

        // Generate a valid filename using original extension
        const originalExt = path.extname(file.name);
        const fileName = `${crypto.randomUUID()}${originalExt}`;

        // Setup upload directory
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            console.error("Failed to create upload directory:", e);
        }

        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        // Update database
        const userId = (session.user as SessionUser).id;
        const avatarUrl = `/uploads/avatars/${fileName}`;

        await prisma.user.update({
            where: { id: userId },
            data: { avatar_url: avatarUrl },
        });

        return NextResponse.json({
            success: true,
            message: "Avatar uploaded successfully",
            avatar_url: avatarUrl
        });

    } catch (error) {
        console.error("Avatar upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
