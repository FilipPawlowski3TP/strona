import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession();

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { cloudConfig } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { username: (session.user as any).username },
            data: {
                cloud_config: cloudConfig,
            },
        });

        return NextResponse.json({
            message: "Config updated successfully",
            cloud_config: updatedUser.cloud_config,
        });
    } catch (error) {
        console.error("Update cloud config error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
