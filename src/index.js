import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import ReactGA from 'react-ga';

import Main from './Main';
import './styles/index.css';


ReactGA.initialize('UA-57882595-2');

ReactDOM.render(
  <BrowserRouter>
    <Main />
  </BrowserRouter>
  ,
  document.getElementById('root')
);
