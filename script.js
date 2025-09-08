// Task storage and rendering for To Do List

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('todo-form');
    var taskList = document.getElementById('task-list');
    var showTasksBtn = document.getElementById('show-tasks');

    // Check for edit mode via query params
    var params = new URLSearchParams(window.location.search);
    var isEdit = params.get('edit') === '1';
    var editIdx = params.get('idx');
    if (isEdit && form) {
        // Populate form with task info
        document.getElementById('todo-input').value = params.get('title') || '';
        document.getElementById('date-input').value = params.get('date') || '';
        document.getElementById('priority-input').value = params.get('priority') || '';
        document.getElementById('status-input').value = (function (s) {
            if (s === 'not-started') return 'to-do';
            if (s === 'in-progress') return 'doing';
            if (s === 'completed') return 'done';
            return '';
        })(params.get('status'));
        // Show Save Changes and Cancel buttons
        var actions = document.querySelector('.form-actions');
        actions.innerHTML = '<button type="submit" class="btn btn-add">Save Changes</button>' +
            '<button id="cancel-edit" type="button" class="btn btn-show">Cancel</button>';
        // Save changes handler
        form.onsubmit = function (e) {
            e.preventDefault();
            var tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            if (editIdx !== null && tasks[editIdx]) {
                tasks[editIdx].title = document.getElementById('todo-input').value.trim();
                tasks[editIdx].date = document.getElementById('date-input').value;
                tasks[editIdx].priority = document.getElementById('priority-input').value;
                var status = document.getElementById('status-input').value;
                if (status === 'to-do') status = 'not-started';
                else if (status === 'doing') status = 'in-progress';
                else if (status === 'done') status = 'completed';
                tasks[editIdx].status = status;
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
            window.location.href = 'task.html';
        };
        // Cancel button handler
        document.getElementById('cancel-edit').onclick = function () {
            window.location.href = 'task.html';
        };
    } else if (form) {
        // Only add new task if not in edit mode
        form.onsubmit = function (e) {
            e.preventDefault();
            var title = document.getElementById('todo-input').value.trim();
            var date = document.getElementById('date-input').value;
            var priority = document.getElementById('priority-input').value;
            var status = document.getElementById('status-input').value;
            // Normalize status for task.html
            if (status === 'to-do') status = 'not-started';
            else if (status === 'doing') status = 'in-progress';
            else if (status === 'done') status = 'completed';
            if (!title || !date || !priority || !status) return;
            // Always get latest tasks from storage before adding
            var tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
            tasks.push({ title: title, date: date, priority: priority, status: status });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            form.reset();
        };
    }
    if (showTasksBtn) {
        showTasksBtn.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.href = 'task.html';
        });
    }
    // No need to render tasks on index.html
});

