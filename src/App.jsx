import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/common/Layout'
import Home from './components/pages/Home'
import Register from './components/pages/Register'
import Login from './components/pages/Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {index: true, element: <Home/>},
      {path: 'register', element: <Register/>},
      {path: 'login', element: <Login/>},
    ]

  }
])

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
