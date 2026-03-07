import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing username or password");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        username: credentials.username
                    }
                });

                if (!user || !user.password) {
                    throw new Error("No user found");
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error("Invalid password");
                }

                return {
                    id: user.id,
                    name: user.username,
                    username: user.username,
                    email: user.email,
                    // @ts-ignore: Prisma schema is updated but types might be cached
                    avatar_url: user.avatar_url,
                    // @ts-ignore: Prisma schema is updated but types might be cached
                    subscription_expires_at: user.subscription_expires_at,
                };
            }
        })
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.sub;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).username = token.username;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).email = token.email;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).avatar_url = token.avatar_url;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (session.user as any).subscription_expires_at = token.subscription_expires_at;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.username = (user as any).username;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.email = (user as any).email;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.avatar_url = (user as any).avatar_url;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                token.subscription_expires_at = (user as any).subscription_expires_at;
            }
            return token;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
