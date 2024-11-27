export const formatSalary = (salary) => {
    // Kiểm tra nếu chuỗi chứa "VND"
    if (salary.includes('VND')) {
        const parts = salary.split('to').map((part) => 
            part
                .trim()
                .replace('VND', '')
                .replace(/(\d{1,3})(\d{6})/, (_, millions) => `${millions}tr`)
        );
        return parts.join(' - ');
    }
    // Nếu không phải VND, giữ nguyên chuỗi
    return salary;
};
