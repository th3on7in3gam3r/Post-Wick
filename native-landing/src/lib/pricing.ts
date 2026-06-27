export const plans = {
  pro: { monthly: 79, yearlyPerMonth: 63 },
  max: { monthly: 249, yearlyPerMonth: 199 },
} as const;

export type PaidPlanKey = keyof typeof plans;

export const YEARLY_SAVE_LABEL = "Save 20%";

export function annualCharge(plan: PaidPlanKey) {
  return plans[plan].yearlyPerMonth * 12;
}

export function formatAnnualCharge(plan: PaidPlanKey) {
  return `$${annualCharge(plan).toLocaleString("en-US")} billed annually · excl. tax`;
}

export const comparisonProPriceLabel = `From $${plans.pro.yearlyPerMonth}/mo`;
