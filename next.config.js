/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable static exports as they don't work well with Firebase
  // output: 'export',
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  webpack: (config, { isServer }) => {
    // Skip certain modules on the server
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        perf_hooks: false,
      };
    }

    // Add a rule to handle private class fields in undici
    config.module.rules.push({
      test: /node_modules\/undici\/.*\.js$/,
      loader: require.resolve('babel-loader'),
      options: {
        presets: ['@babel/preset-env'],
        plugins: [
          '@babel/plugin-transform-private-methods',
          '@babel/plugin-transform-class-properties',
          '@babel/plugin-transform-private-property-in-object'
        ],
      },
    });

    return config;
  },
  // Enable experimental features needed for Firebase
  experimental: {
    esmExternals: true,
    serverComponentsExternalPackages: ['firebase', 'firebase-admin'],
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
