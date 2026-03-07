import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { username, email, password } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json(
                { error: "Username, email and password are required" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email }
                ]
            },
        });

        if (existingUser) {
            const field = existingUser.username === username ? "Username" : "Email";
            return NextResponse.json(
                { error: `${field} already exists` },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Default: 30 days subscription for new users
        const subscriptionExpiresAt = new Date();
        subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + 30);
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days trial/initial
            },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json(
            { message: "User registered successfully", user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
