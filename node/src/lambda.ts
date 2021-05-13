import { APIGatewayProxyEventV2, APIGatewayProxyHandlerV2 } from "aws-lambda";
import Redis from "ioredis";
import { Fan } from "./fan";
import * as aws from "aws-sdk";

const s3 = new aws.S3();

const client = new Redis();

export const handler: APIGatewayProxyHandlerV2 = async (
  _event: APIGatewayProxyEventV2
) => {
  const all_users = await client.keys("*");
  const all_fans = all_users.map((user) =>
    client
      .get(user)
      .then((res) => (res ? JSON.parse(res) : null))
      .then((res) => {
        if (res && Date.now() - (res.last_updated || 0) > 5000) return null;
        return res;
      })
  );
  const data = await Promise.all(all_fans).then((res) =>
    res.filter((fan) => fan)
  );
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
  fan_update.last_updated = Date.now();
  await client.set(fan_update.user, JSON.stringify(fan_update));
  const response = JSON.stringify({ data: "success" });
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: response,
  };
};

export const updateState: APIGatewayProxyHandlerV2 = async (
  event: APIGatewayProxyEventV2
) => {
  const params = {
    Bucket: process.env.bucketName || "",
    Key: "test",
    Body: JSON.stringify({ hi: "there" }),
  };
  await s3.upload(params).promise();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: "hi",
  };
};
