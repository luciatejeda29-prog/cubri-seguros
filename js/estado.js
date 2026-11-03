export const solicitud = {
  paso: 0,
  equipo: { marca: '', modelo: '', valor: 0, antiguedad: '' },
  plan: 'plus',
  titular: { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false },
  pago: { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' },
  poliza: null
};

export function actualizar(ruta, valor) {
  const partes = ruta.split('.');
  let destino = solicitud;
  for (let i = 0; i < partes.length - 1; i++) destino = destino[partes[i]];
  destino[partes[partes.length - 1]] = valor;
}

export function reiniciarSolicitud() {
  solicitud.paso = 0;
  Object.assign(solicitud.equipo, { marca: '', modelo: '', valor: 0, antiguedad: '' });
  solicitud.plan = 'plus';
  Object.assign(solicitud.titular, { nombre: '', apellido: '', dni: '', nacimiento: '', email: '', celular: '', terminos: false });
  Object.assign(solicitud.pago, { metodo: 'credito', tarjeta: '', vencimiento: '', cvv: '', titular: '' });
  solicitud.poliza = null;
}
