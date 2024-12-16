import { INSURANCE_RATES } from './constants';

export const calculateInsurance = (grossIncome: number) => {
    const socialInsurance = grossIncome * INSURANCE_RATES.socialInsurance;
    const healthInsurance = grossIncome * INSURANCE_RATES.healthInsurance;
    const unemploymentInsurance = grossIncome * INSURANCE_RATES.unemploymentInsurance;

    return {
        socialInsurance,
        healthInsurance,
        unemploymentInsurance,
    };
};
