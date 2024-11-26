
export const formatSalary = (salary) => {
    // Kiểm tra nếu chuỗi chứa "VND"
    if (salary.includes('VND')) {
        const parts = salary.split('to').map((part) => part.trim().replace('VND', ''));
        const formattedParts = parts.map((part) =>
            parseInt(part, 10).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
        );
        return formattedParts.join(' - ');
    }
    // Nếu không phải VND, giữ nguyên chuỗi
    return salary;
};
