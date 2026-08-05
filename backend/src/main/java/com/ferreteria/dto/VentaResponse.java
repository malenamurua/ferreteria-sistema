package com.ferreteria.dto;

import com.ferreteria.model.Venta;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
public class VentaResponse {
    private Long id;
    private String vendedorUsername;
    private String metodoPago;
    private BigDecimal total;
    private LocalDateTime fecha;
    private List<DetalleVentaResponse> detalles;

    public static VentaResponse desde(Venta v) {
        return new VentaResponse(
                v.getId(),
                v.getVendedor().getUsername(),
                v.getMetodoPago().name(),
                v.getTotal(),
                v.getFecha(),
                v.getDetalles().stream().map(DetalleVentaResponse::desde).toList()
        );
    }
}
