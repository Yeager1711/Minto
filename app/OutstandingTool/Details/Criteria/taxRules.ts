type TaxDetails = {
    bracket: string;
    rate: string;
    tax: string;
};

type IncomeTaxResult = {
    taxDetails: TaxDetails[];
    totalTax: number;
};

export const TAX_BRACKETS = [
    { limit: 5000000, rate: 0.05 },       // Đến 5 triệu: 5%
    { limit: 10000000, rate: 0.10 },     // Trên 5 triệu đến 10 triệu: 10%
    { limit: 18000000, rate: 0.15 },     // Trên 10 triệu đến 18 triệu: 15%
    { limit: 32000000, rate: 0.20 },     // Trên 18 triệu đến 32 triệu: 20%
    { limit: 52000000, rate: 0.25 },     // Trên 32 triệu đến 52 triệu: 25%
    { limit: 80000000, rate: 0.30 },     // Trên 52 triệu đến 80 triệu: 30%
    { limit: Infinity, rate: 0.35 },     // Trên 80 triệu: 35%
];

/**
 *  Tính thuế thu nhập cá nhân lũy tiến
 * @param taxableIncome Thu nhập chịu thuế
 * @returns Thuế thu nhập cá nhân
 */
export function calculateIncomeTax(taxableIncome: number): number {
    let remainingIncome = taxableIncome;
    const taxDetails = [];
    let totalTax = 0;

    for (const { limit, rate } of TAX_BRACKETS) {
        if (remainingIncome <= 0) break;
        const previousLimit = TAX_BRACKETS[TAX_BRACKETS.indexOf({ limit, rate }) - 1]?.limit || 0;

        const taxableAmount = Math.min(remainingIncome, limit - previousLimit);
        const taxForBracket = taxableAmount * rate;

        taxDetails.push({
            bracket: `Từ ${previousLimit.toLocaleString('vi-VN')} đến ${
                limit === Infinity ? 'trên' : limit.toLocaleString('vi-VN')
            }`,
            rate: `${(rate * 100).toFixed(0)}%`,
            tax: taxForBracket.toFixed(0),
        });

        totalTax += taxForBracket;
        remainingIncome -= taxableAmount;
    }

    return parseFloat(totalTax.toFixed(0));
}


