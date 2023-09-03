import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import ListView from '../components/ListView';
import NewsCard from '../components/NewsCard';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
// import Backdrop from '@mui/material/Backdrop';

function MainPage() {
    const [graphData, setGraphData] = useState(null);
    const [graphTitle, setGraphTitle] = useState('Drug Demand Forecast');
    const [drugTypeList, setDrugTypeList] = useState(['Vitamin A', 'Vitamin B']);
    const [news, setNews] = useState([]);
    const [sourceDocuments, setSourceDocuments] = useState([]);
    const [index, setIndex] = useState(0);
    const [sourceTitle, setSourceTitle] = useState('');
    // const [open, setOpen] = React.useState(false);
    // const handleClose = () => {
    //     setOpen(false);
    // };
    // const handleOpen = () => {
    // setOpen(true);
    // };

    async function getNewsfromLLM(){
        await fetch('http://127.0.0.1:8000/get-LLM-result', 
        {
            method: 'GET',
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            let newNewsList = []
            let categories = data.answer.split('\n');
            categories.forEach((category, index)=>{
                let [title, medicineList] = category.split(':');
                newNewsList.push(
                    {
                        title: title,
                        medicineList: medicineList
                    }
                )
            })
            setNews(newNewsList);
        })
        .catch((err) => {
            console.log(err.message);
        });
    }
    async function getSourceDocument(title){
        setSourceTitle(title)
        await fetch('http://127.0.0.1:8000/get-relevant-docs?keyword='+title,
        {
            method: 'GET',
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            let sourceDocuments = data.source_documents
            setSourceDocuments(sourceDocuments);
            // handleOpen()
        })
        .catch((err) => {
            console.log(err.message);
        });
    }
    async function getPrediction(){
        await fetch('http://127.0.0.1:8000/pharma-sales-prediction', 
        {
            method: 'POST',
            headers: {
            'Content-type': 'application/json; charset=UTF-8',
            },
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            let newGraphData = []
            let newDrugList = []
            data.forEach((medicineType)=>{
                let recentDataforPredX = medicineType.recent_data.X[medicineType.recent_data.X.length - 1]
                let recentDataforPredY = medicineType.recent_data.Y[medicineType.recent_data.Y.length - 1]
                medicineType.prediction.X.unshift(recentDataforPredX)
                medicineType.prediction.Y.unshift(recentDataforPredY)
                newGraphData.push({
                    recent_data:{
                        x: medicineType.recent_data.X,
                        y: medicineType.recent_data.Y
                    },
                    prediction:{
                        x: medicineType.prediction.X,
                        y: medicineType.prediction.Y
                    }
                })
                newDrugList.push(medicineType.name)
            })
            setGraphData(newGraphData)
            setDrugTypeList(newDrugList)
        })
        .catch((err) => {
            console.log(err.message);
        });
    }
    useEffect(() => {
        getNewsfromLLM();
        getPrediction();
    },[]);

    function changeIndexGraph(index){
        setIndex(index);
    }

    return (
        <div className='flex flex-col justify-center'>
            <div className='flex items-center justify-center my-2'>
                <Typography variant="h3" gutterBottom>
                    Medicine Forecast w/ Time Series + LLM
                </Typography>
            </div>
            <div className='mx-5'>
                <Typography variant="h4" gutterBottom>
                    Drug Sales Time Series Forecasting
                </Typography>
                <div className='flex flex-row'>
                    {
                    graphData != null &&
                        <Plot
                            data={[
                            {
                                x: graphData[index].recent_data.x,
                                y: graphData[index].recent_data.y,
                                type: 'scatter',
                                name: 'Current',
                                mode: 'lines+markers',
                                marker: {color: 'blue'},
                            },
                            {
                                x: graphData[index].prediction.x,
                                y: graphData[index].prediction.y,
                                type: 'scatter',
                                name: 'Predicted',
                                mode: 'lines+markers',
                                marker: {color: 'red'},
                            }
                            ]}
                            layout={ {width: 1000, height: 700, title: graphTitle} }
                        />
                    }
                    <div className='w-full'>
                        <ListView drugs={drugTypeList} changeIndexGraph={changeIndexGraph}/>
                    </div>
                </div>
            </div>
            <div className='mx-5'>
                <Typography variant="h4" gutterBottom>
                    List of Drugs Predicted to be on Demand based on Current News
                </Typography>
                <div className='flex flex-wrap'>
                    {
                        news.map((info, index)=>{
                            if(info.medicineList != undefined){
                                return(
                                    <div className='mx-2 my-1'>
                                        <NewsCard className="w-50" title={info.title} info={info.medicineList.split(',').join('\n')} key={index} getSourceDocument={getSourceDocument}/>
                                    </div>
                                )
                            }
                        })
                    }
                </div>
            </div>
            
            <div className='mx-5 my-3'>
                {
                    sourceTitle &&
                    <Typography variant="h4" gutterBottom>
                        List of News supporting the related medicine of "{sourceTitle}" will be in High Demand
                    </Typography>
                }
                <div className='flex my-2 flex-wrap'>
                {
                    sourceDocuments &&
                    sourceDocuments.map((info, index)=>{
                        return(
                            <div className='mx-2 my-1'>
                                <NewsCard className="max-w-xl" info={info.page_content} key={index}/>
                            </div>
                        )
                    })
                }
                </div>
            </div>
            
            <Box sx={{ bgcolor: '#cfe8fc', height: '5vh' }} >
                <div className='flex justify-center'>
                    <Typography variant="overline" gutterBottom>
                        &copy; 2023 Ping Pong Bing Bong
                    </Typography>
                </div>
            </Box>
            
        </div>
        
    );
}

export default MainPage