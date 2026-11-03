import { solicitud, actualizar, reiniciarSolicitud } from './estado.js';
import { calcularCuota } from './cotizador.js';
import { validarEquipo, validarTitular, validarPago } from './validaciones.js';
import { simularPago, generarPoliza } from './pago.js';
import { render, renderResumen, mostrarErrores, limpiarError, limpiarErrores } from './render.js';

let planes = [];
const $ = (selector) => document.querySelector(selector);
const camposEquipo = ['marca', 'modelo', 'valor', 'antiguedad'];
const camposTitular = ['nombre', 'apellido', 'dni', 'nacimiento', 'email', 'celular', 'terminos'];
const camposPago = ['tarjeta', 'vencimiento', 'cvv', 'titular-pago'];
const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function irAPaso(paso) {
  solicitud.paso = paso;
  render(solicitud, planes);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function numeroLimpio(valor) { return Number(String(valor).replace(/\D/g, '')); }
function valorLegible(valor) { return valor ? new Intl.NumberFormat('es-AR').format(valor) : ''; }

function actualizarBotones() {
  $('#btn-equipo').disabled = Object.keys(validarEquipo(solicitud.equipo)).length > 0;
  $('#btn-datos').disabled = Object.keys(validarTitular(solicitud.titular)).length > 0;
  $('#btn-pagar').disabled = Object.keys(validarPago(solicitud.pago)).length > 0;
  renderResumen(solicitud, planes);
}

function cargarCamposDesdeEstado() {
  $('#marca').value = solicitud.equipo.marca;
  $('#modelo').value = solicitud.equipo.modelo;
  $('#valor').value = solicitud.equipo.valor ? valorLegible(solicitud.equipo.valor) : '';
  document.querySelectorAll('input[name="antiguedad"]').forEach((input) => input.checked = input.value === solicitud.equipo.antiguedad);
  camposTitular.filter((c) => c !== 'terminos').forEach((campo) => { if ($(`#${campo}`)) $(`#${campo}`).value = solicitud.titular[campo]; });
  $('#terminos').checked = solicitud.titular.terminos;
}

function registrarCamposEquipo() {
  $('#marca').addEventListener('change', (e) => { actualizar('equipo.marca', e.target.value); limpiarError('marca'); actualizarBotones(); });
  $('#modelo').addEventListener('input', (e) => { actualizar('equipo.modelo', e.target.value); if (e.target.value.trim().length >= 2) limpiarError('modelo'); actualizarBotones(); });
  $('#modelo').addEventListener('blur', () => validarCampoEquipo('modelo'));
  $('#valor').addEventListener('input', (e) => {
    const limpio = numeroLimpio(e.target.value);
    actualizar('equipo.valor', limpio);
    const posicion = e.target.selectionStart;
    e.target.value = limpio ? valorLegible(limpio) : '';
    try { e.target.setSelectionRange(e.target.value.length, e.target.value.length); } catch {}
    if (limpio >= 100000 && limpio <= 2500000) limpiarError('valor');
    actualizarBotones();
  });
  $('#valor').addEventListener('blur', () => validarCampoEquipo('valor'));
  document.querySelectorAll('input[name="antiguedad"]').forEach((input) => input.addEventListener('change', () => { actualizar('equipo.antiguedad', input.value); limpiarError('antiguedad'); actualizarBotones(); }));
  $('#marca').addEventListener('blur', () => validarCampoEquipo('marca'));
}

function validarCampoEquipo(campo) {
  const errores = validarEquipo(solicitud.equipo);
  if (errores[campo]) mostrarErrores({ [campo]: errores[campo] });
  else limpiarError(campo);
}

function registrarCamposTitular() {
  ['nombre', 'apellido', 'dni', 'nacimiento', 'email', 'celular'].forEach((campo) => {
    const input = $(`#${campo}`);
    input.addEventListener('input', () => {
      const valor = input.value;
      actualizar(`titular.${campo}`, campo === 'dni' ? valor.replace(/\D/g, '').slice(0, 8) : valor);
      if (campo === 'dni') input.value = solicitud.titular.dni;
      const errores = validarTitular(solicitud.titular);
      if (!errores[campo]) limpiarError(campo);
      actualizarBotones();
    });
    input.addEventListener('blur', () => validarCampoTitular(campo));
  });
  $('#terminos').addEventListener('change', (e) => { actualizar('titular.terminos', e.target.checked); if (e.target.checked) limpiarError('terminos'); actualizarBotones(); });
}

function validarCampoTitular(campo) {
  const errores = validarTitular(solicitud.titular);
  if (errores[campo]) mostrarErrores({ [campo]: errores[campo] });
  else limpiarError(campo);
}

function registrarCamposPago() {
  document.querySelectorAll('input[name="metodo"]').forEach((input) => input.addEventListener('change', () => actualizar('pago.metodo', input.value)));
  const tarjeta = $('#tarjeta');
  tarjeta.addEventListener('input', () => {
    const digitos = tarjeta.value.replace(/\D/g, '').slice(0, 16);
    actualizar('pago.tarjeta', digitos.replace(/(.{4})/g, '$1 ').trim());
    tarjeta.value = solicitud.pago.tarjeta;
    if (digitos.length === 16) limpiarError('tarjeta');
    actualizarBotones();
  });
  $('#vencimiento').addEventListener('input', (e) => {
    const digitos = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = digitos.length > 2 ? `${digitos.slice(0, 2)}/${digitos.slice(2)}` : digitos;
    actualizar('pago.vencimiento', e.target.value);
    if (digitos.length === 4) limpiarError('vencimiento');
    actualizarBotones();
  });
  $('#cvv').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3); actualizar('pago.cvv', e.target.value); if (e.target.value.length === 3) limpiarError('cvv'); actualizarBotones(); });
  $('#titular-pago').addEventListener('input', (e) => { actualizar('pago.titular', e.target.value); if (e.target.value.trim()) limpiarError('titular-pago'); actualizarBotones(); });
  camposPago.forEach((campo) => { const input = $(`#${campo}`); input.addEventListener('blur', () => { const errores = validarPago(solicitud.pago); if (errores[campo]) mostrarErrores({ [campo]: errores[campo] }); else limpiarError(campo); }); });
}

