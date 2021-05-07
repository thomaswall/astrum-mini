import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import Redis from "ioredis";
import { Fan } from "./fan";
const client = new Redis(
  "rediss://:0bcda04f9a85438cbd5bbaeb7a79087e@us1-flowing-silkworm-32922.upstash.io:32922"
);

export const handler: APIGatewayProxyHandlerV2 = async (
  _event: APIGatewayProxyEventV2
) => {
  const all_users = await client.keys("*");
  const all_fans = all_users.map((user) => client.get(user));
  const data = await Promise.all(all_fans);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
};

export const update: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  const fan_update: Fan = JSON.parse(event.body || "{}");
  await client.set(fan_update.user, JSON.stringify(fan_update));
  const response = JSON.stringify({ data: "success" });
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: response,
  };
};
