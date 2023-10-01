import warnings
import numpy as np
from numpy import array
import pandas as pd
from pandas import concat
import math
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error
from sklearn.metrics import mean_absolute_error
from statsmodels.tsa.arima.model import ARIMA
from sklearn.model_selection import ParameterGrid
import json

def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

def init_arima():
    ret = []
    df=pd.read_csv('dataset/salesweekly.csv')

    M01AB= {'series':'M01AB','p':0,'d':0,'q':0}
    M01AE= {'series':'M01AE','p':2,'d':0,'q':0}
    N02BA= {'series':'N02BA','p':5,'d':1,'q':1}
    N02BE= {'series':'N02BE','p':2,'d':0,'q':0}
    N05B= {'series':'N05B','p':0,'d':0,'q':5}
    N05C= {'series':'N05C','p':0,'d':0,'q':1}
    R03= {'series':'R03','p':5,'d':1,'q':1}
    R06= {'series':'R06','p':1,'d':0,'q':1}

    subplotindex=0
    numrows=4
    numcols=2
    # fig, ax = plt.subplots(numrows, numcols, figsize=(18,15))
    # plt.subplots_adjust(wspace=0.1, hspace=0.3)

    warnings.filterwarnings("ignore")

    for x in [M01AB,M01AE,N02BA,N02BE,N05B,N05C,R03,R06]:
        rowindex=math.floor(subplotindex/numcols)
        colindex=subplotindex-(rowindex*numcols)
        X = df[x['series']].values
        size = len(X)-50
        train, test = X[0:size], X[size:len(X)]
        history = [x for x in train]
        predictions = list()
        for t in range(len(test)):
            model = ARIMA(history, order=(x['p'],x['d'],x['q']))
            model_fit = model.fit()
            output = model_fit.forecast()
            yhat = output[0]
            predictions.append(yhat)
            obs = test[t]
            history.append(obs)
        error = mean_squared_error(test, predictions)
        perror = mean_absolute_percentage_error(test, predictions)
        # resultsRollingdf.loc['ARIMA MSE',x['series']]=error
        # resultsRollingdf.loc['ARIMA MAPE',x['series']]=perror
        # ax[rowindex,colindex].set_title(x['series']+' (MSE=' + str(round(error,2))+', MAPE='+ str(round(perror,2)) +'%)')
        # ax[rowindex,colindex].legend(['Real', 'Predicted'], loc='upper left')
        # ax[rowindex,colindex].plot(test)
        # ax[rowindex,colindex].plot(predictions, color='red')
        # subplotindex=subplotindex+1
    # plt.show()

        p = predictions
        pp = []
        for i in range(len(p)):
            pp.append(float(p[i]))
        pp = pp[-8:]

        l = test
        ll = []
        for i in range(len(l)):
            ll.append(float(l[i]))
        ll = ll[-8:-4]

        date_pp = []
        date_ll = []
        for date in df['datum'].tail(40).values:
            date_pp.append(date)
        for date in df['datum'].tail(40).values:
            date_ll.append(date)

        date_pp = date_pp[-8:]
        date_ll = date_ll[-8:-4]

        ret.append({
            'name': x['series'] ,
            'config': [value for key, value in x.items() if key not in ['series']],
            'prediction': {
                'X': date_pp,
                'Y': pp
            },
            'recent_data': {
                'X': date_ll,
                'Y': ll
            }
        })

    with open('dataset/my_list.json', 'w') as file:
        json.dump(ret, file)

def get_arima_prediction():
    ret = []
    with open('dataset/my_list.json', 'r') as file:
        ret = json.load(file)
    
    return ret