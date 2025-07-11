import type { NextConfig } from 'next';
import path from 'path';
const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
    reactStrictMode: !isDev,
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

// import type { NextConfig } from 'next';
// import path from 'path';

// const nextConfig: NextConfig = {
//     // output: 'export', // Comment hoặc xóa dòng này
//     images: {
//         unoptimized: true,
//     },
//     /* config options here */
//     webpack: (config) => {
//         config.resolve.alias['~'] = path.resolve(__dirname, 'src');
//         return config;
//     },
// };

// export default nextConfig;
