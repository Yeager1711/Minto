import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
    // output: 'export', // Comment hoặc xóa dòng này
    images: {
        unoptimized: true,
    },
    /* config options here */
    webpack: (config) => {
        config.resolve.alias['~'] = path.resolve(__dirname, 'src');
        return config;
    },
};

export default nextConfig;