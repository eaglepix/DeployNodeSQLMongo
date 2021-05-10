""" QM - Select Stock Pick Chart 1.2
QM2.41 base Last Modified 5/5/2021
Using Yahoo Finance as companyName / price history download
Using bz2 and pickle to database download
Convert whole module to functions
"""
import sys
import io
import base64
import numpy as np
import pandas as pd
import datetime
from os import walk
import pickle
import bz2
import yfinance as yf

import matplotlib.pyplot as plt
from matplotlib.ticker import MaxNLocator
from matplotlib.ticker import ScalarFormatter
from matplotlib import ticker
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
from PIL import Image
from pandas.plotting import register_matplotlib_converters
register_matplotlib_converters()

# Global constants:
# listLibrary- keys: 'Title list to run', values: [library_list_name, subpath]
listLibrary = {'InterMkt_CrossAsset': 'QMom_InvestableRestricted', 'ETF':'ETF_list',  #ETF_list not done up yet
               'SPX500':'sp500_components', 'Nasdaq100':'nasdaq100_components',
               'HK_largeCaps':'HK_Hshares_TopList', 'SG_largeCaps':'SGX_TopList', 
               'ChinaADR':'ChinaADR_TopList', 'HK_ShanghaiConnect':'ShanghaiConnect_TopList',
               'HK_ShenzhenConnect':'ShenzhenConnect_TopList', 'ASX_All_Ordinaries': 'ASX_AllOrds',
               'ASX200': 'ASX_AllOrds200','TOPIX600':'TOPIX600','ADRs_Top300':'ADRs_Top300',
               'Europe600':'STOXX600',
               'HK_China_Connect':['HK_ShanghaiConnect','HK_ShenzhenConnect'],
               'SPX+NQ': ['SPX500','Nasdaq100'], 'SPX+NQ+ChinaADR': ['SPX500','Nasdaq100','ChinaADR'],
               'HK+ChinaADR':['HK_largeCaps', 'ChinaADR'],
               'HK+CH+ADR':['HK_largeCaps','HK_ShanghaiConnect','HK_ShenzhenConnect','ChinaADR'], 
               'All_shares':'',   }

BM_index_list = ['^GSPC','^DJI','^IXIC','^HSI','^HSCE','000001.SS','399001.SZ','3188.HK','^STI','^AORD','^N225','^STOXX']
sub_path = ['Stock_price','ETF_price','Indices_price','Commodities_price','Currencies_price']
filepath = r'C:\Users\KL\Documents\Python_files\Systems\Yahoo'
ticker_library_path = r'C:\Users\KL\Documents\Python_files\Systems\Ticker_Library'
fileSavePath = r'C:\Users\kl\Documents\Python_files\Systems\Output\Quant_Mom_indvStk'
fileStr1 = r'C:\Users\kl\Documents\Python_files\Systems\Output\Quant_Momentum\top_momentum_list_'

run_list_universe ={'SG':[8,5],'HK':[4,4],'CH':[4,17],'US':[0,15],'AU':[9,9],'JP':[10,11],'EU':[11,13],'ADR':[2,12]}

SG_HoldingList = ['U11.SI','CNNU.SI','C2PU.SI','BTOU.SI','CMOU.SI','N2IU.SI','BXE.SI','UD1U.SI',
                'Z74.SI','F13.SI','UD2.SI','S63.SI','Q5T.SI','O5RU.SI','C6L.SI' ]
# EU_HoldingList = []
HK_HoldingList = ['9988.HK','0700.HK','3690.HK','241.HK','1833.HK','6060.HK']
holdingList={'SG':SG_HoldingList,'HK':HK_HoldingList}

year, period, model = str(2021), 'W', str(4)
# Simple Moving Average line (days):
SMA=200

####################################################################################################

def rename_col(df):
    if 'Trading Name' in df.columns:
        df.rename(columns={'Trading Name':'Name'}, inplace=True)
    elif 'Company' in df.columns:
        df.rename(columns={'Company':'Name'}, inplace=True)
    elif 'Stock Name' in df.columns:
        df.rename(columns={'Stock Name':'Name'}, inplace=True)
    return df

