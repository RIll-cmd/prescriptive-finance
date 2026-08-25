/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@financial-os/ui', '@financial-os/shared-types'],
};

export default nextConfig;
