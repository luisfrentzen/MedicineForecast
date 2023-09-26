from fastapi import FastAPI
import dotenv
from fastapi.middleware.cors import CORSMiddleware

import schemas
from helper.question_answering_agent import question_answering, get_result, relevant_docs
from helper.pharma_sales_prediction import pharma_sales_prediction
from helper.serp_helper import search_news

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
async def startup_event():
    dotenv.load_dotenv(verbose=True)


@app.post("/question-answering")
def post_question_answering(q: schemas.Question):
    return question_answering(q.prompt)


@app.post("/pharma-sales-prediction")
def get_pharma_sales_prediction():
    return pharma_sales_prediction()


@app.get("/get-LLM-result")
def get_LLM_result():
    return get_result()


@app.get("/get-relevant-docs")
def get_relevant_docs(keyword: str):
    return relevant_docs(keyword)


@app.post("/search-result")
def get_searches():
    return search_news()
