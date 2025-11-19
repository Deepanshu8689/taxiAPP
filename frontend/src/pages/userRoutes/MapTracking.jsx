import React from 'react'
import { useParams } from 'react-router-dom'
import MapWithRoute from '../commonRoutes/MapWithRoute'
import '../../styles/common/mapWithRoutes.css'

const MapTracking = () => {

  return (
    <div className='map-page'>

        <MapWithRoute/>
      
    </div>
  )
}

export default MapTracking
