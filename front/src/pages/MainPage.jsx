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

  function changeIndexGraph(e) {
    setIndex(e.target.selectedIndex);
    // console.log();
  }

  return (
    <div className="flex flex-col">
      <Navbar></Navbar>
      <div className="px-12">
        <div className="mt-8">
          <Typography variant="h5" gutterBottom>
            Bioproduct Sales Forecast
          </Typography>
          <div className="flex w-full border-2 bg-gray-100 rounded-t-md px-4 py-4 gap-8">
            <div className="flex flex-col">
              <div className="mb-2 text-gray-600 text-sm">Medicine ATC</div>
              <select
                className="w-48 h-12 border-2 rounded-md px-4"
                onChange={changeIndexGraph}
              >
                {drugTypeList.map((drug, index) => {
                  return (
                    <option key={index} value={drug}>
                      {drug}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-gray-600 text-sm">Flat Stock</div>
              <input
                type="number"
                placeholder="0"
                className="w-48 h-12 border-2 rounded-md px-4"
              ></input>
            </div>
          </div>
          <div className="w-full flex flex-row border-2 w-fit rounded-b-md border-t-0 overflow-hidden">
            {graphData != null && (
              <Plot
                className="my-2 mx-6 w-full"
                data={[
                  {
                    x: graphData[index].recent_data.x,
                    y: graphData[index].recent_data.y,
                    type: "scatter",
                    name: "Current",
                    mode: "lines+markers",
                    marker: { color: "#00a1ff" },
                  },
                  {
                    x: graphData[index].prediction.x,
                    y: graphData[index].prediction.y,
                    type: "scatter",
                    name: "Predicted",
                    mode: "lines+markers",
                    marker: { color: "#38c18c" },
                  },
                ]}
                layout={{ title: graphTitle }}
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
