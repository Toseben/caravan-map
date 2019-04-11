import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import "leaflet/dist/leaflet.css";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css";
import "leaflet/dist/leaflet.js";
import "esri-leaflet-geocoder/dist/esri-leaflet-geocoder.js";

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
