package com.ferreteria.config;

import com.ferreteria.model.Rol;
import com.ferreteria.model.Usuario;
import com.ferreteria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador")
                    .rol(Rol.ADMIN)
                    .habilitado(true)
                    .build();

            Usuario vendedor = Usuario.builder()
                    .username("vendedor")
                    .password(passwordEncoder.encode("vendedor123"))
                    .nombreCompleto("Vendedor de Prueba")
                    .rol(Rol.VENDEDOR)
                    .habilitado(true)
                    .build();

            usuarioRepository.save(admin);
            usuarioRepository.save(vendedor);

            System.out.println("========================================");
            System.out.println(" Usuario admin creado    -> username: admin / password: admin123");
            System.out.println(" Usuario vendedor creado -> username: vendedor / password: vendedor123");
            System.out.println(" IMPORTANTE: cambiar estas contraseñas luego.");
            System.out.println("========================================");
        }
    }
}
