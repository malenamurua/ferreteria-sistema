package com.ferreteria.controller;

import com.ferreteria.dto.*;
import com.ferreteria.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // Solo ADMIN (ver SecurityConfig)
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(@Valid @RequestBody CrearUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.crear(request));
    }

    @PatchMapping("/{id}/habilitar")
    public ResponseEntity<UsuarioResponse> habilitar(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.cambiarHabilitado(id, true));
    }

    @PatchMapping("/{id}/deshabilitar")
    public ResponseEntity<UsuarioResponse> deshabilitar(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.cambiarHabilitado(id, false));
    }

    // ADMIN resetea la contraseña de otro usuario (ej: el vendedor la olvidó)
    @PostMapping("/{id}/resetear-password")
    public ResponseEntity<Void> resetearPassword(@PathVariable Long id,
                                                  @Valid @RequestBody ResetearPasswordRequest request) {
        usuarioService.resetearPassword(id, request.getNuevaPassword());
        return ResponseEntity.noContent().build();
    }

    // Cualquier usuario autenticado puede cambiar su propia contraseña (requiere la actual)
    @PostMapping("/mi-perfil/cambiar-password")
    public ResponseEntity<Void> cambiarMiPassword(@Valid @RequestBody CambiarPasswordRequest request) {
        usuarioService.cambiarPasswordPropia(request);
        return ResponseEntity.noContent().build();
    }
}
