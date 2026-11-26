import { jsPDF } from 'jspdf'
import { formatMoneda, formatFechaHora } from './format'

const NOMBRE_NEGOCIO = 'FERRETERÍA'

/**
 * Genera el comprobante en PDF de una venta y lo abre en una pestaña nueva,
 * lista para imprimir. Usa hoja A4 completa, pero todo el contenido queda
 * en la mitad superior (hasta ~148mm) con una línea punteada de corte,
 * así se puede cortar la hoja A4 al medio y usar cada mitad como comprobante.
 *
 * @param {Object} venta - Objeto VentaResponse devuelto por el backend
 *   (id, fecha, vendedorUsername, metodoPago, estado, total, detalles[])
 */
export function generarComprobantePDF(venta) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' }) // 210 x 297 mm

  const margenX = 15
  const anchoHoja = 210
  const mitadHoja = 148.5 // mitad de 297mm
  let y = 18

  // --- Encabezado ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(NOMBRE_NEGOCIO, margenX, y)

  y += 8
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Comprobante de venta', margenX, y)

  y += 9
  doc.setDrawColor(200)
  doc.line(margenX, y, anchoHoja - margenX, y)
  y += 9

  // --- Datos generales ---
  doc.setFontSize(11)
  doc.text(`N° de venta: ${venta.id}`, margenX, y)
  y += 7
  doc.text(`Fecha y hora: ${formatFechaHora(venta.fecha)}`, margenX, y)
  y += 7
  doc.text(`Vendedor: ${venta.vendedorUsername}`, margenX, y)
  y += 7
  doc.text(`Método de pago: ${venta.metodoPago}`, margenX, y)
  y += 7
  doc.text(`Estado: ${venta.estado}`, margenX, y)
  y += 9

  doc.line(margenX, y, anchoHoja - margenX, y)
  y += 8

  // --- Encabezado de tabla de productos ---
  doc.setFont('helvetica', 'bold')
  doc.text('Producto', margenX, y)
  doc.text('Cant.', 115, y)
  doc.text('P. unit.', 140, y)
  doc.text('Subtotal', 172, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.line(margenX, y, anchoHoja - margenX, y)
  y += 7

  // --- Detalle de productos ---
  venta.detalles.forEach((d) => {
    const nombre = d.productoNombre.length > 45
      ? d.productoNombre.slice(0, 42) + '...'
      : d.productoNombre

    doc.text(nombre, margenX, y)
    doc.text(String(d.cantidad), 115, y)
    doc.text(formatMoneda(d.precioUnitario), 140, y)
    doc.text(formatMoneda(d.subtotal), 172, y)
    y += 7

    if (y > mitadHoja - 25) {
      doc.setFontSize(9)
      doc.setTextColor(120)
      doc.text('(...)', margenX, y)
      doc.setTextColor(0)
      doc.setFontSize(11)
    }
  })

  y += 4
  doc.line(margenX, y, anchoHoja - margenX, y)
  y += 10

  // --- Total ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text('TOTAL:', margenX, y)
  doc.text(formatMoneda(venta.total), 172, y)

  y += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(120)
  doc.text('Gracias por su compra', margenX, y)
  doc.setTextColor(0)

  // --- Línea de corte a la mitad de la hoja A4 ---
  doc.setDrawColor(150)
  doc.setLineDashPattern([2, 2], 0)
  doc.line(0, mitadHoja, anchoHoja, mitadHoja)
  doc.setLineDashPattern([], 0)

  doc.setFontSize(7)
  doc.setTextColor(150)
  doc.text('✂ Cortar aquí', anchoHoja - margenX - 20, mitadHoja - 2)
  doc.setTextColor(0)

  const blobUrl = doc.output('bloburl')
  window.open(blobUrl, '_blank')
}