const React = require('react')
const { useRef, useState, useEffect, useMemo } = React

const L = require('leaflet')
import * as ELG from 'esri-leaflet-geocoder'
const { Map, ZoomControl } = require('react-leaflet')
const Parking = require('./Parking')
require('leaflet.locatecontrol')

require('rc-slider/assets/index.css')
require('rc-tooltip/assets/bootstrap.css')
import Tooltip from 'rc-tooltip'
import Slider from 'rc-slider'
require('./App.scss')

const { setIconSize } = require('./utils/helperFuncs')

const Handle = Slider.Handle
const handle = props => {
  const { value, dragging, index, ...restProps } = props
  return (
    <Tooltip prefixCls="rc-slider-tooltip" overlay={`${value} km`} visible={dragging} placement="top" key={index}>
      <Handle value={value} {...restProps} />
    </Tooltip>
  )
}

const wrapperStyle = {
  borderRadius: 2,
  width: 200,
  margin: 12,
  padding: 20,
  position: 'absolute',
  zIndex: 100000,
  background: 'white'
}

// var osm = L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"),
//   mqi = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.png", {
//     subdomains: ["otile1", "otile2", "otile3", "otile4"]
//   });

// var baseMaps = {
//   OpenStreetMap: osm,
//   MapQuestImagery: mqi
// };

const App = () => {
  const leafletMap = useRef()
  const mapRef = useRef()
  const overlay = useRef()
  const sliderRef = useRef()

  const [position, setPosition] = useState([0, 0])
  const [radius, setRadius] = useState(1000)

  useEffect(() => {
    overlay.current = document.querySelector('.loading-overlay')
  }, [])

  const { style, bounds } = useMemo(() => {
    const style = {
      width: '100vw',
      height: '100vh'
    }

    const bounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180))
    return { style, bounds }
  }, [])

  const onLocationFound = e => {
    setRadius(1000)
    sliderRef.current.state.value = 1
    setPosition([e.latlng.lat, e.latlng.lng])

    setTimeout(() => {
      mapRef.current.userData.lc.stop()
    }, 250)
  }

  const onMapClick = e => {
    setRadius(1000)
    sliderRef.current.state.value = 1
    setPosition([e.latlng.lat, e.latlng.lng])

    setTimeout(() => {
      mapRef.current.setZoom(15)
    }, 250)
  }

  useEffect(() => {
    mapRef.current = leafletMap.current.leafletElement
  }, [leafletMap.current])

  useEffect(() => {
    const searchControl = new ELG.Geosearch().addTo(mapRef.current)
    const results = new L.LayerGroup().addTo(mapRef.current)

    const options = {
      position: 'topleft',
      keepCurrentZoomLevel: false,
      drawCircle: false,
      strings: {
        title: 'Current GPS'
      },
      locateOptions: {
        minZoom: 15,
        maxZoom: 15,
        enableHighAccuracy: true
      }
    }

    mapRef.current.doubleClickZoom.disable() 

    mapRef.current.on('zoomend', setIconSize.bind(this)) 
    mapRef.current.on('dblclick', onMapClick)

    const lc = L.control.locate(options).addTo(mapRef.current)
    mapRef.current.on('locationfound', onLocationFound)
    mapRef.current.userData = { lc }
    // lc.start()

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
    ).addTo(mapRef.current)

    var baseMaps = {
      // OpenStreetMap: osm,
      // googleStreets: googleStreets,
      Map: mapbox,
      Satellite: googleSat,
      'Satellite + Text': googleHybrid,
      // googleTerrain: googleTerrain,
    }

    var overlays = {
      //add any overlays here
    }

    L.control.layers(baseMaps, overlays, { position: 'topleft' }).addTo(mapRef.current)

    searchControl.on('results', data => {
      results.clearLayers()

      // console.log(data.results);
      overlay.current.style.opacity = 1

      for (let i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng))

        const coords = data.results[i].latlng
        setPosition([coords.lat, coords.lng])
      }
    })
  }, [])

  const sliderUpdate = evt => {
    setRadius(evt * 1000)
  }

  return (
    <div>
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Loading Results</p>
      </div>
      <div style={wrapperStyle}>
        <p>Radius Slider</p>
        <Slider ref={sliderRef} min={1} max={10} defaultValue={1} handle={handle} onAfterChange={sliderUpdate} />
      </div>
      <Map
        center={position}
        maxBounds={bounds}
        zoomControl={false}
        minZoom={2}
        maxZoom={19}
        zoom={mapRef.current ? mapRef.current.getZoom() : 2}
        style={style}
        ref={leafletMap}
      >
        <ZoomControl position="topright" />
        <Parking center={position} radius={radius} map={mapRef.current} />
      </Map>
    </div>
  )
}

module.exports = App
