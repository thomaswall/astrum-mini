import * as sst from "@serverless-stack/resources";
import { Api } from "./api";
import { Storage } from "./storage";

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props);

    const storage = new Storage(scope, "astrum");
    Api(this, { storage });

    // Show API endpoint in output
  }
}
