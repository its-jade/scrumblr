// This file contains the API client functions for the Scrumblr frontend.
// It handles all communication with the backend API endpoints.

// IMPORTANT: Replace this with your actual API Gateway endpoint URL.
// Example: const API_URL = 'https://abcdefg123.execute-api.us-east-1.amazonaws.com/dev/tasks';
const API_URL = "YOUR_API_GATEWAY_URL_HERE";

/**
 * Fetches all tasks from the backend.
 * @returns {Promise<Array>} A promise that resolves with an array of task objects.
 */
export async function getAllTasks() {
    try {
        const response = await fetch(`${API_URL}/tasks`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const tasks = await response.json();
        return tasks;
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return [];
    }
}

/**
 * Creates a new task in the database.
 * @param {object} taskData The data for the new task (title, assignee, dueDate).
 * @returns {Promise<object>} A promise that resolves with the new task object.
 */
export async function createTask(taskData) {
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const newTask = await response.json();
        return newTask;
    } catch (error) {
        console.error("Error creating task:", error);
        return null;
    }
}

/**
 * Updates a task's status in the database.
 * @param {string} taskId The unique ID of the task to update.
 * @param {string} newStatus The new status for the task ("Not Started", "In Progress", or "Completed").
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error("Error updating task:", error);
        return false;
    }
}

/**
 * Deletes a task from the database.
 * @param {string} taskId The unique ID of the task to delete.
 * @returns {Promise<boolean>} A promise that resolves to true on success, false on failure.
 */
export async function deleteTask(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return true;
    } catch (error) {
        console.error("Error deleting task:", error);
        return false;
    }
}
