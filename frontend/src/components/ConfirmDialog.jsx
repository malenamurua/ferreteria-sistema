import Modal from './Modal'
import Boton from './Boton'

export default function ConfirmDialog({ abierto, onCerrar, onConfirmar, titulo, mensaje, cargando }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo={titulo}>
      <p className="text-sm text-ink-muted">{mensaje}</p>
      <div className="flex justify-end gap-2 mt-6">
        <Boton variante="secundario" onClick={onCerrar} disabled={cargando}>Cancelar</Boton>
        <Boton variante="peligro" onClick={onConfirmar} disabled={cargando}>
          {cargando ? 'Procesando…' : 'Confirmar'}
        </Boton>
      </div>
    </Modal>
  )
}
