import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { Provider } from 'mobx-react';
import DataStore from './store/DataStore';

ReactDOM.render(
  <Provider dataStore={new DataStore()}>
    <App />
    </Provider>,
  document.getElementById('root')
);


