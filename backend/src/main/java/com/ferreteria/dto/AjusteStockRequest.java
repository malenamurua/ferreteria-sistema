package com.ferreteria.dto;

import com.ferreteria.model.TipoMovimiento;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AjusteStockRequest {

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private TipoMovimiento tipo; // INGRESO o EGRESO_MANUAL

    @NotNull(message = "La cantidad es obligatoria")
    private Integer cantidad; // siempre positivo, el signo lo decide el service según el tipo

    private String motivo; // ej: "Rotura", "Compra a proveedor", "Ajuste de inventario"
}
