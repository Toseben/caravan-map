import React, { Component } from "react";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import Parking from "./Parking";

// import './App.css';

class App extends Component {
  render() {
    const radius = 1000;
    const position = [62.60109, 29.76353];
    const style = {
      width: "100vw",
      height: "100vh"
    };

    return (
      <Map center={position} minZoom={3} maxZoom={19} zoom={14} style={style}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={position}>
          <Popup>
            A pretty CSS3 popup.
            <br />
            Easily customizable.
          </Popup>
        </Marker>
        <Parking center={position} radius={radius} />
      </Map>
    );
  }
}

export default App;
