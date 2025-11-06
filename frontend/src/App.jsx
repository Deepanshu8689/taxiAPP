
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
import AdminDashboard from './pages/AdminDashboard'
import RideComplete from './pages/RideComplete'
import HomePage from './pages/HomePage'

function App() {

  return (
    <>
      <Provider store={appStore}>

        <Routes>

          <Route path='/' element={<HomePage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/ride-request' element={<RideRequest />} />
          <Route path='/searching-ride' element={<SearchingRide />} />
          <Route path='/ride-tracking' element={<RideTracking />} />
          <Route path='/driver-homepage' element={<DriverPage />} />
          <Route path='/driver-dashboard' element={<DriverDashboard />} />
          <Route path='/admin-dashboard' element={<AdminDashboard />} />
          <Route path='/ride-complete/:rideId' element={<RideComplete />} />
          {/* </Route> */}

        </Routes>

      </Provider>
    </>
  )
}

export default App
