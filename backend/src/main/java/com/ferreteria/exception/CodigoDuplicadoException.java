package com.ferreteria.exception;

public class CodigoDuplicadoException extends RuntimeException {
    public CodigoDuplicadoException(String mensaje) {
        super(mensaje);
    }
}
