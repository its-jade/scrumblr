import { defineBackend } from "@aws-amplify/backend";
import { scrumblrApi } from "./scrumblr-api/resource";

export default defineBackend({
  scrumblrApi,
});
