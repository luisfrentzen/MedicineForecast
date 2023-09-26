import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Typography from "@mui/material/Typography";
import config from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import loading from "../assets/loading.gif";
import LLMSection from "../components/LLMSection";

function MainPage() {
  const [graphData, setGraphData] = useState(null);
  const [graphTitle, setGraphTitle] = useState("Bioproduct Demand Forecast");
  const [drugTypeList, setDrugTypeList] = useState(["N/A"]);
  const [index, setIndex] = useState(0);
  const [stock, setStock] = useState(0);

  let apiHost =
    config.env === "prod"
      ? config.production.apiEndpoint
      : config.development.apiEndpoint;

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
    getPrediction();
  }, []);

  function changeIndexGraph(e) {
    setIndex(e.target.selectedIndex);
    // console.log();
  }
  const lineProps = stock != 0 ? {shapes:[
    {
      type: 'line',
      xref: 'paper',
      x0: 0,
      x1: 1,
      y0: stock,
      y1: stock,
      name: "Stock",
      line:{
          color: 'rgb(255, 0, 0)',
          width: 4,
          dash:'solid'
      }
    },
  ]} : null;
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
                placeholder="None"
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
                onChange={(e)=>{
                  setStock(e.target.value)
                }}
              ></input>
            </div>
          </div>
          <div className="w-full h-[40rem] flex flex-row border-2 w-fit rounded-b-md border-t-0 overflow-hidden">
            {drugTypeList.length == 1 && (
              <div className="w-full h-full flex justify-center items-center text-lg h-24 text-gray-400">
                <img className="mr-2 w-8 opacity-50" src={loading}></img>
                <div className="pb-[0.2rem]">Getting Data</div>
              </div>
            )}
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
                    marker: {
                      color: "#00a1ff",
                      symbol: "circle-dot",
                      size: 12,
                    },
                  },
                  {
                    x: graphData[index].prediction.x,
                    y: graphData[index].prediction.y,
                    type: "scatter",
                    name: "Predicted",
                    mode: "lines+markers",
                    marker: {
                      color: "#38c18c",
                      symbol: "circle-dot",
                      size: 12,
                    },
                  },
                ]}
                config={{ displayModeBar: false }}
                layout={{ 
                  title: graphTitle,
                  ...lineProps
                }}
              />
            )}
          </div>
        </div>
        <LLMSection apiHost={apiHost}/>
      </div>
      <Footer></Footer>
    </div>
  );
}

export default MainPage;
