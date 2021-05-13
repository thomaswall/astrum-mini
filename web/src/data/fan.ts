import { request } from "./api"

export type Fan = {
  position: {
    x: number
    y: number
  }
  power: number
  direction: {
    x: number
    y: number
  }
  user: string
  updated?: number
}

export function fan_write(fan: Fan) {
  return request("/update", { method: "POST" }, fan)
}

export async function query_all() {
  const fans = await request<Fan[]>("/", { method: "GET" })
  return fans.body as Fan[]
}
