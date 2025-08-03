// Get references to DOM elements
let tasks = [];
const tasksloader = document.getElementById("task");
const input = document.getElementById("inputplace");
const storagekey = "tasks";
const addPrioritySelect = document.getElementById("add-priority-select");
const addTaskBtn = document.getElementById("add-task-btn");
const sortPriorityBtn = document.getElementById("sort-priority-btn");
const searchInput = document.getElementById('search-input');
const MAX_TASKS = 30;

// Add event listeners
document.addEventListener("DOMContentLoaded", loadtasks);

input.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addtask();
    }
});

addTaskBtn.addEventListener("click", addtask);
sortPriorityBtn.addEventListener("click", sortTasksByPriority);

// Add the new search functionality
searchInput.addEventListener('keyup', filterTasks);

// Function to load tasks from local storage
function loadtasks() {
    const olditems = localStorage.getItem(storagekey);
    if (olditems) {
        tasks = JSON.parse(olditems).map(task => {
            if (typeof task === 'string') {
                // Handle old format where tasks were just strings
                return { text: task, completed: false, priority: "Medium" };
            }
            return {
                text: task.text,
                completed: task.completed,
                priority: task.priority || "Medium"
            };
        });
    }
    rendertasks();
}

// Function to save tasks to local storage
function savetasks() {
    const string = JSON.stringify(tasks);
    localStorage.setItem(storagekey, string);
}

// Function to render tasks to the DOM
function rendertasks() {
    tasksloader.innerHTML = "";
    for (const [idx, task] of Object.entries(tasks)) {
        const container = document.createElement("div");
        // Add classes for styling and responsive behavior
        container.classList.add("task-container", `priority-${task.priority}`);
        if (task.completed) {
            container.classList.add("completed-task");
        }
        container.dataset.index = idx;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.onchange = () => toggletask(idx);

        const textDisplay = document.createElement("p");
        textDisplay.classList.add("task-text");
        textDisplay.textContent = task.text;

        const priorityDisplay = document.createElement("span");
        priorityDisplay.classList.add("priority-display");
        priorityDisplay.textContent = `${task.priority} Priority`;

        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.classList.add("edit-input");
        editInput.value = task.text;
        editInput.style.display = "none";

        const editPrioritySelect = document.createElement("select");
        editPrioritySelect.classList.add("edit-priority-select");
        editPrioritySelect.style.display = "none";
        ['High', 'Medium', 'Low'].forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = `${p} Priority`;
            editPrioritySelect.appendChild(option);
        });
        editPrioritySelect.value = task.priority;

        const buttonsContainer = document.createElement("div");
        buttonsContainer.classList.add("buttons-container");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("edit-btn");
        editButton.onclick = () => enableEditMode(idx, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect, priorityDisplay);

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.classList.add("save-btn");
        saveButton.style.display = "none";
        saveButton.onclick = () => saveEditedTask(idx, editInput.value, editPrioritySelect.value, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect, priorityDisplay);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.onclick = () => removetasks(idx);

        container.appendChild(checkbox);
        container.appendChild(textDisplay);
        container.appendChild(priorityDisplay);
        container.appendChild(editInput);
        container.appendChild(editPrioritySelect);

        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(saveButton);
        buttonsContainer.appendChild(deleteButton);
        container.appendChild(buttonsContainer);

        tasksloader.appendChild(container);
    }
}

// Function to add a new task
function addtask() {
    const value = input.value.trim();
    const priority = addPrioritySelect.value;
    const completedTasksCount = tasks.filter(task => task.completed).length;

    if (tasks.length >= MAX_TASKS) {
        // If all tasks are completed, show a different alert
        if (completedTasksCount >= MAX_TASKS) {
            alert("You have completed 30 tasks. Please remove completed tasks or upgrade to a pro plan to add new ones.");
            return;
        } else {
            // Show a general alert for reaching the task limit
            alert("You have reached the maximum limit of adding tasks. Please remove tasks or buy a pro plan.");
            return;
        }
    }

    if (!value) {
        alert("Please enter a task.");
        return;
    }

    const existingTaskWithSameNameAndPriority = tasks.some(task =>
        task.text === value && task.priority === priority
    );

    if (existingTaskWithSameNameAndPriority) {
        alert(`A task named "${value}" with ${priority} priority already exists. Please use a different name or priority.`);
        return;
    }

    tasks.push({ text: value, completed: false, priority: priority });
    rendertasks();
    input.value = "";
    addPrioritySelect.value = "Medium";
    savetasks();
}

// Function to remove a task
function removetasks(idx) {
    const indexToRemove = parseInt(idx, 10);
    tasks.splice(indexToRemove, 1);
    rendertasks();
    savetasks();
}

// Function to toggle a task's completion status
function toggletask(idx) {
    const indexToToggle = parseInt(idx, 10);
    if (tasks[indexToToggle]) {
        tasks[indexToToggle].completed = !tasks[indexToToggle].completed;
        savetasks();
        rendertasks();
    }
}



// Function to enable edit mode for a task
function enableEditMode(idx, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect, priorityDisplay) {
    textDisplay.style.display = "none";
    priorityDisplay.style.display = "none";
    editButton.style.display = "none";
    deleteButton.style.display = "none";

    editInput.style.display = "block";
    saveButton.style.display = "block";
    editPrioritySelect.style.display = "block";

    editInput.focus();
    editInput.select();

    editInput.onkeyup = (event) => {
        if (event.key === "Enter") {
            saveEditedTask(idx, editInput.value, editPrioritySelect.value, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect, priorityDisplay);
        }
    };
}

// Function to save an edited task
function saveEditedTask(idx, newText, newPriority, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect, priorityDisplay) {
    const indexToEdit = parseInt(idx, 10);
    const trimmedText = newText.trim();

    if (!trimmedText) {
        alert("Task name cannot be empty!");
        return;
    }

    const newNameAndPriorityExists = tasks.some((task, i) =>
        i !== indexToEdit && task.text === trimmedText && task.priority === newPriority
    );

    if (newNameAndPriorityExists) {
        alert(`A task named "${trimmedText}" with ${newPriority} priority already exists.`);
        return;
    }

    if (tasks[indexToEdit]) {
        tasks[indexToEdit].text = trimmedText;
        tasks[indexToEdit].priority = newPriority;
        savetasks();
        rendertasks();
    }
}

// Function to sort tasks by priority
function sortTasksByPriority() {
    if (tasks.length === 0) {
        alert("No tasks to sort.");
        return;
    }

    const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };

    tasks.sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;

        return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    rendertasks();
    savetasks();
}

// Function to filter tasks based on search input
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const taskElements = tasksloader.children;

    for (const taskElement of taskElements) {
        // Find the specific text element within the task container
        const taskTextElement = taskElement.querySelector('.task-text');
        if (taskTextElement) {
            const taskText = taskTextElement.textContent.toLowerCase();
            if (taskText.includes(searchTerm)) {
                taskElement.style.display = 'flex';
            } else {
                taskElement.style.display = 'none';
            }
        }
    }
}
