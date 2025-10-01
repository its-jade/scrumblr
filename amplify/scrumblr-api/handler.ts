export const handler = async (event: any) => {
  console.log("Event:", event);
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "this is scrumblr-api (test)" }),
  };
};
