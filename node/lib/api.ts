import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sst from "@serverless-stack/resources";
import { Storage } from "./storage";

type Props = {
  storage: Storage;
};

export function Api(stack: sst.Stack, props: Props) {
  const api = new sst.Api(stack, "Api", {
    routes: {
      "GET /": "src/lambda.handler",
      "POST /update": "src/lambda.update",
      "POST /update_state": {
        function: {
          handler: "src/lambda.updateState",
          timeout: 10,
          environment: { bucketName: props.storage.bucket.bucketName },
          permissions: [props.storage.bucket],
        },
      },
    },
  });

  new cdk.CfnOutput(stack, "ApiEndpoint", {
    value: api.httpApi.apiEndpoint,
  });
}
