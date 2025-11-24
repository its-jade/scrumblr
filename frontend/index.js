document.addEventListener("DOMContentLoaded", () => {
  // lists
  const StartList = document.getElementById("start-list");
  const ProgressList = document.getElementById("progress-list");
  const CompleteList = document.getElementById("completed-list");
  const dropArea = document.getElementById("drop-area");
  const linksDiv = document.getElementById("links");
  // simple in-memory store
  let tasks = [];

  // map list element ids to status strings
  const columnMap = {
    "start-list": "Not Started",
    "progress-list": "In Progress",
    "completed-list": "Completed"
  };

  // ---------- helpers ----------
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function createCardElement(task) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.id = task.id;

    card.innerHTML = `
      <h3 class="title">${escapeHtml(task.title)}</h3>
      <p class="due-date">Due: ${escapeHtml(task.dueDate)}</p>
      <p class="assignee">${escapeHtml(task.assignee)}</p>
      <div class="card-controls" style="display:flex;gap:0.5rem;margin-top:0.5rem;">
        <button class="edit-btn" title="Edit">✏️</button>
        <button class="delete-btn" title="Delete">🗑️</button>
      </div>
    `;

    // delete handler
    card.querySelector(".delete-btn").addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      card.remove();
    });

    // edit handler (simple prompts)
    card.querySelector(".edit-btn").addEventListener("click", () => {
      const newTitle = prompt("Edit title:", task.title);
      if (newTitle === null) return;
      const newAssignee = prompt("Edit assignee:", task.assignee);
      if (newAssignee === null) return;
      const newDue = prompt("Edit due date (YYYY-MM-DD):", task.dueDate);
      if (newDue === null) return;

      task.title = newTitle;
      task.assignee = newAssignee;
      task.dueDate = newDue;

      // update DOM
      card.querySelector(".title").textContent = task.title;
      card.querySelector(".due-date").textContent = "Due: " + task.dueDate;
      card.querySelector(".assignee").textContent = task.assignee;
    });

    return card;
  }
//drag and drop fileslambda
  

dropArea.addEventListener("dragover", (e) => e.preventDefault());
dropArea.addEventListener("drop", async (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];
  if (!file) return;

  // 1. Request signed URLs from Lambda
  const res = await fetch("https://wvi0tdqdrk.execute-api.us-east-2.amazonaws.com/scrumblr1/project/files", {
    method: "POST",
    body: JSON.stringify({ filename: file.name, fileType: file.type }),
  });

  const { uploadUrl, downloadUrl } = await res.json();

  // 2. Upload the file directly to S3
  await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  // 3. Show download link
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.textContent = `Download ${file.name}`;
  link.target = "_blank";
  linksDiv.appendChild(link);
  linksDiv.appendChild(document.createElement("br"));
});
  function addTaskToBoard(task) {
    const targetListId = Object.keys(columnMap).find(k => columnMap[k] === task.status) || "start-list";
    const list = document.getElementById(targetListId);
    const card = createCardElement(task);
    list.appendChild(card);
  }

  // ---------- DRAG & DROP ----------
  function setupSortable(listEl) {
    new Sortable(listEl, {
      group: "shared",
      animation: 150,
      onEnd: (evt) => {
        const taskId = evt.item.dataset.id;
        const newStatus = columnMap[evt.to.id];
        const task = tasks.find(t => t.id === taskId);
        if (task) task.status = newStatus;
      }
    });
  }

  setupSortable(StartList);
  setupSortable(ProgressList);
  setupSortable(CompleteList);

  // ---------- CREATE TASK ----------
  document.querySelectorAll(".add-task-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const title = prompt("Task title:");
      if (!title) return alert("Task title is required.");
      const assignee = prompt("Assignee (name):");
      if (!assignee) return alert("Assignee is required.");
      const dueDate = prompt("Due date (YYYY-MM-DD):");
      if (!dueDate) return alert("Due date is required.");

      let parentColumn = btn.closest(".column");
      let listEl = parentColumn ? parentColumn.querySelector(".list") : document.getElementById("start-list");
      let listId = listEl ? listEl.id : "start-list";
      const status = columnMap[listId] || "Not Started";

      const newTask = {
        id: Date.now().toString(), // simple unique id
        title,
        assignee,
        dueDate,
        status
      };

      tasks.push(newTask);
      addTaskToBoard(newTask);
    });
  });
});
