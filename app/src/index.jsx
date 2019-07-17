import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import store from './store'
import {BrowserRouter as Router} from "react-router-dom";
import App from './components/App/App';
import * as serviceWorker from './serviceWorker';
import "font-awesome/css/font-awesome.min.css"
import "bootstrap/dist/css/bootstrap.css";
import "material-design-icons/iconfont/material-icons.css";
import "vazir-font/dist/font-face.css";
import './index.scss'
import "moment/locale/fa";

render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>
  , document.getElementById('root'));

serviceWorker.register();
