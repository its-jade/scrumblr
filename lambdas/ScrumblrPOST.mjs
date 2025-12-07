import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

const REGION = process.env.REGION;
const TABLE_NAME = process.env.TABLE_NAME;
const BOARD_ID = "p1";

const client = new DynamoDBClient({ region: REGION });
const ddb = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log("Incoming POST event:", JSON.stringify(event));

  try {
    const isDelete =
      event.delete === true ||
      event.delete === "true" ||
      event.action === "delete";

    if (isDelete) {
      const taskID = event.id;
      if (!taskID) {
        return buildResponse(400, {
          success: false,
          message: "Task id is required for delete",
        });
      }

      await ddb.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            boardID: BOARD_ID,
            taskID,
          },
        })
      );

      return buildResponse(200, { success: true });
    }

    const title = event.title || "Untitled task";
    const assignee = event.assignee || "";
    const dueDate = event.dueDate || "";
    const status = event.status || "Not Started";

    const taskID = event.id || `t-${Date.now()}`;

    const item = {
      boardID: BOARD_ID,
      taskID,
      title,
      assignee,
      dueDate,
      status,
    };

    await ddb.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    const task = {
      id: taskID,
      title,
      assignee,
      dueDate,
      status,
    };

    return buildResponse(201, { success: true, task });
  } catch (err) {
    console.error("Error in ScrumblrPOST:", err);
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
