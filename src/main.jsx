import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Import Ant Design styles
import 'antd/dist/reset.css' // If this import doesn't work, try using the line below instead
// import 'antd/dist/antd.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
