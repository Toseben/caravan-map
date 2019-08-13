const setIconSize = e => {
  const zoomLevel = e.target.getZoom()
  const x = Math.max(zoomLevel - 5, 0) * 4
  const y = Math.max(zoomLevel - 5, 0) * 4

  const iconElements = document.getElementsByClassName('leaflet-marker-icon')

  for (let i = 0; i < iconElements.length; i++) {
    iconElements[i].style.width = Math.round(x) + 'px'
    iconElements[i].style.height = Math.round(y) + 'px'

    iconElements[i].style['margin-left'] = -Math.round(y * 0.5) + 'px'
    iconElements[i].style['margin-top'] = -Math.round(y) + 'px'
  }
}

module.exports = {
  setIconSize
}
