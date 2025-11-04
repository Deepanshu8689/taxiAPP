
import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import RideRequest from './pages/RideRequest'
import SearchingRide from './pages/SearchingRide'
import { useState } from 'react'
import DriverPage from './pages/DriverPage'
import RideTracking from './pages/RideTracking'
import DriverDashboard from './pages/DriverDashboard'
import { Provider } from 'react-redux'
import appStore from './utils/appStore'

function App() {

  return (
    <>
      <Provider store={appStore}>
        <BrowserRouter basename='/'>

        <Routes>

          <Route path='/login' element={<Login />} >
            <Route path='/ride-request' element={<RideRequest />} />
            <Route path='/searching-ride' element={<SearchingRide/>} />
            <Route path='/ride-tracking' element={<RideTracking/>} />
            <Route path='/driver-homepage' element={<DriverPage />} />
            <Route path='/driver-dashboard' element={<DriverDashboard/>} />
          </Route>

        </Routes>
        </BrowserRouter>

      </Provider>
    </>
  )
}

export default App
