export function formatEGP(amount) {
  const value = Number(amount || 0);
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value) + " EGP"
  );
}

export function discountPercent(price, compareAt) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function classNames(...args) {
  return args.filter(Boolean).join(" ");
}
