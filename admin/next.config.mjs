/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    "better-auth",
    "@better-auth/kysely-adapter",
    "kysely",
    "drizzle-orm",
    "pg",
  ],
};

export default nextConfig;