// Utility functions for task.html
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks') || '[]');
}
function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function createTaskCard(task, idx) {
    var statusLabel = '';
    var statusClass = '';
    if (task.status === 'not-started') { statusLabel = 'To do'; statusClass = 'status-not-started'; }
    else if (task.status === 'in-progress') { statusLabel = 'Doing'; statusClass = 'status-in-progress'; }
    else if (task.status === 'completed') { statusLabel = 'Done'; statusClass = 'status-completed'; }
    var priorityClass = (task.priority || '').toLowerCase();
    var html = '<div class="kanban-task ' + statusClass + '" data-task-idx="' + idx + '">' +
        '<div class="task-title">' + task.title + '</div>' +
        '<div class="task-meta">' +
        '<span class="meta-badge ' + statusClass + '"><img src="https://img.icons8.com/ios-glyphs/30/000000/ok--v1.png" alt="status" />' + statusLabel + '</span>' +
        '<span class="meta-date"><img src="https://img.icons8.com/ios-glyphs/30/000000/calendar--v1.png" alt="date" />' + (task.date || '') + '</span>' +
        '</div>' +
        '<div class="meta-footer"><img src="https://img.icons8.com/ios-glyphs/30/000000/checked-checkbox.png" alt="calendar" /><span class="priority-badge ' + priorityClass + '">' + capitalizeFirst(task.priority || '') + '</span></div>' +
        '<div class="kanban-task-actions"><button class="edit-task-btn">Edit</button><button class="delete-task-btn">Delete</button></div>' +
        '</div>';
    return html;
}
function sortTasks(tasks, sortValue) {
    if (sortValue === 'date-asc') {
        tasks.sort(function (a, b) {
            return new Date(a.date) - new Date(b.date);
        });
    } else if (sortValue === 'date-desc') {
        tasks.sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });
    } else if (sortValue === 'priority') {
        var priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
        tasks.sort(function (a, b) {
            return (priorityOrder[(a.priority || '').toLowerCase()] || 5) - (priorityOrder[(b.priority || '').toLowerCase()] || 5);
        });
    }
    return tasks;
}
function renderKanban() {
    var tasks = getTasks();
    var sortValue = document.getElementById('sort-select') ? document.getElementById('sort-select').value : 'none';
    var searchValue = document.getElementById('search-bar') ? document.getElementById('search-bar').value.trim().toLowerCase() : '';
    var todo = [], doing = [], done = [];
    for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        t._idx = i;
        if (searchValue && t.title.toLowerCase().indexOf(searchValue) === -1) continue;
        if (t.status === 'not-started') todo.push(t);
        else if (t.status === 'in-progress') doing.push(t);
        else if (t.status === 'completed') done.push(t);
    }
    todo = sortTasks(todo, sortValue);
    doing = sortTasks(doing, sortValue);
    done = sortTasks(done, sortValue);
    var todoTasksDiv = document.getElementById('todo-tasks');
    var doingTasksDiv = document.getElementById('doing-tasks');
    var doneTasksDiv = document.getElementById('done-tasks');
    var todoCount = document.getElementById('todo-count');
    var doingCount = document.getElementById('doing-count');
    var doneCount = document.getElementById('done-count');
    if (todoTasksDiv) todoTasksDiv.innerHTML = todo.map(function (t) { return createTaskCard(t, t._idx); }).join('');
    if (doingTasksDiv) doingTasksDiv.innerHTML = doing.map(function (t) { return createTaskCard(t, t._idx); }).join('');
    if (doneTasksDiv) doneTasksDiv.innerHTML = done.map(function (t) { return createTaskCard(t, t._idx); }).join('');
    if (todoCount) todoCount.textContent = todo.length;
    if (doingCount) doingCount.textContent = doing.length;
    if (doneCount) doneCount.textContent = done.length;
    // Delete button events
    var delBtns = document.getElementsByClassName('delete-task-btn');
    for (var j = 0; j < delBtns.length; j++) {
        delBtns[j].onclick = function (e) {
            var taskDiv = e.target.closest('.kanban-task');
            var idx = parseInt(taskDiv.getAttribute('data-task-idx'));
            var allTasks = getTasks();
            allTasks.splice(idx, 1);
            saveTasks(allTasks);
            renderKanban();
        };
    }
    // Edit button events
    var editBtns = document.getElementsByClassName('edit-task-btn');
    for (var k = 0; k < editBtns.length; k++) {
        editBtns[k].onclick = function (e) {
            var taskDiv = e.target.closest('.kanban-task');
            var idx = parseInt(taskDiv.getAttribute('data-task-idx'));
            var allTasks = getTasks();
            var task = allTasks[idx];
            // Encode task info in query string
            var params = new URLSearchParams({
                idx: idx,
                title: task.title,
                date: task.date,
                priority: task.priority,
                status: task.status
            });
            window.location.href = 'index.html?edit=1&' + params.toString();
        };
    }
}
document.addEventListener('DOMContentLoaded', function () {
    var sortSelect = document.getElementById('sort-select');
    var searchBar = document.getElementById('search-bar');
    if (sortSelect) {
        sortSelect.addEventListener('change', renderKanban);
    }
    if (searchBar) {
        searchBar.addEventListener('input', renderKanban);
    }
    renderKanban();
});