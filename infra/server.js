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
