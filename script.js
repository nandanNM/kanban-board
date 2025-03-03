// Constants selectors
const SELECTORS = {
  addItemButtons: ".add-item-button",
  boards: ".board",
  tasks: ".task",
  boardAddButton: "#board-add-button",
  draggingTask: ".dragging",
  tasksContainer: ".tasks",
  boardDeleteButton: "#board-delete-button",
  boardEditButton: "#board-edit-button",
  deleteTaskButton: ".delete-task-button",
  editTaskButton: ".edit-task-button",
  taskStatus: ".task-status",
  taskDate: "#taskdate",
};

// DOM Elements
const addItemButtons = document.querySelectorAll(SELECTORS.addItemButtons);
const boards = document.querySelectorAll(SELECTORS.boards);
const allTasks = document.querySelectorAll(SELECTORS.tasks);
const boardAddButton = document.getElementById("board-add-button");
const allTasksEditButtons = document.querySelectorAll(SELECTORS.editTaskButton);
const allTasksDeleteButtons = document.querySelectorAll(
  SELECTORS.deleteTaskButton
);

// Initialize App
function initializeApp() {
  loadSavedBoards();
  setupEventListeners();
  updateState();
}

function updateState() {
  document.querySelectorAll(SELECTORS.boards).forEach(updateTaskCount);
  localStorageManager.saveBoards();
}
function loadSavedBoards() {
  const savedBoardsData = localStorage.getItem(localStorageManager.STORAGE_KEY);
  const container = document.querySelector(".container");
  // console.log("board data", savedBoardsData);
  if (savedBoardsData) {
    // SON data first before checking the length, or check if the data exists at all.
    if (JSON.parse(savedBoardsData).length === 0) return;
    const existingBoards = document.querySelectorAll(SELECTORS.boards);
    // console.log("board data", existingBoards);
    existingBoards.forEach((board) => board.remove());
    JSON.parse(savedBoardsData).forEach((boardData) => {
      // console.log("board data", boardData);
      const boardElement = BoardManager.createBoard(
        boardData.title,
        boardData.description,
        boardData.color
      );
      // add task to the bord
      boardData.tasks.forEach((taskData) => {
        const date = formattedDate(taskData.id);
        const taskElement = TaskManager.createTask(
          taskData.title,
          taskData.color
        );
        // console.log(date);
        // console.log(taskData.id);
        const taskDateElement = taskElement.querySelector(".task-date");
        // console.log("taskDateElement", taskDateElement);
        if (taskDateElement) {
          taskDateElement.textContent = date;
        }
        taskElement.dataset.taskId = taskData.id;
        taskElement.querySelector(".task-status-text").textContent =
          taskData.status;

        // console.log("what this is", taskElement.querySelector("#taskdate"));
        boardElement.querySelector(".tasks").appendChild(taskElement);
      });
      container.insertBefore(boardElement, boardAddButton);
      // Add event listener to the "Add a Task" button for this board
      const addButton = boardElement.querySelector(".add-item-button");
      if (addButton) {
        addButton.addEventListener("click", handleAddItem);
      }
    });
  }
}

// Event Listener Setup
function setupEventListeners() {
  addItemButtons.forEach((button) =>
    button.addEventListener("click", handleAddItem)
  );
  allTasks.forEach((task) => attachDragEvents(task));
  setupBoardListeners();
  if (boardAddButton) {
    boardAddButton.addEventListener("click", handleAddBoard);
  }
  allTasksDeleteButtons.forEach((button) =>
    button.addEventListener("click", handleDeleteTask)
  );
  allTasksEditButtons.forEach((button) => {
    button.addEventListener("click", handleEditTask);
  });
}

function setupBoardListeners() {
  boards.forEach((board) => {
    board.addEventListener("dragover", handleDragOver);
    const deleteButton = board.querySelector(SELECTORS.boardDeleteButton);
    const editButton = board.querySelector(SELECTORS.boardEditButton);
    if (deleteButton) {
      deleteButton.addEventListener("click", handleDeleteBoard);
    }
    if (editButton) {
      editButton.addEventListener("click", handleUpdateBoard);
    }
  });
}

