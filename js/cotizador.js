export function calcularCuota(valor, tasaAnual, antiguedad) {
  const factores = { menos1: 1, '1a2': 1.10, mas2: 1.25 };
  const factor = factores[antiguedad];
  if (!Number.isFinite(valor) || !factor || !Number.isFinite(tasaAnual)) return 0;
  return Math.round(valor * tasaAnual / 12 * factor);
}

export function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(valor || 0);
}
