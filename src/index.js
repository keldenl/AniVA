import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import FullStory from 'react-fullstory';
const ORG_ID = 'QYR38'; 

import Main from './Main';
import './styles/index.css';

ReactDOM.render(
  <BrowserRouter>
    <FullStory org={ORG_ID} />
    <Main />
  </BrowserRouter>
  ,
  document.getElementById('root')
);