import { defineFunction } from "@aws-amplify/backend";

export const scrumblrApi = defineFunction({
  name: "scrumblr-api",
  entry: "./handler.ts",
});
