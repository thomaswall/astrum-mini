import "./index.css"
import React from "react"
import { Router } from "@reach/router"
import ReactDOM from "react-dom"

import Home from "./pages/home"
import About from "./pages/about"

function App() {
  return (
    <Router>
      <Home path="/" />
      <About path="/about" />
    </Router>
  )
}

ReactDOM.render(<App />, document.getElementById("root"))
