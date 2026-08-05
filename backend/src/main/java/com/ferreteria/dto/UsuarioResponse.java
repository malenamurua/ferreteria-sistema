package com.ferreteria.dto;

import com.ferreteria.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class UsuarioResponse {
    private Long id;
    private String username;
    private String nombreCompleto;
    private String rol;
    private boolean habilitado;
    private LocalDateTime fechaCreacion;

    public static UsuarioResponse desde(Usuario u) {
        return new UsuarioResponse(
                u.getId(),
                u.getUsername(),
                u.getNombreCompleto(),
                u.getRol().name(),
                u.isHabilitado(),
                u.getFechaCreacion()
        );
    }
}
