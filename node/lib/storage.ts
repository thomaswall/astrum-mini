import { BucketEncryption, BlockPublicAccess, Bucket } from "@aws-cdk/aws-s3";
import { App, StackProps, PhysicalName } from "@aws-cdk/core";
import * as sst from "@serverless-stack/resources";

export class Storage extends sst.Stack {
  readonly bucket: Bucket;

  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    this.bucket = new Bucket(this, "astrum", {
      versioned: true,
      bucketName: PhysicalName.GENERATE_IF_NEEDED,
      encryption: BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });
  }
}
