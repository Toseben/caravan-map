import React, { Component } from "react";
import L from "leaflet";
import * as ELG from "esri-leaflet-geocoder";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import Parking from "./Parking";

import Control from "react-leaflet-control";

import "./App.scss";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
});

class App extends Component {
  constructor() {
    super();
    this.state = {
      position: [62.60109, 29.76353],
      radius: 250,
      zoom: 14
    };
  }

  componentDidMount() {
    const _this = this;
    const map = this.leafletMap.leafletElement;
    const searchControl = new ELG.Geosearch().addTo(map);
    const results = new L.LayerGroup().addTo(map);
    
    const overlay = document.querySelector('.loading-overlay')
    searchControl.on("results", data => {
      results.clearLayers();

      // console.log(data.results);
      overlay.style.opacity = 1;

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
    const { position, radius, zoom } = this.state;
    const style = {
      width: "100vw",
      height: "100vh"
    };

    return (
      <div>
        <div className="loading-overlay">
          <p>Loading Results...</p>
        </div>
        <Map
          center={position}
          zoomControl={false}
          minZoom={3}
          maxZoom={19}
          zoom={zoom}
          style={style}
          ref={m => {
            this.leafletMap = m;
          }}
        >
          <ZoomControl position="topright" />
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {/* <Marker position={position}>
          <Popup>
            A pretty CSS3 popup.
            <br />
            Easily customizable.
          </Popup>
        </Marker> */}
          <Parking center={position} radius={radius} />

          {/* <Control position="topleft">
          <button onClick={() => this.setState({ position: [62.60109 + Math.random() * 0.025, 29.76353] })}>
            Reset Position
          </button>
        </Control> */}
        </Map>
      </div>
    );
  }
}

export default App;
