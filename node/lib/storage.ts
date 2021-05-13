import { Bucket } from "@aws-cdk/aws-s3";
import { App, StackProps } from "@aws-cdk/core";
import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as sst from "@serverless-stack/resources";

export class Storage extends sst.Stack {
  bucket: Bucket;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, "astrum", {
      cors: [
        {
          maxAge: 3000,
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
        },
      ],
    });

    new cdk.CfnOutput(this, "AttachmentsBucketName", {
      value: this.bucket.bucketName,
    });
  }
}
