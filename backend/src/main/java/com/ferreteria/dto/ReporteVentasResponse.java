package com.ferreteria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
public class ReporteVentasResponse {
    private LocalDateTime desde;
    private LocalDateTime hasta;
    private BigDecimal totalVendido;
    private long cantidadVentas;
    private Map<String, BigDecimal> totalPorMetodoPago;   // ej: {"EFECTIVO": 15000, "DEBITO": 8000, "QR": 3000}
    private Map<String, Long> cantidadPorMetodoPago;      // ej: {"EFECTIVO": 5, "DEBITO": 2, "QR": 1}
}
