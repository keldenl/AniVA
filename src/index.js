import React from 'react';
import ReactGA from 'react-ga';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom'

import Main from './Main';
import './styles/index.css';


ReactGA.initialize('UA-57882595-2');
ReactGA.pageview(window.location.pathname + window.location.search);

const rootElement = document.getElementById("root");
const app = (
  <HashRouter>
    <Main />
  </HashRouter>
)
// if (rootElement.hasChildNodes()) {
// hydrate(app, rootElement);
// } else {
render(app, rootElement);
// }