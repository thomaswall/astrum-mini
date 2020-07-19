import React from "react"
import { local, sync } from "../data/riptide";
import { RouteComponentProps } from "@reach/router"

import ThreeD from '../components/threed'

export default function Home(props: RouteComponentProps) {
  return <ThreeD />
}
