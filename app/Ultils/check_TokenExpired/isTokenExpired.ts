import { jwtDecode } from 'jwt-decode';

// Định nghĩa giao diện cho đối tượng decoded từ jwtDecode
interface JwtPayload {
    exp: number; // Thời gian hết hạn (epoch time)
    [key: string]: unknown; // Thay any bằng unknown
}

export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded: JwtPayload = jwtDecode(token);
        const expirationTime = decoded.exp * 1000; // Chuyển từ giây sang mili giây
        return expirationTime < Date.now();
    } catch (error) {
        console.error('Lỗi khi giải mã token:', error);
        return true; // Xem token là hết hạn nếu có lỗi
    }
};
