import pydantic
from typing import List, Union


class QuestionAnswer(pydantic.BaseModel):
    id: str
    question: str
    answer: str
    human_flag: bool


class ClusteredQuestion(pydantic.BaseModel):
    cluster: int
    question: str
    count: int


class Question(pydantic.BaseModel):
    prompt: str


class Questions(pydantic.BaseModel):
    questions: list[str]


class Clusters(pydantic.BaseModel):
    clusters: List[List[Union[int, str]]]
