export function validarEquipo(equipo) {
  const errores = {};
  if (!equipo.marca) errores.marca = 'Elegí una marca';
  if (equipo.modelo.trim().length < 2 || equipo.modelo.trim().length > 40) errores.modelo = 'Ingresá el modelo del equipo';
  if (!Number.isFinite(equipo.valor) || equipo.valor < 100000 || equipo.valor > 2500000) errores.valor = 'El valor debe estar entre $100.000 y $2.500.000';
  if (!equipo.antiguedad) errores.antiguedad = 'Indicá la antigüedad';
  return errores;
}

function mayorDeEdad(fecha) {
  if (!fecha) return false;
  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return false;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const aunNoCumplio = hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
  if (aunNoCumplio) edad--;
  return edad >= 18;
}

export function validarTitular(titular) {
  const errores = {};
  if (titular.nombre.trim().length < 2) errores.nombre = 'Ingresá tu nombre';
  if (titular.apellido.trim().length < 2) errores.apellido = 'Ingresá tu apellido';
  if (!/^\d{7,8}$/.test(titular.dni)) errores.dni = 'El DNI debe tener 7 u 8 números';
  if (!mayorDeEdad(titular.nacimiento)) errores.nacimiento = 'Tenés que ser mayor de edad';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(titular.email)) errores.email = 'Ingresá un email válido';
  const celular = titular.celular.replace(/[\s-]/g, '');
  if (!/^\d{10}$/.test(celular) || celular.startsWith('0') || celular.startsWith('15')) errores.celular = 'Ingresá un celular de 10 dígitos, sin 0 ni 15';
  if (!titular.terminos) errores.terminos = 'Tenés que aceptar los términos';
  return errores;
}

function vencimientoValido(valor) {
  if (!/^\d{2}\/\d{2}$/.test(valor)) return false;
  const [mes, anio] = valor.split('/').map(Number);
  if (mes < 1 || mes > 12) return false;
  const fecha = new Date(2000 + anio, mes, 0, 23, 59, 59);
  const ahora = new Date();
  return fecha >= new Date(ahora.getFullYear(), ahora.getMonth(), 1);
}

export function validarPago(pago) {
  const errores = {};
  const numero = pago.tarjeta.replace(/\s/g, '');
  if (!/^\d{16}$/.test(numero)) errores.tarjeta = 'Número de tarjeta inválido';
  if (!vencimientoValido(pago.vencimiento)) errores.vencimiento = 'Vencimiento inválido';
  if (!/^\d{3}$/.test(pago.cvv)) errores.cvv = 'CVV inválido';
  if (!pago.titular.trim()) errores['titular-pago'] = 'Ingresá el nombre del titular';
  return errores;
}
