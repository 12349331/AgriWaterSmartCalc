// Number and date formatters for Traditional Chinese (Taiwan) locale

export function formatNumber(value, decimals = 2) {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return value.toFixed(decimals);
}

export function formatCurrency(value) {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `NT$ ${value.toLocaleString("zh-TW", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(timestamp) {
  if (!timestamp) return "-";
  const date = new Date(timestamp);
  return date.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatVolume(value) {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `${formatNumber(value, 2)} m³`;
}

export function formatFlowRate(value) {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `${formatNumber(value, 2)} L/s`;
}

export function formatKwh(value) {
  if (typeof value !== "number" || isNaN(value)) return "-";
  return `${formatNumber(value, 1)} kWh`;
}
