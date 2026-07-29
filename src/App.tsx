import { BrowserRouter } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AppRoutes from './routes/AppRoutes'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main>
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
