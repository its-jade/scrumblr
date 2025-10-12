import { defineBackend } from "@aws-amplify/backend";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { helloFn } from "./scrumblr-api/resource";

const backend = defineBackend({ helloFn });

const apiStack = backend.createStack("api-stack");

const httpApi = new HttpApi(apiStack, "ScrumblrHttpApi", {
  apiName: "scrumblr-api",
  corsPreflight: {
    allowMethods: [CorsHttpMethod.GET],
    allowOrigins: ["*"],
    allowHeaders: ["*"],
  },
});

httpApi.addRoutes({
  path: "/hello",
  methods: [HttpMethod.GET],
  integration: new HttpLambdaIntegration(
    "HelloIntegration",
    backend.helloFn.resources.lambda
  ),
});

backend.addOutput({
  custom: {
    API: {
      "scrumblr-api": {
        endpoint: httpApi.url,
      },
    },
  },
});

export default backend;
