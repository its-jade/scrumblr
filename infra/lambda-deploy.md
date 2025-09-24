# AWS Lambda & DynamoDB Deployment Guide

This document provides a step-by-step guide for deploying the **Scrumblr backend**.  
It covers the creation of the DynamoDB table, the AWS Lambda function, and the API Gateway.

---

## Prerequisites

- An active AWS account  
- AWS CLI configured on your local machine  
- `handler.js` and `package.json` set up in the `backend/` directory  
- Run `npm install` in the `backend/` directory to install dependencies  

---

## Step 1: Create the DynamoDB Table

Follow the schema defined in [DynamoDB_Schema.md](./DynamoDB_Schema.md) to create a new table.

1. Log in to the **AWS Management Console**  
2. Navigate to **DynamoDB** service  
3. Click **Create table**  
4. Set:  
   - **Table name:** `ScrumblrTasks`  
   - **Partition key:** `boardID` *(String)*  
   - **Sort key:** `taskID` *(String)*  
5. Leave the remaining settings as default  
6. Click **Create table**  

---

## Step 2: Create an IAM Role for Lambda

Your Lambda function needs permissions to access DynamoDB.

1. Navigate to the **IAM** service  
2. Go to **Roles** → **Create role**  
3. Select **AWS service** → **Lambda**  
4. Click **Next**  
5. Attach policy: `AmazonDynamoDBFullAccess`  
6. Click **Next**, give the role a descriptive name (e.g., `ScrumblrDynamoDBLambdaRole`), then **Create role**  

---

## Step 3: Create the Lambda Function

1. Navigate to the **Lambda** service  
2. Click **Create function**  
3. Choose **Author from scratch**  
4. Set:  
   - **Function name:** `ScrumblrKanbanHandler`  
   - **Runtime:** `Node.js`  
5. Under *Execution role*, choose **Use an existing role** → select `ScrumblrDynamoDBLambdaRole`  
6. Click **Create function**  

---

## Step 4: Package and Upload the Code

1. In your terminal, go to the `backend/` directory  
2. Create a zip file with your code:  
3. In the Lambda console, open your function
4. Go to the Code tab → Upload from → .zip file
5. Upload lambda-code.zip

Your Lambda function is now ready to execute your code.
   ```bash
   zip -r lambda-code.zip handler.js node_modules/
   ```
## Step 5: Configure the API Gateway

API Gateway provides a REST endpoint for your Lambda function.

1. Navigate to **API Gateway**  
2. Click **Create API** → choose **REST API** (not private) → **Build**  
3. Name it `ScrumblrAPI` → **Create API**  

---

### Create Resources and Methods

1. In the left pane, select **Resources**  
2. From **Actions** → **Create Resource**  
   - **Resource Name:** `tasks` → **Create Resource**  

#### Methods for `/tasks`
- With `/tasks` selected:  
  - **POST** → Integration: Lambda Function → `ScrumblrKanbanHandler`  
  - **GET** → Integration: Lambda Function → `ScrumblrKanbanHandler`  

#### Methods for `/tasks/{taskId}`
1. With `/tasks` selected → **Actions** → **Create Resource**  
   - **Resource Name:** `{taskId}` → **Create Resource**  
2. With `{taskId}` selected:  
   - **PUT** → Integration: Lambda Function → `ScrumblrKanbanHandler`  
   - **DELETE** → Integration: Lambda Function → `ScrumblrKanbanHandler`  

---

### Deploy API

1. From **Actions** → **Deploy API**  
2. Create a new stage: `prod` → **Deploy**  
3. Copy the generated **Invoke URL** → this will be your **`API_URL`**  

---

## Step 6: Update Frontend URL

1. Open your `index.js` file in the frontend  
2. Find:  

   ```javascript
   const API_URL = "https://your-api-gateway-id.execute-api.region.amazonaws.com/prod";
   
3. Replace the placeholder with your actual Invoke URL from API Gateway

#  Deployment Complete!

Your Scrumblr Kanban board is now a full-stack application with:

- DynamoDB backend

- AWS Lambda serverless functions

- API Gateway REST endpoints

- Frontend connected to the backend