def downloadTickerNameLocal(run_list, list_directory):
    if run_list =='All_shares':
        _, _, filenames = next(walk(filepath+'\\'+list_directory+'\\'))
        # Note if run 'All Shares' here, won't be able to obtain the company names later
        # filenames include .csv
    elif run_list in ['SPX+NQ','SPX+NQ+ChinaADR','HK+ChinaADR','HK+CH+ADR','HK_China_Connect']:
        # combine libraries
        filenames =[]
        df_list = pd.DataFrame([], columns=['Symbol','Name'])
        while listLibrary[run_list]!=[]:
            lib = listLibrary[run_list].pop()
            print(lib)
            df_list1 = pd.read_csv(ticker_library_path+'\\'+listLibrary[lib]+'.csv')
            df_list1 = rename_col(df_list1)
            df_list = pd.concat([df_list,df_list1[['Symbol','Name']]])
            filenames = filenames+list(df_list['Symbol']+'.csv')
            filenames=list(set(filenames))  #remove duplicates

    else:
        df_list = pd.read_csv(ticker_library_path+'\\'+listLibrary[run_list]+'.csv')
        df_list = rename_col(df_list)   # Rename those libraries with different column names
        filenames = df_list['Symbol']+'.csv'

    df_list_symbol = df_list[['Symbol','Name']].set_index('Symbol').to_dict()
    print('Total stock universe:', len(filenames))
    return df_list, df_list_symbol

def convertPlot2PNG(fig):
    # Doesn't work
    # Convert plot to PNG image
    pngImage = io.BytesIO()
    FigureCanvas(fig).print_png(pngImage)
    
    # Encode PNG image to base64 string
    pngImageB64String = "data:image/png;base64,"
    pngImageB64String += base64.b64encode(pngImage.getvalue()).decode('utf8')
    return pngImageB64String

def fig_to_base64(fig):
    # Doesn't work
    img = io.BytesIO()
    fig.savefig(img, format='png', bbox_inches='tight')
    img.seek(0)
    return base64.b64encode(img.read())

def fig_to_base64a(fig):
    # Doesn't work
    img = io.BytesIO()
    fig.savefig(img, format='png', bbox_inches='tight')
    img = base64.b64encode(img.getvalue()).decode("utf-8").replace("\n", "")

    return '<img align="left" src="data:image/png;base64,%img">' % img


####################################################################################################
"""PROBE: Getting a particular stock entire history rank
    get_stk_history_rank : modified 6/5/21"""

