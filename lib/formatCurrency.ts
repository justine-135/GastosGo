export function formatCurrency(amount: number, currency = "PHP"): string {
  if (currency === "PHP") {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? "−" : "";
    return `${sign}₱${abs.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(amount);
}

export function formatCurrencySigned(amount: number, currency = "PHP"): string {
  const sign = amount >= 0 ? "+" : "−";
  const abs = Math.abs(amount);
  if (currency === "PHP") {
    return `${sign}₱${abs.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  }
  return `${sign}${new Intl.NumberFormat("en-PH", { style: "currency", currency }).format(abs)}`;
}
