/** @type {import('next').NextConfig} */
const WebpackObfuscator = require('webpack-obfuscator');

const obfuscatorEnabled = process.env.NEXT_PUBLIC_OBFUSCATE === 'true';

const nextConfig = {
  images: {
    domains: ['localhost', 'example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  
  webpack: (config, { dev, isServer }) => {
    // 生产环境且启用混淆
    if (!dev && !isServer && obfuscatorEnabled) {
      config.plugins.push(
        new WebpackObfuscator({
          rotateStringArray: true,
          stringArray: true,
          stringArrayThreshold: 0.75,
          stringArrayEncoding: ['base64'],
          splitStrings: true,
          splitStringsChunkLength: 10,
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.75,
          deadCodeInjection: true,
          deadCodeInjectionThreshold: 0.4,
          debugProtection: false,
          disableConsoleOutput: true,
          selfDefending: true,
          transformObjectKeys: true,
          unicodeEscapeSequence: false,
        }, [])
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;
