let tasks = [];
const tasksloader = document.getElementById("task");
const input = document.getElementById("inputplace");
const storagekey = "tasks";

const addPrioritySelect = document.getElementById("add-priority-select");
const addTaskBtn = document.getElementById("add-task-btn");
const sortPriorityBtn = document.getElementById("sort-priority-btn");

document.addEventListener("DOMContentLoaded", loadtasks);

input.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        addtask();
    }
});

addTaskBtn.addEventListener("click", addtask);

sortPriorityBtn.addEventListener("click", sortTasksByPriority);

function loadtasks() {
    const olditems = localStorage.getItem(storagekey);
    if (olditems) {
        tasks = JSON.parse(olditems).map(task => {
            if (typeof task === 'string') {
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

function savetasks() {
    const string = JSON.stringify(tasks);
    localStorage.setItem(storagekey, string);
}

function rendertasks() {
    tasksloader.innerHTML = "";
    for (const [idx, task] of Object.entries(tasks)) {
        const container = document.createElement("div");
        container.style.marginBottom = "10px";
        container.style.display = "flex";
        container.style.alignItems = "center";
        container.dataset.index = idx;

        container.classList.add(`priority-${task.priority}`);
        if (task.completed) {
            container.classList.add("completed-task");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.style.marginRight = "10px";
        checkbox.onchange = () => toggletask(idx);

        const textDisplay = document.createElement("p");
        textDisplay.style.display = "block";
        textDisplay.style.marginRight = "10px";
        textDisplay.textContent = task.text;
        textDisplay.style.flexGrow = "1";

        if (task.completed) {
            textDisplay.style.textDecoration = "line-through";
            textDisplay.style.color = "#888";
        }

        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.value = task.text;
        editInput.style.display = "none";
        editInput.style.marginRight = "10px";
        editInput.style.flexGrow = "1";

        const editPrioritySelect = document.createElement("select");
        editPrioritySelect.style.display = "none";
        editPrioritySelect.style.marginRight = "10px";
        ['High', 'Medium', 'Low'].forEach(p => {
            const option = document.createElement('option');
            option.value = p;
            option.textContent = `${p} Priority`;
            editPrioritySelect.appendChild(option);
        });
        editPrioritySelect.value = task.priority;

        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.alignItems = "center";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.style.marginRight = "5px";
        editButton.onclick = () => enableEditMode(idx, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect);

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.style.display = "none";
        saveButton.style.marginRight = "5px";
        saveButton.onclick = () => saveEditedTask(idx, editInput.value, editPrioritySelect.value, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "X";
        deleteButton.onclick = () => removetasks(idx);

        container.appendChild(checkbox);
        container.appendChild(textDisplay);
        container.appendChild(editInput);
        container.appendChild(editPrioritySelect);

        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(saveButton);
        buttonsContainer.appendChild(deleteButton);
        container.appendChild(buttonsContainer);

        tasksloader.appendChild(container);
    }
}

function addtask() {
    const value = input.value.trim();
    const priority = addPrioritySelect.value;

    if (!value) {
        alert("Please enter a task.");
        return;
    }

    // Check for existing tasks with the same name AND same priority
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

function removetasks(idx) {
    const indexToRemove = parseInt(idx, 10);
    tasks.splice(indexToRemove, 1);
    rendertasks();
    savetasks();
}

function toggletask(idx) {
    const indexToToggle = parseInt(idx, 10);
    if (tasks[indexToToggle]) {
        tasks[indexToToggle].completed = !tasks[indexToToggle].completed;
        savetasks();
        rendertasks();
    }
}

function enableEditMode(idx, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect) {
    textDisplay.style.display = "none";
    editButton.style.display = "none";
    deleteButton.style.display = "none";

    editInput.style.display = "block";
    saveButton.style.display = "block";
    editPrioritySelect.style.display = "block";

    editInput.focus();
    editInput.select();

    editInput.onkeyup = (event) => {
        if (event.key === "Enter") {
            saveEditedTask(idx, editInput.value, editPrioritySelect.value, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect);
        }
    };
}

function saveEditedTask(idx, newText, newPriority, textDisplay, editInput, editButton, saveButton, deleteButton, editPrioritySelect) {
    const indexToEdit = parseInt(idx, 10);
    const trimmedText = newText.trim();

    if (!trimmedText) {
        alert("Task name cannot be empty!");
        return;
    }

    // Check if the *new* name AND *new* priority conflict with other *existing* tasks
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