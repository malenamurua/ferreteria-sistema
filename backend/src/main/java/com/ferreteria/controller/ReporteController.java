package com.ferreteria.controller;

import com.ferreteria.dto.ProductoMasVendidoResponse;
import com.ferreteria.dto.ReporteVentasResponse;
import com.ferreteria.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/ventas/hoy")
    public ResponseEntity<ReporteVentasResponse> ventasHoy() {
        return ResponseEntity.ok(reporteService.reporteDeHoy());
    }

    @GetMapping("/ventas/semana")
    public ResponseEntity<ReporteVentasResponse> ventasSemana() {
        return ResponseEntity.ok(reporteService.reporteSemanal());
    }

    @GetMapping("/ventas/mes")
    public ResponseEntity<ReporteVentasResponse> ventasMes() {
        return ResponseEntity.ok(reporteService.reporteMensual());
    }

    // Rango personalizado: /api/reportes/ventas?desde=2026-07-01&hasta=2026-07-31
    @GetMapping("/ventas")
    public ResponseEntity<ReporteVentasResponse> ventasPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(reporteService.reportePorRango(desde, hasta));
    }

    // Top productos vendidos en un rango. Por defecto trae el top 10.
    // /api/reportes/productos-mas-vendidos?desde=2026-07-01&hasta=2026-07-31&limite=5
    @GetMapping("/productos-mas-vendidos")
    public ResponseEntity<List<ProductoMasVendidoResponse>> productosMasVendidos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "10") int limite) {
        return ResponseEntity.ok(reporteService.productosMasVendidos(desde, hasta, limite));
    }
}
