import React from "react";
import { GeoJSON, Marker } from "react-leaflet";
const query_overpass = require("query-overpass");

export default class Castles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      geojson: undefined
    };
  }

  componentDidMount() {
    this.updateParkingLocations();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.center !== this.props.center) {
      this.updateParkingLocations();
    }
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
      this.setState({ geojson: osmData });
    }
  }

  render() {
    return this.state.geojson ? <GeoJSON key={Math.random()} data={this.state.geojson} /> : null;
  }
}