function volverAlInicio() {
  reiniciarSolicitud();
  limpiarErrores([...camposEquipo, ...camposTitular, ...camposPago]);
  $('#form-equipo').reset(); $('#form-datos').reset(); $('#form-pago').reset();
  $('#btn-pagar').disabled = true;
  actualizarBotones();
  irAPaso(0);
}

async function iniciar() {
  try {
    const respuesta = await fetch('./data/planes.json');
    if (!respuesta.ok) throw new Error('No se pudo cargar planes.json');
    planes = await respuesta.json();
  } catch (error) {
    console.error(error);
    alert('No se pudieron cargar los planes. Abrí el proyecto con Live Server.');
    return;
  }

  render(solicitud, planes);
  registrarCamposEquipo(); registrarCamposTitular(); registrarCamposPago();
  cargarCamposDesdeEstado();
  actualizarBotones();

  $('#comenzar').addEventListener('click', () => irAPaso(1));
  $('#producto-celular').addEventListener('click', () => irAPaso(1));
  document.querySelectorAll('[data-home]').forEach((boton) => boton.addEventListener('click', volverAlInicio));

  $('#form-equipo').addEventListener('submit', (e) => {
    e.preventDefault();
    const errores = validarEquipo(solicitud.equipo);
    limpiarErrores(camposEquipo);
    if (Object.keys(errores).length) { mostrarErrores(errores); document.querySelector(`#${Object.keys(errores)[0]}`)?.focus(); return; }
    irAPaso(2);
  });

  $('#planes-container').addEventListener('change', (e) => {
    if (e.target.name !== 'plan') return;
    actualizar('plan', e.target.value);
    render(solicitud, planes);
  });
  $('#btn-plan').addEventListener('click', () => irAPaso(3));

  $('#form-datos').addEventListener('submit', (e) => {
    e.preventDefault();
    const errores = validarTitular(solicitud.titular);
    limpiarErrores(camposTitular);
    if (Object.keys(errores).length) { mostrarErrores(errores); document.querySelector(`#${Object.keys(errores)[0]}`)?.focus(); return; }
    irAPaso(4);
  });

  $('#form-pago').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errores = validarPago(solicitud.pago);
    limpiarErrores(camposPago);
    if (Object.keys(errores).length) { mostrarErrores(errores); document.querySelector(`#${Object.keys(errores)[0]}`)?.focus(); return; }
    const boton = $('#btn-pagar');
    boton.disabled = true; boton.innerHTML = 'Procesando…';
    const resultado = await simularPago(solicitud.pago.tarjeta);
    if (resultado.ok) {
      solicitud.poliza = generarPoliza();
      irAPaso(5);
    } else {
      irAPaso(6);
    }
    boton.innerHTML = 'Pagar y contratar <span>→</span>';
    actualizarBotones();
  });

  document.querySelectorAll('[data-back]').forEach((boton) => boton.addEventListener('click', () => irAPaso(Number(boton.dataset.back))));
  $('#reintentar').addEventListener('click', () => irAPaso(4));
  $('#cambiar-medio').addEventListener('click', () => { actualizar('pago.metodo', solicitud.pago.metodo === 'credito' ? 'debito' : 'credito'); document.querySelector(`input[name="metodo"][value="${solicitud.pago.metodo}"]`).checked = true; irAPaso(4); });
  $('#volver-inicio').addEventListener('click', volverAlInicio);
  $('#ver-terminos').addEventListener('click', (e) => { e.preventDefault(); alert('Términos de ejemplo: esta es una simulación académica de contratación. No se contrata una cobertura real ni se realiza ningún cobro.'); });
}

iniciar();
