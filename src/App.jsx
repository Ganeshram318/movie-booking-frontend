import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/common/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Home from './components/pages/Home'
import Register from './components/pages/Register'
import Login from './components/pages/Login'
import MovieDetails from './components/pages/MovieDetails'
import Showtimes from './components/pages/Showtimes'
import SeatSelection from './components/pages/SeatSelection'
import Payment from './components/pages/Payment'
import AdminAddMovie from './components/pages/AdminAddMovie'
import AdminMovieList from './components/pages/AdminMovieList'
import AdminEditMovie from './components/pages/AdminEditMovie'
import AdminAddTheatre from './components/pages/AdminAddTheatre'
import AdminTheatreList from './components/pages/AdminTheatreList'
import AdminEditTheatre from './components/pages/AdminEditTheatre'
import AdminShowtimeList from './components/pages/AdminShowtimeList'
import AdminAddShowtime from './components/pages/AdminAddShowtime'
import AdminEditShowtime from './components/pages/AdminEditShowtime'
import BookingConfirmation from './components/pages/BookingConfirmation'
import MyBookings from './components/pages/MyBookings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {index: true, element: <Home/>},
      {path: 'register', element: <Register/>},
      {path: 'login', element: <Login/>},
      {path: 'movie/:id', element: <MovieDetails/>},
      {path: 'movie/:id/showtimes', element: <Showtimes/>},
      {path: 'movie/:id/showtimes/:showId/seats', element: <SeatSelection/>},
      {path: 'payment', element: <ProtectedRoute requireAdmin={false}><Payment/></ProtectedRoute>},
      {path: 'bookings', element: <ProtectedRoute requireAdmin={false}><MyBookings/></ProtectedRoute>},
      {path: 'bookings/:bookingId', element: <ProtectedRoute requireAdmin={false}><BookingConfirmation/></ProtectedRoute>},
      {path: 'admin/add-movie', element: <ProtectedRoute><AdminAddMovie/></ProtectedRoute>},
      {path: 'admin/movies', element: <ProtectedRoute><AdminMovieList/></ProtectedRoute>},
      {path: 'admin/edit-movie/:id', element: <ProtectedRoute><AdminEditMovie/></ProtectedRoute>},
      {path: 'admin/theatres', element: <ProtectedRoute><AdminTheatreList/></ProtectedRoute>},
      {path: 'admin/theatres/add', element: <ProtectedRoute><AdminAddTheatre/></ProtectedRoute>},
      {path: 'admin/theatres/edit/:id', element: <ProtectedRoute><AdminEditTheatre/></ProtectedRoute>},
      {path: 'admin/showtimes', element: <ProtectedRoute><AdminShowtimeList/></ProtectedRoute>},
      {path: 'admin/showtimes/add', element: <ProtectedRoute><AdminAddShowtime/></ProtectedRoute>},
      {path: 'admin/showtimes/edit/:id', element: <ProtectedRoute><AdminEditShowtime/></ProtectedRoute>},
    ]

  }
])

function App() {

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastContainer position="top-right" autoClose={4000} newestOnTop />
      </AuthProvider>
    </>
  )
}

export default App
