// lib/imagekit.ts
import ImageKit from 'imagekit-javascript';

// Hàm kiểm tra biến môi trường
// const getEnvVar = (name: string): string => {
//     const value = process.env[name];
//     if (value === undefined || value === '') {
//         throw new Error(`Environment variable ${name} is not defined or empty`);
//     }
//     return value;
// };

const imagekit = new ImageKit({
    publicKey: 'public_MWz6Jz8dBiCgIo0k5lWmcvBZjqk=',
    urlEndpoint: 'https://ik.imagekit.io/zawkrzrax',
});

export default imagekit;
