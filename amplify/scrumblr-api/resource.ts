import { defineFunction } from "@aws-amplify/backend";

export const helloFn = defineFunction({
  name: "scrumblr-api",
  entry: "./handler.ts",
});
