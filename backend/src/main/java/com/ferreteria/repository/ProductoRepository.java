package com.ferreteria.repository;

import com.ferreteria.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoBarras(String codigoBarras);

    List<Producto> findByActivoTrue();

    List<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);

    // Busqueda unificada: por nombre O por codigo de barras (parcial), solo activos.
    // Pensada para la pantalla de venta: sirve tanto para tipear el nombre
    // como para lo que tipee/pegue el lector de codigo de barras.
    @org.springframework.data.jpa.repository.Query(
        "SELECT p FROM Producto p WHERE p.activo = true AND (" +
        "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :texto, '%')) " +
        "OR p.codigoBarras LIKE CONCAT('%', :texto, '%'))"
    )
    List<Producto> buscarPorNombreOCodigoBarras(@org.springframework.data.repository.query.Param("texto") String texto);

    // Alertas: productos con stock igual o por debajo del minimo
    @org.springframework.data.jpa.repository.Query(
        "SELECT p FROM Producto p WHERE p.activo = true AND p.stockActual <= p.stockMinimo"
    )
    List<Producto> findConStockBajo();
}
