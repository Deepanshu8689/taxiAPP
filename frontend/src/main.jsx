import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import AuthProvider from './authProvider.jsx'
import appStore from './utils/Redux/appStore.jsx'
import { ToastContainer } from 'react-toastify'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore} >
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position='top-right' autoClose={3000} />
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>,
)
