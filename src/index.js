import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import Main from './Main';
import './styles/index.css';


const rootElement = document.getElementById("root");

ReactDOM.render(<BrowserRouter>
  <Main />
</BrowserRouter>, rootElement);