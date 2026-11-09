import { Outlet } from 'react-router-dom'
import ScrollToTop from './ScrollToTop'

function Layout() {
  return (
    <div>
        <ScrollToTop />
        <Outlet />
    </div>
  )
}

export default Layout