// Task Management
const TaskManager = {
  createTask(taskText, color) {
    const taskElement = createTaskElement(taskText, color);
    this.attachDragEvents(taskElement);
    this.attachTaskEvents(taskElement);
    return taskElement;
  },

  attachDragEvents(taskElement) {
    taskElement.addEventListener("dragstart", () =>
      taskElement.classList.add("dragging")
    );
    taskElement.addEventListener("dragend", () =>
      taskElement.classList.remove("dragging")
    );
  },

  attachTaskEvents(taskElement) {
    const deleteButton = taskElement.querySelector(".delete-task-button");
    const editTaskButton = taskElement.querySelector(SELECTORS.editTaskButton);
    if (deleteButton) {
      deleteButton.addEventListener("click", handleDeleteTask);
    }
    if (editTaskButton) {
      editTaskButton.addEventListener("click", handleEditTask);
    }
  },
};

// Board Management
const BoardManager = {
  createBoard(title, description, color) {
    const boardElement = createBoardElement(title, description, color);
    this.setupNewBoard(boardElement);
    return boardElement;
  },

  setupNewBoard(boardElement) {
    boardElement.addEventListener("dragover", handleDragOver);
    const deleteButton = boardElement.querySelector(
      SELECTORS.boardDeleteButton
    );
    const updateBoardButton = boardElement.querySelector(
      SELECTORS.boardEditButton
    );
    // console.log(updateBoardButton);
    if (updateBoardButton) {
      updateBoardButton.addEventListener("click", handleUpdateBoard);
    }
    if (deleteButton) {
      deleteButton.addEventListener("click", handleDeleteBoard);
    }
  },
};

// Event Handlers
function handleAddItem(event) {
  const column = event.target.closest(".column");
  const taskText = prompt("Enter task name");
  const color = prompt("Enter color name");

  if (taskText) {
    const taskElement = TaskManager.createTask(taskText, color);
    column.querySelector(SELECTORS.tasksContainer).appendChild(taskElement);
    updateState();
  } else {
    alert("Please enter a task name.");
  }
}
function handleDeleteTask(event) {
  event.target.closest(".task").remove();
  updateState();
}
function handleEditTask(event) {
  const taskElement = event.target.closest(".task");
  const taskTitle = taskElement.querySelector(".task-title");
  const taskColor = taskElement.querySelector(".task-status");
  const inputText = prompt("Enter your modify task", taskTitle.textContent);
  const inputColor = prompt(
    "Modify you color",
    taskColor.style.backgroundColor
  );
  console.log("input", inputColor, inputText);
  if (inputText) {
    taskTitle.innerText = inputText;
  }
  if (inputColor) {
    taskColor.style.backgroundColor = inputColor;
  }
  localStorageManager.saveBoards();
}

function handleDragOver(event) {
  event.preventDefault();
  const draggingElement = document.querySelector(SELECTORS.draggingTask);
  const boardElement = event.currentTarget;
  const tasksContainer = boardElement.querySelector(SELECTORS.tasksContainer);

  // Remove drag-over class from all boards and task containers
  document.querySelectorAll(SELECTORS.boards).forEach((board) => {
    board.classList.remove("drag-over");
    board.querySelector(SELECTORS.tasksContainer).classList.remove("drag-over");
  });

  // Add drag-over class to current board and its task container
  boardElement.classList.add("drag-over");
  tasksContainer.classList.add("drag-over");

  const bottomTask = insertAboveTask(boardElement, event.clientY);
  if (bottomTask) {
    tasksContainer.insertBefore(draggingElement, bottomTask);
  } else {
    tasksContainer.appendChild(draggingElement);
  }
  updateState();
}

function handleAddBoard() {
  const boardDetails = {
    title: prompt("Enter board title"),
    description: prompt("Enter board description"),
    color: prompt("Enter board color"),
  };
  if (Object.values(boardDetails).every((value) => value)) {
    const boardElement = BoardManager.createBoard(
      boardDetails.title,
      boardDetails.description,
      boardDetails.color
    );
    document
      .querySelector(".container")
      .insertBefore(boardElement, boardAddButton);
  } else {
    alert("Please fill in all board details.");
  }
}
function handleUpdateBoard(event) {
  // console.log("i am hare");
  const boardElement = event.target.closest(".board");
  const title = boardElement.querySelector(".column-title");
  const description = boardElement.querySelector(".column-description");
  const color = boardElement.querySelector(".status-dot");
  const boardDetails = {
    title: prompt("Enter board title", title.innerText),
    description: prompt("Enter board description", description.innerText),
    color: prompt("Enter board color", color.style.backgroundColor),
  };
  if (Object.values(boardDetails).every((value) => value)) {
    title.innerText = boardDetails.title;
    description.innerText = boardDetails.description;
    color.style.backgroundColor = boardDetails.color;
  }
  localStorageManager.saveBoards();
}

function handleDeleteBoard(event) {
  event.target.closest(".board").remove();
  localStorageManager.saveBoards();
}

