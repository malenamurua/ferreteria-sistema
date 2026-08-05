package com.ferreteria.service;

import com.ferreteria.dto.AjusteStockRequest;
import com.ferreteria.dto.ProductoRequest;
import com.ferreteria.dto.ProductoResponse;
import com.ferreteria.exception.CodigoDuplicadoException;
import com.ferreteria.exception.RecursoNoEncontradoException;
import com.ferreteria.exception.StockInsuficienteException;
import com.ferreteria.model.*;
import com.ferreteria.repository.CategoriaRepository;
import com.ferreteria.repository.MovimientoStockRepository;
import com.ferreteria.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    public List<ProductoResponse> listarActivos() {
        return productoRepository.findByActivoTrue().stream()
                .map(ProductoResponse::desde)
                .toList();
    }

    public List<ProductoResponse> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCaseAndActivoTrue(nombre).stream()
                .map(ProductoResponse::desde)
                .toList();
    }

    // Busqueda unificada para la pantalla de venta: nombre o codigo de barras, en el mismo campo
    public List<ProductoResponse> buscar(String texto) {
        return productoRepository.buscarPorNombreOCodigoBarras(texto).stream()
                .map(ProductoResponse::desde)
                .toList();
    }

    public ProductoResponse obtenerPorId(Long id) {
        return ProductoResponse.desde(buscarEntidadPorId(id));
    }

    // Usado por el lector de codigo de barras: escanea y busca de una
    public ProductoResponse buscarPorCodigoBarras(String codigo) {
        Producto producto = productoRepository.findByCodigoBarras(codigo)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe un producto con ese código de barras"));
        return ProductoResponse.desde(producto);
    }

    // Alerta: productos con stock igual o por debajo del minimo
    public List<ProductoResponse> listarConStockBajo() {
        return productoRepository.findConStockBajo().stream()
                .map(ProductoResponse::desde)
                .toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        validarCodigoBarrasDisponible(request.getCodigoBarras(), null);

        Categoria categoria = obtenerCategoriaSiCorresponde(request.getCategoriaId());

        Producto producto = Producto.builder()
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .codigoBarras(normalizarCodigo(request.getCodigoBarras()))
                .categoria(categoria)
                .precioCosto(request.getPrecioCosto())
                .precioVenta(request.getPrecioVenta())
                .stockActual(request.getStockActual())
                .stockMinimo(request.getStockMinimo())
                .unidadMedida(request.getUnidadMedida())
                .activo(true)
                .build();

        producto = productoRepository.save(producto);

        // Si arranca con stock > 0, dejamos registrado el ingreso inicial
        if (request.getStockActual() != null && request.getStockActual() > 0) {
            registrarMovimiento(producto, TipoMovimiento.INGRESO, request.getStockActual(), "Carga inicial de stock");
        }

        return ProductoResponse.desde(producto);
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarEntidadPorId(id);

        validarCodigoBarrasDisponible(request.getCodigoBarras(), id);

        Categoria categoria = obtenerCategoriaSiCorresponde(request.getCategoriaId());

        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setCodigoBarras(normalizarCodigo(request.getCodigoBarras()));
        producto.setCategoria(categoria);
        producto.setPrecioCosto(request.getPrecioCosto());
        producto.setPrecioVenta(request.getPrecioVenta());
        producto.setStockMinimo(request.getStockMinimo());
        producto.setUnidadMedida(request.getUnidadMedida());
        // OJO: el stockActual NO se edita libremente aca a proposito.
        // Los cambios de stock pasan siempre por ajustarStock() para dejar trazabilidad.

        return ProductoResponse.desde(productoRepository.save(producto));
    }

    // Baja logica: no se borra de la base, se marca como inactivo
    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarEntidadPorId(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    // Ingreso o descuento manual de stock (rotura, ajuste de inventario, compra a proveedor, etc.)
    @Transactional
    public ProductoResponse ajustarStock(Long id, AjusteStockRequest request) {
        Producto producto = buscarEntidadPorId(id);

        if (request.getCantidad() == null || request.getCantidad() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a cero");
        }

        int nuevoStock;
        if (request.getTipo() == TipoMovimiento.INGRESO) {
            nuevoStock = producto.getStockActual() + request.getCantidad();
        } else if (request.getTipo() == TipoMovimiento.EGRESO_MANUAL) {
            nuevoStock = producto.getStockActual() - request.getCantidad();
            if (nuevoStock < 0) {
                throw new StockInsuficienteException(
                        "No hay stock suficiente. Stock actual: " + producto.getStockActual());
            }
        } else {
            throw new IllegalArgumentException("Tipo de movimiento inválido para ajuste manual");
        }

        producto.setStockActual(nuevoStock);
        productoRepository.save(producto);

        int cantidadConSigno = request.getTipo() == TipoMovimiento.INGRESO
                ? request.getCantidad()
                : -request.getCantidad();

        registrarMovimiento(producto, request.getTipo(), cantidadConSigno, request.getMotivo());

        return ProductoResponse.desde(producto);
    }

    // ---- Helpers internos ----

    private Producto buscarEntidadPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado: " + id));
    }

    private Categoria obtenerCategoriaSiCorresponde(Long categoriaId) {
        if (categoriaId == null) return null;
        return categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada: " + categoriaId));
    }

    private void validarCodigoBarrasDisponible(String codigoBarras, Long idProductoActual) {
        String normalizado = normalizarCodigo(codigoBarras);
        if (normalizado == null) return;

        productoRepository.findByCodigoBarras(normalizado).ifPresent(existente -> {
            if (idProductoActual == null || !existente.getId().equals(idProductoActual)) {
                throw new CodigoDuplicadoException("Ya existe un producto con ese código de barras");
            }
        });
    }

    private String normalizarCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) return null;
        return codigo.trim();
    }

    private void registrarMovimiento(Producto producto, TipoMovimiento tipo, int cantidadConSigno, String motivo) {
        MovimientoStock movimiento = MovimientoStock.builder()
                .producto(producto)
                .tipo(tipo)
                .cantidad(cantidadConSigno)
                .motivo(motivo)
                .usuario(obtenerUsuarioActual())
                .build();
        movimientoStockRepository.save(movimiento);
    }

    private Usuario obtenerUsuarioActual() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return principal instanceof Usuario usuario ? usuario : null;
    }
}
