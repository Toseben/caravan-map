import React from "react";
import { GeoJSON, Marker } from "react-leaflet";
const query_overpass = require("query-overpass");

const capitalize = s => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default class Castles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geojson: undefined
    };
  }

  componentDidMount() {
    this.updateParkingLocations();
    this.overlay = document.querySelector(".loading-overlay");
  }

  componentDidUpdate(prevProps) {
    let shouldUpdate = false;

    if (prevProps.center !== this.props.center) shouldUpdate = true;
    if (prevProps.radius !== this.props.radius) shouldUpdate = true;
    if (shouldUpdate) this.updateParkingLocations();
  }

  updateParkingLocations() {
    const { center, radius } = this.props;

    const query = `[out:json];
    (
      node[amenity=parking](around:${radius}, ${center[0]}, ${center[1]});\
      way[amenity=parking](around:${radius}, ${center[0]}, ${center[1]});\
      relation[amenity=parking](around:${radius}, ${center[0]}, ${center[1]});
    );\
    out body;>;out skel qt;`;

    const options = { flatProperties: true };

    query_overpass(query, this.dataHandler.bind(this), options);
  }

  dataHandler(error, osmData) {
    if (!error && osmData.features !== undefined) {
      this.overlay.style.opacity = 0;
      this.setState({ geojson: osmData });
    }
  }

  onEachFeature(feature, layer) {
    const keys = Object.keys(feature.properties);
    const values = Object.values(feature.properties);

    let propertiesText = "";
    keys.forEach((x, id) => {
      if (x === "id") return;
      const y = values[id];

      let key = x.replace(/_/g, " ");
      let value = y.replace(/_/g, " ");

      key = capitalize(key);
      value = capitalize(value);

      propertiesText += `<p>${key}: ${value}</p>`;
    });

    if (feature.properties) {
      layer.bindPopup(propertiesText);
    }
  }

  render() {
    return this.state.geojson ? (
      <GeoJSON
        key={Math.random()}
        data={this.state.geojson}
        weight={2}
        color="red"
        fillColor="red"
        onEachFeature={this.onEachFeature}
      />
    ) : null;
  }
}
