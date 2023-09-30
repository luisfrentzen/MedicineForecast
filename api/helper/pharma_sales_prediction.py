import warnings
import json
import numpy as np
from numpy import array
import pandas as pd
from pandas import concat
import math
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import ParameterGrid
import tensorflow as tf
from keras.models import Sequential
from keras.layers import LSTM
from keras.layers import Dense
from keras.layers import Bidirectional
from sklearn.preprocessing import MinMaxScaler
import prophet
from prophet.serialize import model_to_json, model_from_json

def split_sequence(sequence, n_steps):
    X, y = list(), list()
    for i in range(len(sequence)):
        end_ix = i + n_steps
        if end_ix > len(sequence)-1:
            break
        seq_x, seq_y = sequence[i:end_ix], sequence[end_ix]
        X.append(seq_x)
        y.append(seq_y)
    return array(X), array(y)

def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

def pharma_sales_prediction():
    df=pd.read_csv('dataset/salesweekly.csv')

    size = int(len(df) - 50)
    n_steps=10
    n_features = 1

    subplotindex=0
    numrows=4
    numcols=2
    # fig, ax = plt.subplots(numrows, numcols, figsize=(18,15))
    # plt.subplots_adjust(wspace=0.1, hspace=0.3)

    ret = []

    r=['M01AB','M01AE','N02BA','N02BE','N05B','N05C','R03','R06']
    ppp = []
    for x in r:
        rowindex=math.floor(subplotindex/numcols)
        colindex=subplotindex-(rowindex*numcols)
        dfg=df[['datum',x]]
        dfg = dfg.rename(columns={'datum': 'ds', x: 'y'})
        size = int(len(dfg) - 50)
        dfgtrain=dfg.loc[0:size,:]
        dfgtest=dfg.loc[size+1:len(dfg),:]
        predictions = list()
    #     model = fbprophet.Prophet(changepoint_prior_scale=x['params_grid']['changepoint_prior_scale'],
    #                               growth='linear', interval_width=x['params_grid']['interval_width'], 
    #                               daily_seasonality=False, 
    #                               weekly_seasonality=False
    #                            )
    #     if(x['series']=='N02BE' or x['series']=='R03' or x['series']=='R06'):
    #         model=model.add_seasonality(
    #                                 name='yearly',
    #                                 period=365.25,
    #                                 prior_scale=x['params_grid']['seasonality_prior_scale'],
    #                                 fourier_order=13)
    #     model_fit = model.fit(dfgtrain)
        
        # =================================================
        
        with open('models/' + str(x) + '.json', 'r') as fin:
            model = model_from_json(fin.read())  # Load model
        
        # =================================================
        
        future = model.make_future_dataframe(periods=50, freq='W')
        output = model.predict(future)
        predictions=output.loc[size+2:len(dfg),:]['yhat'].values

        print(predictions.shape)
        
        error = mean_squared_error(dfgtest['y'].values, predictions)
        perror = mean_absolute_percentage_error(dfgtest['y'].values, predictions)

        p = predictions.reshape(1, -1)[0]
        pp = []
        for i in range(len(p)):
            pp.append(float(p[i]))
        pp = pp[-8:]

        ppp.append(pp)

    idx = 0
    for x in r:
        rowindex=math.floor(subplotindex/numcols)
        colindex=subplotindex-(rowindex*numcols)
        X=df[x].values
        scaler = MinMaxScaler(feature_range = (0, 1))
        X=scaler.fit_transform(X.reshape(-1, 1))
        X_train,y_train=split_sequence(X[0:size], n_steps)
        X_test,y_test=split_sequence(X[size:len(df)], n_steps)
        X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], n_features))
        
        model = tf.keras.models.load_model('models/' + x + '.keras')
        
        X_test = X_test.reshape((len(X_test), n_steps, n_features))
        predictions = model.predict(X_test, verbose=0)
        y_test=scaler.inverse_transform(y_test)
        predictions = scaler.inverse_transform(predictions)
        error = mean_squared_error(y_test, predictions)
        perror = mean_absolute_percentage_error(y_test, predictions)
        # ax[rowindex,colindex].set_title(x+' (MSE=' + str(round(error,2))+', MAPE='+ str(round(perror,2)) +'%)')
        # ax[rowindex,colindex].legend(['Real', 'Predicted'], loc='upper left')
        # ax[rowindex,colindex].plot(y_test)
        # ax[rowindex,colindex].plot(predictions, color='red')
        # subplotindex=subplotindex+1

        print(predictions.shape)

        p = predictions.reshape(1, -1)[0]
        pp = []
        for i in range(len(p)):
            pp.append(float(p[i]))
        pp = pp[-8:]
        l = y_test.reshape(1, -1)[0]
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

        for i in range(len(pp)):
            pp[i] = 0.4 * pp[i] + 0.6 * ppp[idx][i]

        ret.append({
            'name': x,
            'prediction': {
                'X': date_pp,
                'Y': pp
            },
            'recent_data': {
                'X': date_ll,
                'Y': ll
            }
        })

        idx += 1

    return ret

