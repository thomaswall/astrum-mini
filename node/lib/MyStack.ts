import * as sst from "@serverless-stack/resources";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    // Create the HTTP API
    const api = new sst.Api(this, "Api", {
      routes: {
        "GET /": "src/lambda.handler",
        "POST /update": "src/lambda.update",
      },
    });

    // Show API endpoint in output
    this.addOutputs({
      ApiEndpoint: api.httpApi.apiEndpoint,
    });
  }
}
