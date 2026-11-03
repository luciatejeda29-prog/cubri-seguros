import { calcularCuota, formatearMoneda } from './cotizador.js';

const nombresPasos = {
  1: ['Cotizá tu equipo', 'Contanos un poco sobre tu celular.'],
  2: ['Elegí tu plan', 'Encontrá la protección que mejor se adapta a vos.'],
  3: ['Tus datos personales', 'Necesitamos estos datos para emitir tu póliza.'],
  4: ['Completá tu pago', 'Revisá el resumen y elegí tu medio de pago.']
};
const antiguedades = { menos1: 'Menos de 1 año', '1a2': 'Entre 1 y 2 años', mas2: 'Más de 2 años' };

export function render(solicitud, planes) {
  document.querySelectorAll('[data-paso]').forEach((seccion) => {
    seccion.hidden = Number(seccion.dataset.paso) !== solicitud.paso;
  });
  const enCheckout = solicitud.paso >= 1 && solicitud.paso <= 4;
  document.querySelector('#checkout-heading').hidden = !enCheckout;
  document.querySelector('#checkout-layout').hidden = !enCheckout && solicitud.paso !== 5 && solicitud.paso !== 6;
  document.querySelector('#summary-column').hidden = solicitud.paso === 5 || solicitud.paso === 6;
  if (enCheckout) {
    document.querySelector('#step-title').textContent = nombresPasos[solicitud.paso][0];
    document.querySelector('#step-subtitle').textContent = nombresPasos[solicitud.paso][1];
  }
  renderStepper(solicitud.paso);
  renderPlanes(solicitud, planes);
  renderResumen(solicitud, planes);
  if (solicitud.paso === 5) renderExito(solicitud);
}

function renderStepper(pasoActual) {
  document.querySelectorAll('[data-step-indicator]').forEach((item) => {
    const numero = Number(item.dataset.stepIndicator);
    item.classList.toggle('active', numero === pasoActual);
    item.classList.toggle('complete', numero < pasoActual);
    const circulo = item.querySelector('.step-number');
    circulo.textContent = numero < pasoActual ? '✓' : String(numero);
  });
}

export function renderResumen(solicitud, planes) {
  const plan = planes.find((p) => p.id === solicitud.plan);
  const precio = plan ? calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad) : 0;
  const equipo = [solicitud.equipo.marca, solicitud.equipo.modelo].filter(Boolean).join(' ');
  document.querySelector('#summary-device').textContent = equipo || 'Completá los datos de tu equipo';
  document.querySelector('#summary-plan').textContent = plan?.nombre || 'Plus';
  document.querySelector('#summary-age').textContent = antiguedades[solicitud.equipo.antiguedad] || 'A confirmar';
  document.querySelector('#summary-price').textContent = formatearMoneda(precio);
}

function renderPlanes(solicitud, planes) {
  const contenedor = document.querySelector('#planes-container');
  contenedor.innerHTML = planes.map((plan) => {
    const precio = calcularCuota(solicitud.equipo.valor, plan.tasaAnual, solicitud.equipo.antiguedad);
    const elegido = solicitud.plan === plan.id;
    return `<label class="plan-card ${elegido ? 'selected' : ''}">
      ${plan.recomendado ? '<span class="plan-badge">RECOMENDADO</span>' : ''}
      <input type="radio" name="plan" value="${plan.id}" ${elegido ? 'checked' : ''}>
      <div class="plan-name">${plan.nombre}</div>
      <div class="plan-price">${formatearMoneda(precio)}</div><div class="plan-period">por mes</div>
      <ul class="plan-features">${plan.coberturas.map((c) => `<li>${c}</li>`).join('')}</ul>
      <span class="plan-select">${elegido ? '✓ Plan seleccionado' : 'Elegir este plan'}</span>
    </label>`;
  }).join('');
}

function renderExito(solicitud) {
  document.querySelector('#numero-poliza').textContent = solicitud.poliza;
  document.querySelector('#email-confirmacion').textContent = solicitud.titular.email;
  const plan = solicitud.plan.charAt(0).toUpperCase() + solicitud.plan.slice(1);
  const datos = [
    ['Titular', `${solicitud.titular.nombre} ${solicitud.titular.apellido}`],
    ['Equipo', `${solicitud.equipo.marca} ${solicitud.equipo.modelo}`],
    ['Plan', plan],
    ['Cuota mensual', document.querySelector('#summary-price').textContent]
  ];
  document.querySelector('#detalle-exito').innerHTML = datos.map(([label, value]) => `<div class="detail-cell"><small>${label}</small><strong>${value}</strong></div>`).join('');
}

export function mostrarErrores(errores, prefijo = '') {
  Object.entries(errores).forEach(([campo, mensaje]) => {
    const grupo = document.querySelector(`#group-${campo}`);
    const error = document.querySelector(`#error-${campo}`);
    if (grupo) grupo.classList.add('invalid');
    if (error) error.textContent = mensaje;
    const input = document.querySelector(`#${campo}`);
    if (input) input.setAttribute('aria-invalid', 'true');
  });
}

export function limpiarError(campo) {
  document.querySelector(`#group-${campo}`)?.classList.remove('invalid');
  const error = document.querySelector(`#error-${campo}`);
  if (error) error.textContent = '';
  document.querySelector(`#${campo}`)?.removeAttribute('aria-invalid');
}

export function limpiarErrores(campos) { campos.forEach(limpiarError); }
