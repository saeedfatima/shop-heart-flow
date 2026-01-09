// Currency formatting utilities
// Exchange rate (approximate) - 1 USD = 1500 NGN
const USD_TO_NGN_RATE = 1500;

export const formatNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatUSD = (amount: number): string => {
  return `$${amount.toFixed(2)}`;
};

export const formatDualCurrency = (amountInNaira: number): string => {
  const amountInUSD = amountInNaira / USD_TO_NGN_RATE;
  return `₦${amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (~$${amountInUSD.toFixed(2)})`;
};

// For admin dashboard - shows both currencies
export const formatAdminCurrency = (amountInNaira: number): { naira: string; usd: string } => {
  const amountInUSD = amountInNaira / USD_TO_NGN_RATE;
  return {
    naira: `₦${amountInNaira.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    usd: `$${amountInUSD.toFixed(2)}`,
  };
};
