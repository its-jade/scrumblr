import { defineBackend } from "@aws-amplify/backend";
import { data } from "./data/resource";
import { scrumblrApi } from "./scrumblr-api/resource";

defineBackend({
  data,
  scrumblrApi,
});
