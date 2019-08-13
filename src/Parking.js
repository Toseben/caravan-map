const React = require('react')
const { useRef, useState, useEffect, useMemo } = React
const { GeoJSON } = require('react-leaflet')
const query_overpass = require('query-overpass')

const capitalize = s => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const Parking = ({ ...props }) => {
  const [geoJSON, setGeoJSON] = useState(undefined)
  const prevState = useRef()

  const overlay = useMemo(() => {
    return document.querySelector('.loading-overlay')
  }, [])

  useEffect(() => {
    prevState.current = props
  }, [])

  useEffect(() => {
    let shouldUpdate = false
    if (prevState.current.center !== props.center) shouldUpdate = true
    if (prevState.current.radius !== props.radius) shouldUpdate = true
    if (shouldUpdate) {
      overlay.style.opacity = 1
      updateParkingLocations()
    }
    prevState.current = props
  }, [props])

  const updateParkingLocations = () => {
    const { center, radius } = props

    const query = `[out:json];
    (
      node[amenity=parking](around:${radius}, ${center[0]}, ${center[1]});\
      way[amenity=parking](around:${radius}, ${center[0]}, ${center[1]});\
      relation[amenity=parking](around:${radius}, ${center[0]}, ${center[1]});
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

  return geoJSON ? (
    <GeoJSON
      key={Math.random()}
      data={geoJSON}
      weight={2}
      color="#267FCA"
      fillColor="#267FCA"
      onEachFeature={onEachFeature}
    />
  ) : null
}

module.exports = Parking
