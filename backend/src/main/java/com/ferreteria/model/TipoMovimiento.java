package com.ferreteria.model;

public enum TipoMovimiento {
    INGRESO,        // compra / carga inicial de stock
    EGRESO_MANUAL,  // descuento manual (rotura, perdida, ajuste)
    VENTA           // descuento automatico por una venta
}
