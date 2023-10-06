import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Typography from "@mui/material/Typography";
import config from "../config";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import loading from "../assets/loading.gif";
import LLMSection from "../components/LLMSection";

var mainGraphData;
function MainPage() {
  const [graphData, setGraphData] = useState(null);
  const [graphTitle, setGraphTitle] = useState("Bioproduct Demand Forecast");
  const [drugTypeList, setDrugTypeList] = useState(["N/A"]);
  const [index, setIndex] = useState(0);
  const [stock, setStock] = useState(0);
  const [loadingState, setLoadingState] = useState(true);
  const [selectedUnitOfTime, setSelectedUnitOfTime] = useState("weekly");
  const [flatError, setFlatError] = useState(0);
  const [predictionError, setPredictionError] = useState(0);

  let apiHost =
    config.env === "prod"
      ? config.production.apiEndpoint
      : config.development.apiEndpoint;

  async function getPrediction(modelEndpoint) {
    setLoadingState(true);
    await fetch(modelEndpoint, {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        let newGraphData = [];
        let newDrugList = [];
        data.forEach((medicineType) => {
          // let recentDataforPredX =
          //   medicineType.recent_data.X[medicineType.recent_data.X.length - 1];
          // let recentDataforPredY =
          //   medicineType.recent_data.Y[medicineType.recent_data.Y.length - 1];
          // medicineType.prediction.X.unshift(recentDataforPredX);
          // medicineType.prediction.Y.unshift(recentDataforPredY);

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
        mainGraphData = newGraphData;
        setGraphData(newGraphData);
        setDrugTypeList(newDrugList);
        setLoadingState(false);
        setSelectedUnitOfTime("weekly"); 
        calculateFlatError()
        calculatePredictionError()
      })
      .catch((err) => {
        console.log(err.message);
      });
  }
  useEffect(() => {
    getPrediction(`${apiHost}/pharma-sales-prediction`);
  }, []);

  function changeIndexGraph(e) {
    setIndex(e.target.selectedIndex);
    calculateFlatError()
    calculatePredictionError()
  }

  function calculateFlatError(){
    if(stock > 0 && graphData){
      let errorToReturn = 0
      for(let i = 0 ; i < graphData[index].prediction.y.length ; i++){
        errorToReturn += stock - graphData[index].prediction.y[i]
      }
      setFlatError(errorToReturn/graphData[index].prediction.y.length)
    }
  }

  function calculatePredictionError(){
    if(graphData){
      let errorToReturn = 0
      for(let i = 0 ; i < graphData[index].recent_data.y.length ; i++){
        errorToReturn += graphData[index].prediction.y[i] - graphData[index].recent_data.y[i]
      }
      setPredictionError(errorToReturn/graphData[index].recent_data.y.length)
    }
    
  }

  function changeModel(e) {
    let opt = e.target.value;
    if (opt === "PropetLSTM") {
      getPrediction(`${apiHost}/pharma-sales-prediction`);
    } else if (opt === "ARIMA") {
      getPrediction(`${apiHost}/arima-pharma-sales-prediction`);
    }
  }
  const checkOccurrence = (array, search) => {
    let counter = 0;
    for (let i = 0; i <= array.x.length; i++) {
      if (new Date(Date.parse(array.x[i])).getMonth() + 1 === search) {
        counter++;
      }
    }
    return counter;
  };
  const reducetoMonthUnit = (arr) => {
    let newArray = [];
    arr.x.forEach((val, idx) => {
      let search = new Date(Date.parse(val)).getMonth() + 1;
      const index = newArray.findIndex((obj) => obj.x === search);
      if (index !== -1) {
        newArray[index].y += arr.y[idx];
      } else {
        newArray.push({
          x: search,
          y: arr.y[idx],
        });
      }
    });

    const X = newArray.map((item) => {
      return item.x;
    });
    const Y = newArray.map((item) => {
      return item.y / checkOccurrence(arr, item.x);
    });
    return {
      x: X,
      y: Y,
    };
  };

  const aggregateArray = (arr, agg) => {
    let newArray = [];
    if (agg === "monthly") {
      arr.forEach((val) => {
        newArray.push({
          prediction: reducetoMonthUnit(val.prediction),
          recent_data: reducetoMonthUnit(val.recent_data),
        });
      });
    }

    return newArray;
  };

  function changeUnitofTime(e) {
    let opt = e.target.value;
    setSelectedUnitOfTime(opt);
    if (opt === "weekly") {
      setGraphData(mainGraphData);
    } else {
      let aggregatedArray = aggregateArray(mainGraphData, opt);
      setGraphData(aggregatedArray);
    }
  }

  const lineProps =
    stock != 0
      ? {
          shapes: [
            {
              type: "line",
              xref: "paper",
              x0: 0.05,
              x1: 0.95,
              y0: stock,
              y1: stock,
              name: "Stock",
              line: {
                color: "#f24646",
                width: 2,
                dash: "solid",
              },
            },
          ],
        }
      : null;
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
                onChange={(e) => {
                  setStock(e.target.value);
                  calculateFlatError();
                }}
              ></input>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-gray-600 text-sm">Forecast Model</div>
              <select
                className="w-48 h-12 border-2 rounded-md px-4"
                onChange={changeModel}
                placeholder="None"
              >
                <option key="1" value="PropetLSTM">
                  Prophet LSTM Ensemble
                </option>
                <option key="2" value="ARIMA">
                  ARIMA
                </option>
              </select>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-gray-600 text-sm">Unit of Time</div>
              <select
                className="w-48 h-12 border-2 rounded-md px-4"
                onChange={changeUnitofTime}
                placeholder="None"
                value={selectedUnitOfTime}
              >
                <option key="1" value="weekly">
                  Weekly
                </option>
                <option key="2" value="monthly">
                  Monthly
                </option>
              </select>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-gray-600 text-sm">Flat Stock Error</div>
              <div>
                {flatError}
              </div>
            </div>
            <div className="flex flex-col">
              <div className="mb-2 text-gray-600 text-sm">Prediction Stock Error</div>
              <div>
                {predictionError}
              </div>
            </div>
          </div>
          <div className="w-full h-[40rem] flex flex-row border-2 w-fit rounded-b-md border-t-0 overflow-hidden">
            {loadingState && (
              <div className="w-full h-full flex justify-center items-center text-lg h-24 text-gray-400">
                <img className="mr-2 w-8 opacity-50" src={loading}></img>
                <div className="pb-[0.2rem]">Getting Data</div>
              </div>
            )}
            {!loadingState && graphData != null && (
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
                  ...lineProps,
                }}
              />
            )}
          </div>
        </div>
        <LLMSection apiHost={apiHost} />
      </div>
      <Footer></Footer>
    </div>
  );
}

export default MainPage;
