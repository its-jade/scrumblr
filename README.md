# Scrumblr

## Overview

This web app was developed for Cloud Software Development SWE4633.

## Features

- Kanban board with three columns: Not Started, In Progress, Completed
- CRUD and drag-and-drop functionality for tasks
- Cloud-based backend using AWS Lambda and DynamoDB for data persistence and real-time updates

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: AWS Lambda
- **Database**: DynamoDB
- **Hosting**: AWS Amplify
- **Version Control**: GitHub

## Local Development and Frontend Testing
Before deploying, you can test the frontend by running a simple server in your local environment.

  1. In your terminal, navigate to the root directory of your project(main).
  2. Create a file named server.js (it is already created in the main) and add the following code:
  
```javascript
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, 'frontend')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log("Your Kanban board is ready! Use the 'Ports' tab to open it in a browser.");
});
```

  3. Initialize a package.json file and install the express library in the root directory.
  
```
npm init -y
npm install express
```
3. Start the local server

Run:
```
node server.js
```

You should see:

Server is running at http://localhost:
Your Kanban board is ready! Use the 'Ports' tab to open it in a browser.
and test your Kanban board frontend connected to your API!

