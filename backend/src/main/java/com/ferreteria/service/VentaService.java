package com.ferreteria.service;

import com.ferreteria.dto.ItemVentaRequest;
import com.ferreteria.dto.VentaRequest;
import com.ferreteria.dto.VentaResponse;
import com.ferreteria.exception.RecursoNoEncontradoException;
import com.ferreteria.exception.StockInsuficienteException;
import com.ferreteria.model.*;
import com.ferreteria.repository.MovimientoStockRepository;
import com.ferreteria.repository.ProductoRepository;
import com.ferreteria.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final MovimientoStockRepository movimientoStockRepository;

    @Transactional
    public VentaResponse registrarVenta(VentaRequest request) {
        Usuario vendedor = obtenerUsuarioActual();

        Venta venta = Venta.builder()
                .vendedor(vendedor)
                .metodoPago(request.getMetodoPago())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;

        // 1) Validamos stock de TODOS los items antes de tocar nada
        //    (asi si un producto no tiene stock suficiente, no queda la venta a medio hacer)
        for (ItemVentaRequest item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Producto no encontrado: " + item.getProductoId()));

            if (!producto.isActivo()) {
                throw new RecursoNoEncontradoException("El producto '" + producto.getNombre() + "' ya no está disponible");
            }

            if (producto.getStockActual() < item.getCantidad()) {
                throw new StockInsuficienteException(
                        "Stock insuficiente para '" + producto.getNombre() + "'. Disponible: " + producto.getStockActual());
            }
        }

        // 2) Ahora si, armamos los detalles, descontamos stock y sumamos el total
        for (ItemVentaRequest item : request.getItems()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Producto no encontrado: " + item.getProductoId()));

            BigDecimal subtotal = producto.getPrecioVenta().multiply(BigDecimal.valueOf(item.getCantidad()));

            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecioVenta())
                    .subtotal(subtotal)
                    .build();

            venta.getDetalles().add(detalle);
            total = total.add(subtotal);

            // Descuento automatico de stock
            producto.setStockActual(producto.getStockActual() - item.getCantidad());
            productoRepository.save(producto);

            // Trazabilidad del movimiento
            MovimientoStock movimiento = MovimientoStock.builder()
                    .producto(producto)
                    .tipo(TipoMovimiento.VENTA)
                    .cantidad(-item.getCantidad())
                    .motivo("Venta")
                    .usuario(vendedor)
                    .build();
            movimientoStockRepository.save(movimiento);
        }

        venta.setTotal(total);
        Venta guardada = ventaRepository.save(venta);

        return VentaResponse.desde(guardada);
    }

    public VentaResponse obtenerPorId(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Venta no encontrada: " + id));
        return VentaResponse.desde(venta);
    }

    public List<VentaResponse> listarTodas() {
        return ventaRepository.findAll().stream()
                .map(VentaResponse::desde)
                .toList();
    }

    // Usado tambien por los reportes de la Fase 4
    public List<VentaResponse> listarPorRango(LocalDateTime desde, LocalDateTime hasta) {
        return ventaRepository.findByFechaBetween(desde, hasta).stream()
                .map(VentaResponse::desde)
                .toList();
    }

    private Usuario obtenerUsuarioActual() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Usuario usuario) {
            return usuario;
        }
        throw new IllegalStateException("No se pudo determinar el usuario autenticado");
    }
}
