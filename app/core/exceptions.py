"""Excepciones de dominio. Los servicios las lanzan; main.py las traduce a HTTP.
Así la lógica de negocio no depende de FastAPI."""


class AppError(Exception):
    status_code = 400
    default_detail = "Error de aplicación"

    def __init__(self, detail: str | None = None):
        self.detail = detail or self.default_detail
        super().__init__(self.detail)


class BadRequestError(AppError):
    status_code = 400
    default_detail = "Solicitud inválida"


class UnauthorizedError(AppError):
    status_code = 401
    default_detail = "No autenticado"


class PermissionDeniedError(AppError):
    status_code = 403
    default_detail = "No tienes permisos para realizar esta acción"


class NotFoundError(AppError):
    status_code = 404
    default_detail = "Recurso no encontrado"


class ConflictError(AppError):
    status_code = 409
    default_detail = "Conflicto con el estado actual del recurso"
