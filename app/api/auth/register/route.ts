import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return new NextResponse("Missing email or password", { status: 400 });
        }

        const exist = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (exist) {
            return new NextResponse("User already exists", { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("REGISTER_ERROR", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
