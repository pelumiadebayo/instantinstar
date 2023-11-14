import Home from "@/pages"
import { Nav, PrivateRoute } from "../Nav"
Home
const Layout=({ children })=> {
  return (
    <>
        <Nav/>
        {/* <PrivateRoute exact path="/" component={Home} /> */}
        {children}
    </>
  )
}
export default Layout