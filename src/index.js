import React from 'react';
import { hydrate, render } from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import Main from './Main';
import './styles/index.css';


const rootElement = document.getElementById("root");
const app = (
  <BrowserRouter>
    <Main />
  </BrowserRouter>
)
// if (rootElement.hasChildNodes()) {
  // hydrate(app, rootElement);
// } else {
  render(app, rootElement);
// }