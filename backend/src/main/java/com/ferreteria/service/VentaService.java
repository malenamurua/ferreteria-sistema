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
                .estado(EstadoVenta.ACTIVA)
                .build();


        BigDecimal total = BigDecimal.ZERO;


        for (ItemVentaRequest item : request.getItems()) {

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Producto no encontrado: " + item.getProductoId()));


            if (!producto.isActivo()) {
                throw new RecursoNoEncontradoException(
                        "El producto '" + producto.getNombre() + "' ya no está disponible");
            }


            if (producto.getStockActual() < item.getCantidad()) {
                throw new StockInsuficienteException(
                        "Stock insuficiente para '" + producto.getNombre()
                                + "'. Disponible: " + producto.getStockActual());
            }
        }



        for (ItemVentaRequest item : request.getItems()) {


            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Producto no encontrado: " + item.getProductoId()));


            BigDecimal subtotal =
                    producto.getPrecioVenta()
                            .multiply(BigDecimal.valueOf(item.getCantidad()));



            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(producto.getPrecioVenta())
                    .subtotal(subtotal)
                    .build();


            venta.getDetalles().add(detalle);

            total = total.add(subtotal);



            producto.setStockActual(
                    producto.getStockActual() - item.getCantidad()
            );

            productoRepository.save(producto);



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
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Venta no encontrada: " + id));


        return VentaResponse.desde(venta);
    }




    public List<VentaResponse> listarTodas() {

        return ventaRepository.findAll()
                .stream()
                .map(VentaResponse::desde)
                .toList();
    }





    public List<VentaResponse> buscarConFiltros(
            LocalDateTime desde,
            LocalDateTime hasta,
            MetodoPago metodoPago,
            EstadoVenta estado
    ) {

        return ventaRepository.findAll()
                .stream()
                .filter(v -> desde == null || !v.getFecha().isBefore(desde))
                .filter(v -> hasta == null || !v.getFecha().isAfter(hasta))
                .filter(v -> metodoPago == null || v.getMetodoPago() == metodoPago)
                .filter(v -> estado == null || v.getEstado() == estado)
                .sorted((a, b) -> b.getFecha().compareTo(a.getFecha()))
                .map(VentaResponse::desde)
                .toList();
    }





    public List<VentaResponse> listarPorRango(
            LocalDateTime desde,
            LocalDateTime hasta
    ) {

        return ventaRepository.findByFechaBetween(desde, hasta)
                .stream()
                .map(VentaResponse::desde)
                .toList();
    }





    @Transactional
    public VentaResponse anularVenta(Long id, String motivo) {

        Usuario usuarioActual = obtenerUsuarioActual();

        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Venta no encontrada: " + id));


        if (venta.getEstado() == EstadoVenta.ANULADA) {
            throw new IllegalStateException(
                    "La venta #" + id + " ya se encuentra anulada");
        }


        // Devolver stock por cada detalle de la venta
        for (DetalleVenta detalle : venta.getDetalles()) {

            Producto producto = detalle.getProducto();

            producto.setStockActual(
                    producto.getStockActual() + detalle.getCantidad()
            );

            productoRepository.save(producto);


            MovimientoStock movimiento = MovimientoStock.builder()
                    .producto(producto)
                    .tipo(TipoMovimiento.INGRESO)
                    .cantidad(detalle.getCantidad())
                    .motivo("Anulación de venta #" + id + ": " + motivo)
                    .usuario(usuarioActual)
                    .build();

            movimientoStockRepository.save(movimiento);
        }


        venta.setEstado(EstadoVenta.ANULADA);
        venta.setFechaAnulacion(LocalDateTime.now());
        venta.setMotivoAnulacion(motivo);
        venta.setUsuarioAnulacion(usuarioActual);

        Venta anulada = ventaRepository.save(venta);


        return VentaResponse.desde(anulada);
    }





    private Usuario obtenerUsuarioActual() {

        Object principal =
                SecurityContextHolder.getContext()
                        .getAuthentication()
                        .getPrincipal();


        if (principal instanceof Usuario usuario) {
            return usuario;
        }


        throw new IllegalStateException(
                "No se pudo determinar el usuario autenticado");
    }
}