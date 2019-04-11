import React, { Component } from "react";
import L from "leaflet";
import * as ELG from "esri-leaflet-geocoder";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import Parking from "./Parking";

import Control from "react-leaflet-control";

import "./App.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
});

class App extends Component {
  constructor() {
    super();
    this.state = { position: [62.60109, 29.76353] };
  }

  componentDidMount() {
    const _this = this;
    const map = this.leafletMap.leafletElement;
    const searchControl = new ELG.Geosearch().addTo(map);
    const results = new L.LayerGroup().addTo(map);

    searchControl.on("results", function(data) {
      results.clearLayers();
      for (let i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));

        const coords = data.results[i].latlng;
        _this.setState({
          position: [coords.lat, coords.lng]
        });
      }
    });
  }

  render() {
    const { position } = this.state;
    const radius = 1000;
    const style = {
      width: "100vw",
      height: "100vh"
    };

    return (
      <Map
        center={position}
        zoomControl={false}
        minZoom={3}
        maxZoom={19}
        zoom={14}
        style={style}
        ref={m => {
          this.leafletMap = m;
        }}
      >
        <ZoomControl position="topright" />
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup.
            <br />
            Easily customizable.
          </Popup>
        </Marker>
        <Parking center={position} radius={radius} />

        {/* <Control position="topleft">
          <button onClick={() => this.setState({ position: [62.60109 + Math.random() * 0.025, 29.76353] })}>
            Reset Position
          </button>
        </Control> */}
      </Map>
    );
  }
}

export default App;
