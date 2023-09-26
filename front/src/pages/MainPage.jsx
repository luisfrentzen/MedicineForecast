import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import ListView from "../components/ListView";
import NewsCard from "../components/NewsCard";
import InfoCard from "../components/InfoCard";
import Typography from "@mui/material/Typography";
import config from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MainPage() {
  const [graphData, setGraphData] = useState(null);
  const [graphTitle, setGraphTitle] = useState("Medicine Demand Forecast");
  const [drugTypeList, setDrugTypeList] = useState(["Getting Data"]);
  const [news, setNews] = useState([]);
  const [sourceDocuments, setSourceDocuments] = useState([]);
  const [index, setIndex] = useState(0);
  const [sourceTitle, setSourceTitle] = useState("");

  let apiHost =
    config.env === "prod"
      ? config.production.apiEndpoint
      : config.development.apiEndpoint;

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
        console.log(data);
        let sourceDocuments = data.source_documents;
        setSourceDocuments(sourceDocuments);
        // handleOpen()
      })
      .catch((err) => {
        console.log(err.message);
      });
  }

  async function getPrediction() {
    await fetch(`${apiHost}/pharma-sales-prediction`, {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("a");
        console.log(data);
        let newGraphData = [];
        let newDrugList = [];
        data.forEach((medicineType) => {
          let recentDataforPredX =
            medicineType.recent_data.X[medicineType.recent_data.X.length - 1];
          let recentDataforPredY =
            medicineType.recent_data.Y[medicineType.recent_data.Y.length - 1];
          medicineType.prediction.X.unshift(recentDataforPredX);
          medicineType.prediction.Y.unshift(recentDataforPredY);
          newGraphData.push({
            recent_data: {
              x: medicineType.recent_data.X,
              y: medicineType.recent_data.Y,
            },
            prediction: {
              x: medicineType.prediction.X,
              y: medicineType.prediction.Y,
            },
          });
          newDrugList.push(medicineType.name);
        });
        setGraphData(newGraphData);
        setDrugTypeList(newDrugList);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  useEffect(() => {
    getNewsfromLLM();
    getPrediction();
  }, []);

  function changeIndexGraph(index) {
    setIndex(index);
  }

  return (
    <div className="flex flex-col">
      <Navbar></Navbar>
      <div className="px-12">
        <div className="">
          <Typography variant="h5" gutterBottom>
            Medicine Sales Overtime
          </Typography>
          <div className="flex flex-row border-2 w-fit rounded-md overflow-hidden">
            <div className="border-r-2 min-w-[18rem]">
              <ListView
                key={drugTypeList}
                drugs={drugTypeList}
                changeIndexGraph={changeIndexGraph}
              />
            </div>
            {graphData != null && (
              <Plot
                className="my-2 mx-6 min-w-[36rem]"
                data={[
                  {
                    x: graphData[index].recent_data.x,
                    y: graphData[index].recent_data.y,
                    type: "scatter",
                    name: "Current",
                    mode: "lines+markers",
                    marker: { color: "blue" },
                  },
                  {
                    x: graphData[index].prediction.x,
                    y: graphData[index].prediction.y,
                    type: "scatter",
                    name: "Predicted",
                    mode: "lines+markers",
                    marker: { color: "red" },
                  },
                ]}
                layout={{ width: 1000, height: 700, title: graphTitle }}
              />
            )}
          </div>
        </div>
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
              Supporting News of "{sourceTitle}"
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
      </div>
      <Footer></Footer>
    </div>
  );
}

export default MainPage;
