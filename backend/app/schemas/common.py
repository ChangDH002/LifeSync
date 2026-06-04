from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class CommonResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: T | None = None

    @classmethod
    def ok(cls, data: T | None = None, message: str = "OK") -> "CommonResponse[T]":
        return cls(success=True, message=message, data=data)

    @classmethod
    def fail(cls, message: str, data: T | None = None) -> "CommonResponse[T]":
        return cls(success=False, message=message, data=data)

