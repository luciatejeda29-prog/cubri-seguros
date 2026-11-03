export function simularPago(numero) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const limpio = numero.replace(/\s/g, '');
      resolve(limpio === '4000000000000002'
        ? { ok: false, motivo: 'Tarjeta rechazada' }
        : { ok: true });
    }, 1500);
  });
}

export function generarPoliza() {
  const clave = 'cubri-contador-polizas';
  const contador = Number(localStorage.getItem(clave) || 0) + 1;
  localStorage.setItem(clave, String(contador));
  return `POL-${new Date().getFullYear()}-${String(contador).padStart(6, '0')}`;
}
