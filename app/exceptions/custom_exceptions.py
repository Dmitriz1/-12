class NotFoundError(Exception):
    def __init__(self, entity: str, id: int):
        self.entity = entity
        self.id = id
        super().__init__(f"{entity} with id {id} not found")


class BadRequestError(Exception):
    def __init__(self, message: str,  field: str | None = None):
        self.field = field
        super().__init__(message)

class UnauthorizedError(Exception):
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)

class ConflictError(Exception):
    def __init__(self, message: str, field: str):
        self.message = message
        self.field = field
        super().__init__(message)