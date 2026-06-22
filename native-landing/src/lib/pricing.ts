export const plans = {
  pro: { monthly: 79, yearlyPerMonth: 63 },
  max: { monthly: 249, yearlyPerMonth: 199 },
} as const;

export const comparisonProPriceLabel = `From $${plans.pro.yearlyPerMonth}/mo`;
