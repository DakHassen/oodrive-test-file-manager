import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import createSagaMiddleware from 'redux-saga';
import { createStore,applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import rootReducer from './reducers';

import rootSaga from './actions/saga';

const initialState = {customAsyncData:""};
const sagaMiddleware = createSagaMiddleware();
const store = createStore(rootReducer,initialState,applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);
ReactDOM.render(
  <React.StrictMode>
    <Provider store={store} > <App /></Provider>

  </React.StrictMode>,
  document.getElementById('root')
);


