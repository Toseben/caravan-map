const React = require('react')
const { useRef, useState, useEffect, useMemo } = React
const { GeoJSON, Circle } = require('react-leaflet')
const query_overpass = require('query-overpass')
const L = require('leaflet')

const capitalize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const Amenity = ({ ...props }) => {
  const [geoJSON, setGeoJSON] = useState(undefined)
  const prevState = useRef()

  const overlay = useMemo(() => {
    return document.querySelector('.loading-overlay')
  }, [])

  const myIcon = useMemo(() => {
    const zoom = props.map ? props.map.getZoom() : 0
    const x = Math.max(zoom - 12, 0) * 6
    const y = Math.max(zoom - 12, 0) * 6

    const icon = L.icon({
      iconUrl: './assets/circle.png',
      iconSize: [x, y],
      shadowSize: [0, 0],
      iconAnchor: [x * 0.5, y * 0.5],
      popupAnchor: [0, -x]
    })

    return icon
  })

  useEffect(() => {
    prevState.current = props
  }, [])

  useEffect(() => {
    let shouldUpdate = false
    if (prevState.current.amenity !== props.amenity) shouldUpdate = true
    if (prevState.current.center !== props.center) shouldUpdate = true
    if (prevState.current.radius !== props.radius) shouldUpdate = true
    if (shouldUpdate) {
      overlay.style.opacity = 1
      updateAmenityLocations()
    }
    prevState.current = props
  }, [props])

  const updateAmenityLocations = () => {
    const { amenity, center, radius } = props

    const query = `[out:json];
    (
      node[amenity=${amenity}](around:${radius}, ${center[0]}, ${center[1]});\
      way[amenity=${amenity}](around:${radius}, ${center[0]}, ${center[1]});\
      relation[amenity=${amenity}](around:${radius}, ${center[0]}, ${center[1]});
    );\
    out body;>;out skel qt;`

    const options = { flatProperties: true, overpassUrl: 'https://overpass-api.de/api/interpreter' }
    query_overpass(query, dataHandler, options)
  }

  const dataHandler = (error, osmData) => {
    if (!error && osmData.features !== undefined) {
      overlay.style.opacity = 0
      setGeoJSON(osmData)
    }
  }

  const onEachFeature = (feature, layer) => {
    const keys = Object.keys(feature.properties)
    const values = Object.values(feature.properties)

    let propertiesText = ''
    keys.forEach((x, id) => {
      if (x === 'id') return
      const y = values[id]

      let key = x.replace(/_/g, ' ')
      let value = y.replace(/_/g, ' ')

      key = capitalize(key)
      value = capitalize(value)

      propertiesText += `<p>${key}: ${value}</p>`
    })

    if (feature.properties) {
      layer.bindPopup(propertiesText)
    }
  }

  const campingMarker = (geoJsonPoint, latlng) => {
    return L.marker(latlng, { icon: myIcon })
  }

  return geoJSON ? (
    <div>
      <Circle
        center={{ lat: props.center[0], lng: props.center[1] }}
        weight={1}
        opacity={1}
        color="#337ac7"
        dashArray="6, 12"
        fillColor="#337ac7"
        fillOpacity={0.25}
        radius={props.radius}
      />
      <GeoJSON
        key={Math.random()}
        data={geoJSON}
        smoothFactor={0}
        weight={1}
        opacity={0.67}
        color="#000000"
        fillColor="#C7594C"
        fillOpacity={0.67}
        onEachFeature={onEachFeature}
        pointToLayer={campingMarker}
      />
    </div>
  ) : null
}

module.exports = Amenity
