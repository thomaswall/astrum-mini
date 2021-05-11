const REST_URL = "https://794h0vk8xk.execute-api.us-east-1.amazonaws.com/"

// === API ==
type ApiSuccess<T = any> = {
  kind: "success"
  status: number
  body: T
}
type ApiFailure<T = any> = {
  kind: "failure"
  status: number
  body: T
}
export type ApiResponse<S, F> = ApiSuccess<S> | ApiFailure<F>
export type ApiGenericError = {
  message: string
}
export async function request<S, F = ApiGenericError>(
  path: string,
  opts: RequestInit,
  body?: any
): Promise<ApiResponse<S, F>> {
  const full = REST_URL + path
  const response = await fetch(full, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
  let data = null
  try {
    const contentType = response.headers.get("content-type")
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json()
    } else {
      data = await response.text()
    }
  } catch (_ex) {}
  if (response.status >= 200 && response.status < 300) {
    console.log(data)
    return {
      kind: "success",
      status: response.status,
      body: data as S,
    }
  }
  return {
    kind: "failure",
    status: response.status,
    body: data as F,
  }
}
