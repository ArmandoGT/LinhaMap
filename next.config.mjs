/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permite exibir fotos de denúncias hospedadas externamente (Supabase Storage, etc.).
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