def get_stk_history_rank(ticker,df_top_momentum_names,run_list,df_list,list_directory,df_list_symbol,runOnline):
    df_chart_period = pd.DataFrame([])
    ranking_history = {}
    try:
        ranking_history[ticker] = [[i,list(df_top_momentum_names.loc[i,:]).index(ticker)] if ticker in \
                                   list(df_top_momentum_names.loc[i,:]) else [i,np.nan] for i in df_top_momentum_names.index]
        df_ticker_plot = pd.DataFrame(ranking_history[ticker])
        
        # Run online to retrieve ticker name and historical prices:
        if runOnline=='Y': # yfinance
            yfTickerObj = yf.Ticker(ticker)
            tickerName = yfTickerObj.info['shortName']

            chartPeriodStart = df_top_momentum_names.index[0]
            chartPeriodEnd = df_top_momentum_names.index[-1]
            df_chart = yf.download(ticker, start=chartPeriodStart, end=chartPeriodEnd)
            df_chart.dropna(inplace=True)
        else:
            # Run offline
            if run_list=='InterMkt_CrossAsset':
                df_chart = pd.read_csv(filepath+'\\'+df_list['sub_Path'][df_list['Symbol']==ticker].values[0] \
                                    +'\\'+ticker+'.csv',  parse_dates=True, index_col='Date')
            else:
                df_chart = pd.read_csv(filepath+'\\'+list_directory+'\\'+ticker+'.csv', parse_dates=True, index_col='Date')
                tickerName = df_list_symbol['Name'][ticker]

    except FileNotFoundError:
        print('Wrong ticker or the Stock {} is not found in the database'.format(ticker))
        print('Exiting program')
        raise
        sys.exit(1)

    try:
        df_chart_period['Adj Close']= df_chart['Adj Close'][df_top_momentum_names.index[0]:]
        df_chart_period['AdjClose_MA']= df_chart['Adj Close'].rolling(SMA).mean()[df_top_momentum_names.index[0]:]
        print(df_chart_period.info(), df_chart_period[['Adj Close','AdjClose_MA']].tail())
        #Masking with colors:
        cUpper = np.ma.masked_where(df_chart_period['Adj Close'][df_top_momentum_names.index[0]:].values < df_chart_period['AdjClose_MA'][df_top_momentum_names.index[0]:].values, 
                                    df_chart_period['Adj Close'][df_top_momentum_names.index[0]:].values)
        cLower = np.ma.masked_where(df_chart_period['Adj Close'][df_top_momentum_names.index[0]:].values > df_chart_period['AdjClose_MA'][df_top_momentum_names.index[0]:].values, 
                                    df_chart_period['Adj Close'][df_top_momentum_names.index[0]:].values)

        fig, ax = plt.subplots(figsize=(16,10))
        ax.plot(df_chart_period['Adj Close'][df_top_momentum_names.index[0]:],c='grey',label=ticker+'(Neutral)',zorder=4)
        ax.plot(df_chart_period['Adj Close'][df_top_momentum_names.index[0]:].index,cUpper,c='b',label=ticker+'(Buy)',zorder=5)
        ax.plot(df_chart_period['Adj Close'][df_top_momentum_names.index[0]:].index,cLower,c='r',label=ticker+'(Sell)',zorder=5)

        ax.plot(df_chart_period['AdjClose_MA'][df_top_momentum_names.index[0]:], c='b',alpha=0.5,ls='-.',label='SMA'+str(SMA),zorder=3)
        ax.legend(loc='upper left', bbox_to_anchor=(0, 0.95), facecolor='white')
    except:
        print('Ticker {} error in plotting price chart'.format(ticker))
        
        
    try:
        ax2=ax.twinx()
        ax2.yaxis.set_major_locator(MaxNLocator(integer=True))
        ax2.semilogy()
        ax2.yaxis.set_ticks([1,2,5,10,20,50,100,500,1000,(df_ticker_plot[1]+1).max()])
        ax2.yaxis.set_major_formatter(ScalarFormatter())  #  '%.1f'
        ax2.plot(df_ticker_plot[0], df_ticker_plot[1]+1, c='orange', alpha=1, label='Rank',linewidth=2,zorder=2)
        ax2.xaxis.set_major_locator(MaxNLocator(6))
        ax2.set_ylim(len(df_top_momentum_names.columns)+1,1)   #Inverse y-axis
        ax2.axhline(20, c='grey')
        ax2.legend(loc=2)
        ax.set_title(tickerName, fontsize=11, loc='center', pad=1)

    except (ValueError, KeyError) as e:
        print('Ticker {} not found in the ranking list or error in plotting RS chart'.format(ticker))
        

    for i in df_chart_period.index:
        if df_chart_period.loc[i]['Adj Close'] > df_chart_period.loc[i]['AdjClose_MA']:
            ax2.axvspan(i, i+datetime.timedelta(weeks=1),ymin=0.85,ymax=1,facecolor='b',alpha=0.1,zorder=0)

    for j in df_ticker_plot.index:
        if df_ticker_plot.loc[j,1] < 20:
            ax2.axvspan(df_ticker_plot.loc[j,0], df_ticker_plot.loc[j,0]+datetime.timedelta(weeks=1),ymin=0.9,ymax=1,facecolor='y',alpha=0.5,zorder=1)

    ##############
    # plt.show()
    ##############
    # imagePNG =convertPlot2PNG(fig)

    # with open(fileSavePath+'\\fig_image', "wb") as fh:
    #     fh.write(fig_to_base64a(fig))
        # fh.write(base64.decodestring(imagePNG))
        # fh.write(imagePNG.decode('base64'))
    ##############
    # encoded = fig_to_base64(fig)
    # my_html = '<img src="data:image/png;base64, {}">'.format(encoded.decode('utf-8'))


    ##############

    figSave = fileSavePath+'\\'+'TM_cht_'+ticker
    # fileType2save = input('Save file into 1).jpg, 2).png or not to save (n)? ')
    fileType2save='2'
    if fileType2save=='1':
        # Using fig[0] here, somehow it changed into a tuple with 2
        fig.savefig(figSave+'.jpg')
    elif fileType2save=='2':
        # Using fig[0] here, somehow it changed into a tuple with 2
        fig.savefig(figSave+'.png')
    elif fileType2save=='n':
        pass
    
    return (figSave+'.png')

