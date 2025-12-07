import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

const REGION = process.env.REGION;
const TABLE_NAME = process.env.TABLE_NAME;
const BOARD_ID = "p1";

const client = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Incoming event:", JSON.stringify(event));

  const method =
    (event.httpMethod && event.httpMethod.toUpperCase()) ||
    (event.requestContext?.http?.method &&
      event.requestContext.http.method.toUpperCase()) ||
    "GET";

  console.log("Resolved method:", method);

  if (method === "OPTIONS") {
    return buildResponse(200, {});
  }

  if (method !== "GET") {
    return buildResponse(405, {
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const result = await ddb.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "boardID = :b",
        ExpressionAttributeValues: { ":b": BOARD_ID },
      })
    );

    const tasks = (result.Items || []).map((item) => ({
      id: item.taskID,
      title: item.title,
      assignee: item.assignee,
      dueDate: item.dueDate,
      status: item.status,
    }));

    const scrumblr = {
      projects: [
        {
          project_id: BOARD_ID,
          title: "SWE Group Project",
          due_date: "12-14-2025",
          goals: "finish the project!",
        },
      ],
      users: [
        { user_id: "u1", name: "Meriam" },
        { user_id: "u2", name: "Dawson" },
        { user_id: "u3", name: "Jade" },
        { user_id: "u4", name: "Henry" },
        { user_id: "u5", name: "Keith" },
      ],
      tasks,
    };

    return buildResponse(200, { success: true, mockData: scrumblr });
  } catch (err) {
    console.error("Error:", err);
    return buildResponse(500, { success: false, error: err.message });
  }
};

function buildResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(bodyObj),
  };
}
