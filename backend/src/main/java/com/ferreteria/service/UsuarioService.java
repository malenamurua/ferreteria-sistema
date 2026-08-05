package com.ferreteria.service;

import com.ferreteria.dto.CambiarPasswordRequest;
import com.ferreteria.dto.CrearUsuarioRequest;
import com.ferreteria.dto.UsuarioResponse;
import com.ferreteria.exception.CredencialesInvalidasException;
import com.ferreteria.exception.RecursoNoEncontradoException;
import com.ferreteria.exception.UsuarioDuplicadoException;
import com.ferreteria.model.Usuario;
import com.ferreteria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::desde)
                .toList();
    }

    public UsuarioResponse crear(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new UsuarioDuplicadoException("Ya existe un usuario con ese nombre: " + request.getUsername());
        }

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nombreCompleto(request.getNombreCompleto())
                .rol(request.getRol())
                .habilitado(true)
                .build();

        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    // Habilitar o deshabilitar un usuario (en vez de borrarlo, para no perder el historial de ventas/movimientos)
    public UsuarioResponse cambiarHabilitado(Long id, boolean habilitado) {
        Usuario usuario = buscarPorId(id);
        usuario.setHabilitado(habilitado);
        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    // El propio usuario cambia su contraseña (requiere la actual)
    public void cambiarPasswordPropia(CambiarPasswordRequest request) {
        Usuario usuario = obtenerUsuarioActual();

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
        usuarioRepository.save(usuario);
    }

    // Un ADMIN resetea la contraseña de otro usuario (no necesita la actual, ej: el vendedor la olvido)
    public void resetearPassword(Long id, String nuevaPassword) {
        Usuario usuario = buscarPorId(id);
        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        usuarioRepository.save(usuario);
    }

    private Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado: " + id));
    }

    private Usuario obtenerUsuarioActual() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Usuario usuario) {
            return usuario;
        }
        throw new IllegalStateException("No se pudo determinar el usuario autenticado");
    }
}