###############################################################################
def main(runOnline,market2run,selectList,response):
    # Input Panel
    # runOnline = input('Running this online [default: Local offline] (Y/N)?').upper()
    # market2run = input(f'Select a market to run {run_list_universe.keys()}:').upper()
    runOnline = runOnline.upper()
    market2run = market2run.upper()
    run_list_lib ={market2run: run_list_universe[market2run]}
    BM_index_num, run_list_num = run_list_lib[market2run][0], run_list_lib[market2run][1]

    BM_index = BM_index_list[BM_index_num]
    listOflistLibrary = list(listLibrary.keys())
    run_list = listOflistLibrary[run_list_num]

    print(run_list_lib, run_list, BM_index)
    fileStr2 = run_list+year+period+model

    if run_list=='ETF':
        list_directory = sub_path[1]
    else: 
        list_directory = sub_path[0]
    print('list_directory',list_directory)

    if runOnline!='Y':
        df_list, df_list_symbol = downloadTickerNameLocal(run_list, list_directory)
    else:
        # If run online to abstract ticker from yfinance, no need to get ticker name
        df_list, df_list_symbol = [],[]

    # Decompressing top_momentum_model .pbz2 & convert to pickle:
    data = bz2.BZ2File(fileStr1+fileStr2+'.pbz2', 'rb')
    df_top_momentum_names = pickle.load(data)

    response = ''
    # selectList=input('Select a ticker or a list to run: {}'.format(holdingList.keys())).upper()
    selectList = selectList.upper()
    if selectList not in holdingList.keys():
        ticker = selectList
        filelink = get_stk_history_rank(ticker,df_top_momentum_names,run_list,df_list,list_directory,df_list_symbol,runOnline)
        # response=input('Please key in next ticker to continue, "Q" or <Enter> to quit : ').upper()
        response=response.upper()
        # while response not in ['Q','']:
        #     ticker = response
        #     filelink = get_stk_history_rank(ticker,df_top_momentum_names,run_list,df_list,list_directory,df_list_symbol,runOnline)
        #     response=input('Please key in next ticker to continue, "Q" or <Enter> to quit : ').upper()
        print('Quitting, thanks for using!')
        if __name__!='__main__':
            exit()
        
    else:
        for i in holdingList[selectList]:    
            ticker = i
            filelink = get_stk_history_rank(ticker,df_top_momentum_names,run_list,df_list,list_directory,df_list_symbol,runOnline)
            # response=input('<Enter> to continue next name, other keys to quit : ')
            # if response=='':
            #     continue
            # else: 
            #     print('Ends!')
            #     break
            if i==SG_HoldingList[-1]:
                print('End of list!')

    return filelink
    
if __name__=='__main__':
    runOnline,market2run,selectList,response = 'n','US','EXX','q'
    filelink = main(runOnline,market2run,selectList,response)
    print(filelink)
    # img = Image.open(filelink)
    # img.show()

