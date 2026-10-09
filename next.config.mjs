/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the Arena/E2B live-preview host to talk to the dev server.
  allowedDevOrigins: ['*.e2b.app', '*.arena.ai', 'localhost', '*.localhost'],
  images: {
    // Remote photography is loaded directly by the browser (no paid image CDN or
    // API key required). Local SVG artwork in /public is used as a fallback.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
  eslint: {
    dirs: ['app', 'components', 'lib', 'data', 'types', 'tests'],
  },
};

export default nextConfig;
