from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="Nombre de la categoría, entre 3 y 100 caracteres",
    )
    description: str | None = Field(
        None,
        max_length=500,
        description="Descripción opcional de la categoría",
    )


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(CategoryBase):
    name: str | None = Field(None, min_length=3, max_length=100)


class CategoryResponse(CategoryBase):
    id: int

    model_config = {"from_attributes": True}

