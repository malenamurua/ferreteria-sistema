package com.ferreteria.controller;

import com.ferreteria.dto.AjusteStockRequest;
import com.ferreteria.dto.ProductoRequest;
import com.ferreteria.dto.ProductoResponse;
import com.ferreteria.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listar(@RequestParam(required = false) String nombre) {
        if (nombre != null && !nombre.isBlank()) {
            return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
        }
        return ResponseEntity.ok(productoService.listarActivos());
    }

    // Busqueda unificada para la pantalla de venta: el mismo campo sirve para
    // tipear el nombre o para lo que ingrese el lector de codigo de barras.
    // GET /api/productos/buscar?q=martillo   o   GET /api/productos/buscar?q=7791234567890
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoResponse>> buscar(@RequestParam String q) {
        return ResponseEntity.ok(productoService.buscar(q));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtener(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    // Usado por el lector de codigo de barras: GET /api/productos/codigo/7791234567890
    @GetMapping("/codigo/{codigoBarras}")
    public ResponseEntity<ProductoResponse> buscarPorCodigo(@PathVariable String codigoBarras) {
        return ResponseEntity.ok(productoService.buscarPorCodigoBarras(codigoBarras));
    }

    // Productos con stock igual o por debajo del minimo -> para la alerta en el dashboard
    @GetMapping("/stock-bajo")
    public ResponseEntity<List<ProductoResponse>> stockBajo() {
        return ResponseEntity.ok(productoService.listarConStockBajo());
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizar(@PathVariable Long id,
                                                         @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    // Baja logica (no borra de la base)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // Ingreso o descuento manual de stock (con motivo, queda trazado en MovimientoStock)
    @PostMapping("/{id}/ajustar-stock")
    public ResponseEntity<ProductoResponse> ajustarStock(@PathVariable Long id,
                                                           @Valid @RequestBody AjusteStockRequest request) {
        return ResponseEntity.ok(productoService.ajustarStock(id, request));
    }
}
