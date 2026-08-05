package com.ferreteria.repository;

import com.ferreteria.model.DetalleVenta;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DetalleVentaRepository extends JpaRepository<DetalleVenta, Long> {

    // Cada fila: [productoId, nombreProducto, cantidadTotalVendida, totalFacturado]
    @Query("SELECT d.producto.id, d.producto.nombre, SUM(d.cantidad), SUM(d.subtotal) " +
           "FROM DetalleVenta d " +
           "WHERE d.venta.fecha BETWEEN :desde AND :hasta " +
           "GROUP BY d.producto.id, d.producto.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<Object[]> buscarProductosMasVendidos(@Param("desde") LocalDateTime desde,
                                               @Param("hasta") LocalDateTime hasta,
                                               Pageable pageable);
}
