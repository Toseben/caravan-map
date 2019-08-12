import React, { Component } from "react";
import L from "leaflet";
import * as ELG from "esri-leaflet-geocoder";
import { Map, Marker, Popup, TileLayer, ZoomControl } from "react-leaflet";
import Parking from "./Parking";

import Control from "react-leaflet-control";
import 'leaflet.locatecontrol'

import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import Tooltip from "rc-tooltip";
import Slider from "rc-slider";

import "./App.scss";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.4.0/dist/images/marker-shadow.png"
});

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Handle = Slider.Handle;

const handle = props => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip prefixCls="rc-slider-tooltip" overlay={`${value} km`} visible={dragging} placement="top" key={index}>
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const wrapperStyle = {
  borderRadius: 2,
  width: 200,
  margin: 12,
  padding: 20,
  position: "absolute",
  zIndex: 100000,
  background: "white"
};

// var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
//   mqi = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png", {
//     subdomains: ["otile1", "otile2", "otile3", "otile4"]
//   });

// var baseMaps = {
//   OpenStreetMap: osm,
//   MapQuestImagery: mqi
// };

class App extends Component {
  constructor() {
    super()
    this.state = {
      position: [62.60109, 29.76353],
      radius: 1000,
      zoom: 14
    }
  }

  onLocationFound(e) {
    this.setState({
      position: [e.latlng.lat, e.latlng.lng]
    })
  }

  componentDidMount() {
    const _this = this
    const map = this.leafletMap.leafletElement
    const searchControl = new ELG.Geosearch().addTo(map)
    const results = new L.LayerGroup().addTo(map)

    const options = { position: 'bottomleft', keepCurrentZoomLevel: true, drawCircle: false }
    // L.control.locate(options).addTo(map)
    map.on('locationfound', this.onLocationFound.bind(this))

    // map.locate({ setView: true })
    // const coords = map.getBounds().getCenter()

    var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    var googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    var googleTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    })

    var mapbox = L.tileLayer(
      'https://api.mapbox.com/styles/v1/koskela/cjtrsbnea19oi1fml31vhshyz/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoia29za2VsYSIsImEiOiJjam8xdGdrcG8wZHp4M3FueG1nbmkwM3F5In0.kW7JMFvLZS1KPALMcjGa0Q',
      {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      }
    ).addTo(map)

    var baseMaps = {
      // OpenStreetMap: osm,
      // googleStreets: googleStreets,
      // googleHybrid: googleHybrid,
      Satellite: googleSat,
      // googleTerrain: googleTerrain,
      Styled: mapbox
    }

    var overlays = {
      //add any overlays here
    }

    L.control.layers(baseMaps, overlays, { position: 'topleft' }).addTo(map)

    this.overlay = document.querySelector('.loading-overlay')
    searchControl.on('results', data => {
      results.clearLayers()

      // console.log(data.results);
      _this.overlay.style.opacity = 1

      for (let i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng))

        const coords = data.results[i].latlng
        _this.setState({
          position: [coords.lat, coords.lng]
        })
      }
    })
  }

  sliderUpdate(evt) {
    this.setState({ radius: evt * 1000 })
    this.overlay.style.opacity = 1
  }

  render() {
    const { position, radius, zoom } = this.state
    const style = {
      width: '100vw',
      height: '100vh'
    }

    return (
      <div>
        <div className="loading-overlay">
          <p>Loading Results...</p>
        </div>
        <div style={wrapperStyle}>
          <p>Radius Slider</p>
          <Slider min={1} max={10} defaultValue={1} handle={handle} onAfterChange={this.sliderUpdate.bind(this)} />
        </div>
        <Map
          center={position}
          zoomControl={false}
          minZoom={3}
          maxZoom={19}
          zoom={zoom}
          style={style}
          ref={m => {
            this.leafletMap = m
          }}
        >
          <ZoomControl position="topright" />
          {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
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
    )
  }
}

export default App;
