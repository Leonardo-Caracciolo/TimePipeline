from fastapi import HTTPException, status


class TimePipelineException(Exception):
    """Base exception for TimePipeline domain errors."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class ActivityNotFoundError(TimePipelineException):
    pass


class CategoryNotFoundError(TimePipelineException):
    pass


class InvalidRecurrenceError(TimePipelineException):
    pass


class InvalidDateRangeError(TimePipelineException):
    pass


# HTTP exception factories
def not_found(resource: str, id: int) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"{resource} with id={id} not found.",
    )


def bad_request(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=detail,
    )


def conflict(detail: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail=detail,
    )
