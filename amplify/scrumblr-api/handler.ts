import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  console.log("event", event);
  return {
    statusCode: 200,
    headers: {
      // relax for now so you can test from your static site
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
    },
    body: "hello from scrumblr 👋",
  };
};
