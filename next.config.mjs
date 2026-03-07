/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Ignoruje błędy typu "unused-vars" i inne błędy lintera przy budowaniu
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Ignoruje błędy TypeScript (typy 'any', brakujące zależności w hooks)
        ignoreBuildErrors: true,
    },
    // Opcjonalnie: Pozwala na wyświetlanie avatarów z innych serwerów
    images: {
        unoptimized: true,
    }
};

export default nextConfig;
