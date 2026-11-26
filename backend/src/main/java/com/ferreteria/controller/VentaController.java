package com.ferreteria.controller;

import com.ferreteria.dto.AnularVentaRequest;
import com.ferreteria.dto.VentaRequest;
import com.ferreteria.dto.VentaResponse;
import com.ferreteria.model.EstadoVenta;
import com.ferreteria.model.MetodoPago;
import com.ferreteria.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {


    private final VentaService ventaService;



    // Registrar una venta
    @PostMapping
    public ResponseEntity<VentaResponse> registrar(
            @Valid @RequestBody VentaRequest request
    ) {

        return ResponseEntity.ok(
                ventaService.registrarVenta(request)
        );
    }





    // Historial con filtros
    @GetMapping
    public ResponseEntity<List<VentaResponse>> listar(
            @RequestParam(required = false) String fechaDesde,
            @RequestParam(required = false) String fechaHasta,
            @RequestParam(required = false) MetodoPago metodoPago,
            @RequestParam(required = false) EstadoVenta estado
    ) {


        LocalDateTime desde = null;
        LocalDateTime hasta = null;



        if (fechaDesde != null && !fechaDesde.isEmpty()) {
            desde = LocalDate.parse(fechaDesde)
                    .atStartOfDay();
        }



        if (fechaHasta != null && !fechaHasta.isEmpty()) {
            hasta = LocalDate.parse(fechaHasta)
                    .atTime(LocalTime.MAX);
        }



        return ResponseEntity.ok(
                ventaService.buscarConFiltros(
                        desde,
                        hasta,
                        metodoPago,
                        estado
                )
        );
    }






    @GetMapping("/{id}")
    public ResponseEntity<VentaResponse> obtener(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                ventaService.obtenerPorId(id)
        );
    }





    // Anular una venta (cambia ACTIVA -> ANULADA y devuelve el stock)
    @PatchMapping("/{id}/anular")
    public ResponseEntity<VentaResponse> anular(
            @PathVariable Long id,
            @Valid @RequestBody AnularVentaRequest request
    ) {

        return ResponseEntity.ok(
                ventaService.anularVenta(id, request.getMotivo())
        );
    }

}