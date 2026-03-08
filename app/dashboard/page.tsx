import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import DashboardContent from "./DashboardContent";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    // Force bypass all caching layers for Next.js 14
    noStore();

    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect("/login");
    }

    try {
        // Direct database fetch to avoid stale JWT session data
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                username: true,
                email: true,
                avatar_url: true,
                subscription_expires_at: true,
                is_banned: true,
            }
        });

        if (!user) {
            redirect("/login");
        }

        const expiresAt = new Date(user.subscription_expires_at);
        const now = new Date();
        const diffTime = Math.max(0, expiresAt.getTime() - now.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // SERVER LOG: Crucial debug for checking cache status in production
        console.log(`DEBUG DAYS: ${days} (User: ${user.username}, Expires: ${expiresAt.toISOString()})`);

        return (
            <DashboardContent
                user={{
                    ...user,
                    subscription_expires_at: user.subscription_expires_at.toISOString()
                }}
                daysLeft={days}
            />
        );

    } catch (error) {
        console.error("Dashboard server-side error:", error);
        redirect("/login");
    }
}
