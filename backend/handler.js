// This file contains the backend logic for interacting with DynamoDB.
// It is designed to be deployed as an AWS Lambda function,
// handling API Gateway requests from the frontend.

// Import necessary clients and commands from the AWS SDK v3
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
    DynamoDBDocumentClient,
    PutCommand,
    QueryCommand,
    UpdateCommand,
    DeleteCommand
} = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Configure the DynamoDB client and document client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = "ScrumblrTasks";

/**
 * Handles incoming API requests and routes them to the appropriate function
 * based on the HTTP method and path.
 *
 * @param {object} event The API Gateway event object.
 * @returns {object} The API Gateway proxy response object.
 */
exports.handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));

        const { httpMethod, path, body, pathParameters } = event;
        let responseBody;
        let statusCode = 200;

        // --- Routing API Requests ---
        if (httpMethod === 'GET' && path === '/tasks') {
            responseBody = await getAllTasks();
        } else if (httpMethod === 'POST' && path === '/tasks') {
            const task = JSON.parse(body);
            responseBody = await createTask(task);
        } else if (httpMethod === 'PUT' && path.startsWith('/tasks/')) {
            const { taskId } = pathParameters;
            const updates = JSON.parse(body);
            responseBody = await updateTask(taskId, updates);
        } else if (httpMethod === 'DELETE' && path.startsWith('/tasks/')) {
            const { taskId } = pathParameters;
            responseBody = await deleteTask(taskId);
        } else {
            throw new Error(`Unsupported route: "${httpMethod} ${path}"`);
        }

        return {
            statusCode: statusCode,
            body: JSON.stringify(responseBody),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // CORS for frontend requests
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };

    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal Server Error', error: error.message }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };
    }
};

/**
 * Creates a new task in the DynamoDB table.
 *
 * @param {object} task The task data from the frontend.
 * @returns {object} The newly created task item.
 */
async function createTask(task) {
    const { title, assignee, dueDate } = task;
    const item = {
        boardID: "Group1Project", // Static board ID for MVP
        taskID: uuidv4(),
        title,
        assignee,
        dueDate,
        status: "Not Started", // Default status
    };
    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };
    await docClient.send(new PutCommand(params));
    return item;
}

/**
 * Retrieves all tasks for the static 'Group1Project' board.
 *
 * @returns {Array} A list of task items.
 */
async function getAllTasks() {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: "boardID = :boardId",
        ExpressionAttributeValues: {
            ":boardId": "Group1Project",
        },
    };
    const result = await docClient.send(new QueryCommand(params));
    return result.Items;
}

/**
 * Updates an existing task's status or other attributes.
 *
 * @param {string} taskId The unique ID of the task to update.
 * @param {object} updates An object containing the attributes to update (e.g., { status: 'In Progress' }).
 * @returns {object} The updated task item.
 */
async function updateTask(taskId, updates) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'boardID': "Group1Project",
            'taskID': taskId
        },
        UpdateExpression: 'SET #s = :newStatus',
        ExpressionAttributeNames: {
            '#s': 'status',
        },
        ExpressionAttributeValues: {
            ':newStatus': updates.status,
        },
        ReturnValues: 'ALL_NEW'
    };
    const result = await docClient.send(new UpdateCommand(params));
    return result.Attributes;
}

/**
 * Deletes a task from the DynamoDB table.
 *
 * @param {string} taskId The unique ID of the task to delete.
 * @returns {object} A success message.
 */
async function deleteTask(taskId) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'boardID': "Group1Project",
            'taskID': taskId
        },
    };
    await docClient.send(new DeleteCommand(params));
    return { message: 'Task deleted successfully.' };
}
