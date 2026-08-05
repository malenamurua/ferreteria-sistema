package com.ferreteria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ProductoMasVendidoResponse {
    private Long productoId;
    private String nombre;
    private Long cantidadVendida;
    private BigDecimal totalFacturado;
}
