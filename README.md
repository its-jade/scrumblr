# Scrumblr

## Overview

This web application is a Kanban-style task board built for **Cloud Software Development SWE4633** during the Fall 2025 semester. This project demonstrates full cloud integration using AWS services, including serverless REST APIs, DynamoDB, S3 hosting, and document upload via S3 presigned URLs..

## Features

- **Kanban board** with three columns:
  - Not Started
  - In Progress
  - Completed
- **CRUD operations** for tasks (create, read, update, delete)
- **Drag-and-drop functionality** to move tasks between columns
- **Cloud backend** using:
  - AWS Lambda for serverless functions
  - API Gateway REST endpoints for task management
  - DynamoDB for data storage
- **File upload** support using S3 presigned URLs
- **Real-time persistence** of tasks via serverless API calls

## Technologies Used

- **Frontend**: Static site hosted on **AWS S3** using HTML, CSS, JavaScript
- **Backend**(serverless): **AWS Lambda** functions for CRUD operations exposed via **API Gateway**
- **Database**: **DynamoDB** stores tasks with attributes like ID, title, description, status, and timestamps
- **File Storage**: **AWS S3** for storing uploaded documents using presigned URLs
- **Version Control**: GitHub
