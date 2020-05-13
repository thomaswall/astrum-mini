import "./index.css"
import React from "react"
import { Router } from "@reach/router"
import ReactDOM from "react-dom"

import Home from "./pages/home"
import About from "./pages/about"
import Email from "./pages/auth/email"
import Confirm from "./pages/auth/confirm"

function App() {
  return (
    <Router>
      <Home path="/" />
      <About path="/about" />
      <Email path="/auth/email" />
      <Confirm path="/auth/confirm"/>
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
