package com.ferreteria.dto;

import com.ferreteria.model.Producto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class ProductoResponse {
    private Long id;
    private String nombre;
    private String descripcion;
    private String codigoBarras;
    private Long categoriaId;
    private String categoriaNombre;
    private BigDecimal precioCosto;
    private BigDecimal precioVenta;
    private Integer stockActual;
    private Integer stockMinimo;
    private String unidadMedida;
    private boolean activo;
    private boolean stockBajo;

    public static ProductoResponse desde(Producto p) {
        return new ProductoResponse(
                p.getId(),
                p.getNombre(),
                p.getDescripcion(),
                p.getCodigoBarras(),
                p.getCategoria() != null ? p.getCategoria().getId() : null,
                p.getCategoria() != null ? p.getCategoria().getNombre() : null,
                p.getPrecioCosto(),
                p.getPrecioVenta(),
                p.getStockActual(),
                p.getStockMinimo(),
                p.getUnidadMedida(),
                p.isActivo(),
                p.isStockBajo()
        );
    }
}
