package com.ferreteria.service;

import com.ferreteria.dto.ProductoMasVendidoResponse;
import com.ferreteria.dto.ReporteVentasResponse;
import com.ferreteria.model.MetodoPago;
import com.ferreteria.model.Venta;
import com.ferreteria.repository.DetalleVentaRepository;
import com.ferreteria.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final DetalleVentaRepository detalleVentaRepository;

    // ---- Atajos de periodo ----

    public ReporteVentasResponse reporteDeHoy() {
        LocalDate hoy = LocalDate.now();
        return generarReporte(hoy.atStartOfDay(), hoy.plusDays(1).atStartOfDay());
    }

    public ReporteVentasResponse reporteSemanal() {
        LocalDate hoy = LocalDate.now();
        LocalDate lunes = hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        return generarReporte(lunes.atStartOfDay(), hoy.plusDays(1).atStartOfDay());
    }

    public ReporteVentasResponse reporteMensual() {
        LocalDate hoy = LocalDate.now();
        LocalDate primerDiaDelMes = hoy.withDayOfMonth(1);
        return generarReporte(primerDiaDelMes.atStartOfDay(), hoy.plusDays(1).atStartOfDay());
    }

    // ---- Rango personalizado ----

    public ReporteVentasResponse reportePorRango(LocalDate desde, LocalDate hasta) {
        // "hasta" es inclusivo -> le sumamos un dia para cubrir todo el dia completo
        return generarReporte(desde.atStartOfDay(), hasta.plusDays(1).atStartOfDay());
    }

    public List<ProductoMasVendidoResponse> productosMasVendidos(LocalDate desde, LocalDate hasta, int limite) {
        List<Object[]> filas = detalleVentaRepository.buscarProductosMasVendidos(
                desde.atStartOfDay(),
                hasta.plusDays(1).atStartOfDay(),
                PageRequest.of(0, limite)
        );

        return filas.stream()
                .map(fila -> new ProductoMasVendidoResponse(
                        (Long) fila[0],
                        (String) fila[1],
                        (Long) fila[2],
                        (BigDecimal) fila[3]
                ))
                .toList();
    }

    // ---- Logica compartida ----

    private ReporteVentasResponse generarReporte(LocalDateTime desde, LocalDateTime hasta) {
        List<Venta> ventas = ventaRepository.findByFechaBetween(desde, hasta);

        BigDecimal totalVendido = ventas.stream()
                .map(Venta::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> totalPorMetodo = new HashMap<>();
        Map<String, Long> cantidadPorMetodo = new HashMap<>();

        // Inicializamos los 3 metodos en cero para que el front no tenga que manejar "undefined"
        for (MetodoPago metodo : MetodoPago.values()) {
            totalPorMetodo.put(metodo.name(), BigDecimal.ZERO);
            cantidadPorMetodo.put(metodo.name(), 0L);
        }

        for (Venta venta : ventas) {
            String metodo = venta.getMetodoPago().name();
            totalPorMetodo.merge(metodo, venta.getTotal(), BigDecimal::add);
            cantidadPorMetodo.merge(metodo, 1L, Long::sum);
        }

        return new ReporteVentasResponse(
                desde,
                hasta,
                totalVendido,
                ventas.size(),
                totalPorMetodo,
                cantidadPorMetodo
        );
    }
}