// Utility Functions
function insertAboveTask(zone, mouseY) {
  const els = zone.querySelectorAll(".task:not(.dragging)");
  let closestTask = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  els.forEach((task) => {
    const { top } = task.getBoundingClientRect();
    const offset = mouseY - top;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closestTask = task;
    }
  });

  return closestTask;
}

// Utility Functions
function formattedDate(dateInput) {
  // Handle both timestamp strings and date strings
  const now = dateInput
    ? new Date(Number(dateInput) || Date.parse(dateInput))
    : new Date();
  // Check if date is valid
  if (isNaN(now.getTime())) {
    console.warn("Invalid date input:", dateInput);
    return "Invalid Date";
  }
  const formattedDate = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return formattedDate;
}
function createTaskElement(taskText, color) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.setAttribute("draggable", "true");
  // Add data attribute for task ID
  taskElement.dataset.taskId = Date.now().toString();
  const date = formattedDate(Date.now().toString());
  taskElement.innerHTML = `
    <div class="task-header">
      <span style="background-color: ${color}" class="task-status"></span>
      <span class="task-status-text">Draft</span>
     <span class="task-date">${date}</span>
                <div id="task-actions">
                  <img
                    width="100"
                    height="100"
                    class="edit-task-button"
                    src="https://img.icons8.com/plasticine/100/edit.png"
                    alt="edit" />
                  <img
                    class="delete-task-button"
                    width="24"
                    height="24"
                    src="https://img.icons8.com/ios/50/cancel.png"
                    alt="cancel" />
                </div>
    </div>
    <p class="task-title">${taskText}</p>
  `;
  return taskElement;
}
function attachTaskDeleteEvents(taskElement) {
  const deleteButton = taskElement.querySelector(".delete-task-button");
  if (deleteButton) {
    deleteButton.addEventListener("click", handleDeleteTask);
  }
}

function updateTaskCount(boardElement) {
  const tasksContainer = boardElement.querySelector(SELECTORS.tasksContainer);
  const taskCount = boardElement.querySelector(".task-count");
  if (taskCount) {
    taskCount.textContent = tasksContainer.children.length;
  }
}

function attachDragEvents(taskElement) {
  taskElement.addEventListener("dragstart", () => {
    taskElement.classList.add("dragging");
  });

  taskElement.addEventListener("dragend", () => {
    taskElement.classList.remove("dragging");
    // Remove drag-over classes from all elements
    document.querySelectorAll(SELECTORS.boards).forEach((board) => {
      board.classList.remove("drag-over");
      board
        .querySelector(SELECTORS.tasksContainer)
        .classList.remove("drag-over");
    });
  });
}

function createBoardElement(title, description, color) {
  const boardElement = document.createElement("div");
  boardElement.classList.add("board");
  boardElement.innerHTML = `
    <div class="column">
      <div class="column-header">
        <span class="status-indicator">
          <span style="background-color: ${color}" class="status-dot"></span>
        </span>
        <h3 class="column-title">${title}</h3>
        <span class="task-count">0</span>
         <div id="board-actions">
              <img
                id="board-edit-button"
                width="25"
                height="25"
                src="https://img.icons8.com/office/40/edit.png"
                alt="edit" />
              <div id="board-delete-button">
                <img
                  width="40"
                  height="40"
                  src="https://img.icons8.com/scribby/50/filled-trash.png"
                  alt="filled-trash" />
              </div>
            </div>
      </div>
      <p class="column-description">${description}</p>
      <div class="tasks"></div>
      <button class="add-item-button">
        <svg class="add-item-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4V20M4 12H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
        </svg>
        Add a Task
      </button>
    </div>
  `;
  return boardElement;
}

//local // Storage Management
const localStorageManager = {
  STORAGE_KEY: "kanban-boards",
  saveBoards: function () {
    const boards = document.querySelectorAll(SELECTORS.boards);
    const boardsData = Array.from(boards).map((board) => ({
      title: board.querySelector(".column-title").textContent,
      description: board.querySelector(".column-description").textContent,
      color: board.querySelector(".status-dot").style.backgroundColor,
      tasks: Array.from(board.querySelectorAll(".task")).map((task) => ({
        id: task.dataset.taskId,
        title: task.querySelector(".task-title").textContent,
        status: task.querySelector(".task-status-text").textContent,
        color: task.querySelector(".task-status").style.backgroundColor,
      })),
    }));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(boardsData));
  },
  loadBoards: function () {
    const boardsData = JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    return boardsData || [];
  },
};

document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});
