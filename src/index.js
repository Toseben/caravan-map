const React = require('react')
const ReactDOM = require('react-dom')
const App = require('./App')
require('./index.css')

require('leaflet/dist/leaflet.css')
require('esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css')
require('leaflet/dist/leaflet.js')
require('esri-leaflet-geocoder/dist/esri-leaflet-geocoder.js')

ReactDOM.render(<App />, document.getElementById('root'))
