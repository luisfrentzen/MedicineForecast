import React, { useEffect, useState } from "react";
import NewsCard from "../components/NewsCard";
import InfoCard from "../components/InfoCard";
import Typography from "@mui/material/Typography";

export default function LLMSection({ apiHost }) {
  const [sourceDocuments, setSourceDocuments] = useState([]);
  const [sourceTitle, setSourceTitle] = useState("");
  const [news, setNews] = useState([]);

  useEffect(() => {
    getNewsfromLLM();
  }, []);

  async function getNewsfromLLM() {
    await fetch(`${apiHost}/get-LLM-result`, {
      mode: "cors",
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        let newNewsList = [];
        let categories = data.answer.split("\n");
        categories.forEach((category, index) => {
          let [title, medicineList] = category.split(":");
          newNewsList.push({
            title: title,
            medicineList: medicineList,
          });
        });
        console.log(newNewsList);
        setNews(newNewsList);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  async function getSourceDocument(title) {
    setSourceTitle(title);
    await fetch(`${apiHost}/get-relevant-docs?keyword=${title}`, {
      mode: "cors",
      method: "GET",
    })
      .then((response) => response.json())
      .then((data) => {
        let sourceDocuments = data.source_documents;
        setSourceDocuments(sourceDocuments);
        // handleOpen()
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  return (
    <>
      <div className="mt-8">
        <Typography variant="h5" gutterBottom>
          Drugs Predicted To Be On Demand
        </Typography>
        <div className="flex flex-wrap">
          {news.map((info, index) => {
            if (info.medicineList != undefined) {
              return (
                <div className="mx-2 my-1">
                  <NewsCard
                    title={info.title}
                    info={info.medicineList.split(",").join("\n")}
                    key={index}
                    getSourceDocument={getSourceDocument}
                  />
                </div>
              );
            }
          })}
        </div>
      </div>
      <div className="my-8">
        {sourceTitle && (
          <Typography variant="h5" gutterBottom>
            Supporting Articles of <u className="">{sourceTitle}</u>
          </Typography>
        )}
        <div className="flex my-2 flex-wrap">
          {sourceDocuments &&
            sourceDocuments.map((info, index) => {
              return (
                <div className="mx-2 my-1">
                  <InfoCard
                    className="max-w-xl"
                    source={info.metadata.source}
                    info={info.page_content}
                    key={index}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </>
  );
}
