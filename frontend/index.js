document.addEventListener("DOMContentLoaded", () => {
  // --- EDITABLE FIELDS ---
  const projectTitleEl = document.getElementById("project-title");
  const projectDueDateEl = document.getElementById("project-due-date");
  const goalsContentEl = document.getElementById("goals-content");

  // Project Title
  projectTitleEl.addEventListener("blur", function () {
    console.log("Project title updated to:", this.textContent);
  });
  projectTitleEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      this.blur();
      e.preventDefault();
    }
  });

  // Due Date
  projectDueDateEl.addEventListener("blur", function () {
    console.log("Due date updated to:", this.textContent);
  });
  projectDueDateEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      this.blur();
      e.preventDefault();
    }
  });

  // Goals
  goalsContentEl.addEventListener("blur", function () {
    console.log("Goals updated to:", this.textContent);
  });
  goalsContentEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      this.blur();
      e.preventDefault();
    }
  });

  // --- API CONFIGURATION ---
  const API_BASE_URL =
    "https://9qxlkugsih.execute-api.us-east-2.amazonaws.com/prod";

  // change this later
  const UPLOAD_API_URL =
    "https://93ia49japf.execute-api.us-west-2.amazonaws.com/default";

  // --- LOAD DATA FROM API ---
  async function loadScrumblrData() {
    try {
      const response = await fetch(`${API_BASE_URL}/scrumblr`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (data.success && data.mockData) {
        const scrumblr = data.mockData;

        // project info
        if (scrumblr.projects && scrumblr.projects.length > 0) {
          const project = scrumblr.projects[0];
          projectTitleEl.textContent = project.title || "Scrumblr Board";
          projectDueDateEl.textContent = project.due_date
            ? `DUE DATE ${project.due_date}`
            : "DUE DATE TBD";
          goalsContentEl.textContent = project.goals || "No goals defined";
        }

        // team members
        if (scrumblr.users && scrumblr.users.length > 0) {
          const membersUl = document.getElementById("members-list");
          membersUl.innerHTML = "";
          scrumblr.users.forEach((user) => {
            addMemberToTeam(user.name, user.user_id);
          });
        }

        // tasks
        if (scrumblr.tasks && scrumblr.tasks.length > 0) {
          // clear existing cards
          StartList.innerHTML = "";
          ProgressList.innerHTML = "";
          CompleteList.innerHTML = "";

          tasks = [];

          scrumblr.tasks.forEach((task) => {
            tasks.push(task);
            addTaskToBoard(task);
          });
        }
      }
    } catch (error) {
      console.error("Error loading Scrumblr ", error);
    }
  }

  // --- MEMBER MANAGEMENT ---
  function addMemberToTeam(memberName, memberId = null) {
    const membersUl = document.getElementById("members-list");
    const memberItem = document.createElement("li");
    memberItem.className = "member-item";
    memberItem.dataset.memberId = memberId || Date.now().toString();

    memberItem.innerHTML = `
      <span class="member-name">${escapeHtml(memberName)}</span>
      <div class="member-controls">
        <button class="member-edit-btn" title="Edit">✏️</button>
        <button class="member-delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    memberItem
      .querySelector(".member-edit-btn")
      .addEventListener("click", () => {
        const currentName =
          memberItem.querySelector(".member-name").textContent;
        const newName = prompt("Edit member name:", currentName);
        if (newName !== null && newName.trim() !== "") {
          memberItem.querySelector(".member-name").textContent = newName.trim();
        }
      });

    memberItem
      .querySelector(".member-delete-btn")
      .addEventListener("click", () => {
        const memberName = memberItem.querySelector(".member-name").textContent;
        if (
          confirm(`Are you sure you want to delete member "${memberName}"?`)
        ) {
          memberItem.remove();
        }
      });

    membersUl.appendChild(memberItem);
  }

  document.getElementById("add-member-btn").addEventListener("click", () => {
    const memberName = prompt("Enter new member name:");
    if (memberName !== null && memberName.trim() !== "") {
      addMemberToTeam(memberName.trim());
    }
  });

  // --- FILE UPLOAD ---
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("file-input");
  const linksDiv = document.getElementById("links");

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    dropArea.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });

  function highlight() {
    dropArea.style.backgroundColor = "#f0f9ff";
  }

  function unhighlight() {
    dropArea.style.backgroundColor = "";
  }

  dropArea.addEventListener("drop", handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length) {
      handleFileUpload(files[0]);
    }
  }

  dropArea.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length) {
      handleFileUpload(e.target.files[0]);
      e.target.value = "";
    }
  });

  async function handleFileUpload(file) {
    try {
      const uploadResponse = await fetch(`${UPLOAD_API_URL}/scrumbl-upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, fileType: file.type }),
      });

      if (!uploadResponse.ok)
        throw new Error(`Upload API error: ${uploadResponse.status}`);

      const uploadData = await uploadResponse.json();
      if (!uploadData.uploadUrl || !uploadData.downloadUrl) {
        throw new Error("Invalid upload response from server");
      }

      const s3Response = await fetch(uploadData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!s3Response.ok)
        throw new Error(`S3 upload error: ${s3Response.status}`);

      const link = document.createElement("a");
      link.href = uploadData.downloadUrl;
      link.textContent = `📥 Download ${file.name}`;
      link.target = "_blank";
      linksDiv.appendChild(link);
    } catch (error) {
      console.error("File upload failed:", error);
      alert(`File upload failed: ${error.message}`);
    }
  }

  // --- TASK MANAGEMENT ---
  const StartList = document.getElementById("start-list");
  const ProgressList = document.getElementById("progress-list");
  const CompleteList = document.getElementById("completed-list");
  let tasks = [];

  const columnMap = {
    "start-list": "Not Started",
    "progress-list": "In Progress",
    "completed-list": "Completed",
  };

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, "&quot;");
  }

  function createCardElement(task) {
    const card = document.createElement("div");
    card.className = "task-card";
    card.dataset.id = task.id;

    const dueText =
      task.dueDate && task.dueDate.trim() !== "" ? task.dueDate : "TBD";

    card.innerHTML = `
      <h3 class="title">${escapeHtml(task.title)}</h3>
      <p class="due-date">Due: ${escapeHtml(dueText)}</p>
      <p class="assignee">${escapeHtml(task.assignee)}</p>
      <div class="card-controls">
        <button class="edit-btn" title="Edit">✏️</button>
        <button class="delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    card.querySelector(".delete-btn").addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
        tasks = tasks.filter((t) => t.id !== task.id);
        card.remove();
      }
    });

    card.querySelector(".edit-btn").addEventListener("click", () => {
      const newTitle = prompt("Edit title:", task.title);
      if (newTitle === null) return;
      const newAssignee = prompt("Edit assignee:", task.assignee);
      if (newAssignee === null) return;
      const newDue = prompt("Edit due date (MM-DD-YYYY):", task.dueDate);
      if (newDue === null) return;

      task.title = newTitle;
      task.assignee = newAssignee;
      task.dueDate = newDue;

      card.querySelector(".title").textContent = task.title;
      card.querySelector(".due-date").textContent = "Due: " + task.dueDate;
      card.querySelector(".assignee").textContent = task.assignee;
    });

    return card;
  }

  function addTaskToBoard(task) {
    const targetListId =
      Object.keys(columnMap).find((k) => columnMap[k] === task.status) ||
      "start-list";
    const list = document.getElementById(targetListId);
    const card = createCardElement(task);
    list.appendChild(card);
  }

  function setupSortable(listEl) {
    new Sortable(listEl, {
      group: "shared",
      animation: 150,
      onEnd: (evt) => {
        const taskId = evt.item.dataset.id;
        const newStatus = columnMap[evt.to.id];
        const task = tasks.find((t) => t.id === taskId);
        if (task) task.status = newStatus;
      },
    });
  }

  setupSortable(StartList);
  setupSortable(ProgressList);
  setupSortable(CompleteList);

  document.querySelectorAll(".btn-add-task").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const title = prompt("Task title:");
      if (!title) return alert("Task title is required.");
      const assignee = prompt("Assignee (name):");
      if (!assignee) return alert("Assignee is required.");
      const dueDate = prompt("Due date (MM-DD-YYYY):");
      if (!dueDate) return alert("Due date is required.");

      const parentColumn = btn.closest(".column");
      const listEl = parentColumn
        ? parentColumn.querySelector(".task-list")
        : document.getElementById("start-list");
      const listId = listEl ? listEl.id : "start-list";
      const status = columnMap[listId] || "Not Started";

      const newTask = { title, assignee, dueDate, status };

      try {
        const savedTask = await createTaskViaApi(newTask); // gets { id, ... } from Lambda
        tasks.push(savedTask);
        addTaskToBoard(savedTask);
      } catch (err) {
        console.error("Failed to create task:", err);
        alert("Could not save task. Please try again.");
      }
    });
  });

  // --- INITIALIZE APP ---
  loadScrumblrData();

  // create task via API
  async function createTaskViaApi(task) {
    const response = await fetch(`${API_BASE_URL}/scrumblr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      throw new Error(`API error ${response.status}`);
    }

    const data = await response.json();
    if (!data.success || !data.task) {
      throw new Error("Invalid API response");
    }

    return data.task; // { id, title, assignee, dueDate, status }
  }
});
