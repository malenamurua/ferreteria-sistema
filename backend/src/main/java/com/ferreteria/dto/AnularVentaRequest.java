package com.ferreteria.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AnularVentaRequest {

    @NotBlank(message = "El motivo de anulación es obligatorio")
    private String motivo;
}