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
        actions.innerHTML =
            '<button type="submit" class="btn btn-primary btn-add px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-1" style="background: linear-gradient(90deg, #1976d2 0%, #64b5f6 100%); border: none; transition: box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 0 0 0.2rem #1976d2\'" onmouseout="this.style.boxShadow=\'none\'">' +
                '<img src="https://img.icons8.com/ios-glyphs/18/ffffff/save--v1.png" alt="Save" style="margin-bottom:2px;" /> Save Changes' +
            '</button>' +
            '<button id="cancel-edit" type="button" class="btn btn-outline-secondary btn-show px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-1" style="background: linear-gradient(90deg, #fbd3e0 0%, #e0b1f4 100%); border: none; color: #7c3aed; transition: box-shadow 0.2s;" onmouseover="this.style.boxShadow=\'0 0 0 0.2rem #e0b1f4\'" onmouseout="this.style.boxShadow=\'none\'">' +
                '<img src="https://img.icons8.com/ios-glyphs/18/7c3aed/cancel.png" alt="Cancel" style="margin-bottom:2px;" /> Cancel' +
            '</button>';
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
    var themeClass = '';
    var icon = '';
    if (task.status === 'not-started') {
        statusLabel = 'To do';
        statusClass = 'status-not-started';
        themeClass = 'border-primary bg-gradient bg-todo';
        icon = '<img src="https://img.icons8.com/color/32/000000/idea.png" alt="To Do" style="margin-right:6px;" />';
    } else if (task.status === 'in-progress') {
        statusLabel = 'Doing';
        statusClass = 'status-in-progress';
        themeClass = 'border-warning bg-gradient bg-doing';
        icon = '<img src="https://img.icons8.com/color/32/000000/refresh--v2.png" alt="Doing" style="margin-right:6px;" />';
    } else if (task.status === 'completed') {
        statusLabel = 'Done';
        statusClass = 'status-completed';
        themeClass = 'border-success bg-gradient bg-done';
        icon = '<img src="https://img.icons8.com/color/32/000000/checked--v1.png" alt="Done" style="margin-right:6px;" />';
    }
    var priorityClass = (task.priority || '').toLowerCase();
    var priorityGradient = '';
    if (priorityClass === 'urgent') {
        priorityGradient = 'background: linear-gradient(90deg, #be0202ff 0%, #f5bf8fff 100%); color: #ffffff;';
    } else if (priorityClass === 'high') {
        priorityGradient = 'background: linear-gradient(90deg, #053f81ff 0%, #97cefbff 100%); color: #ffffff;';
    } else if (priorityClass === 'medium') {
        priorityGradient = 'background: linear-gradient(90deg, #f9a825 0%, #fff9c4 100%); color: #2e2e2e';
    } else if (priorityClass === 'low') {
        priorityGradient = 'background: linear-gradient(90deg, #05690aff 0%, #a5d6a7 100%); color: #ffffff;';
    } else {
        priorityGradient = 'background: linear-gradient(90deg, #e1bee7 0%, #fce4ec 100%); color: #6a1b9a;';
    }
    var editBtnGradient = 'background: linear-gradient(90deg, #021a32ff 0%, #64b5f6 100%); color: #fff; border: none; transition: box-shadow 0.2s;';
    var deleteBtnGradient = 'background: linear-gradient(90deg, #820404ff 0%, #ff0037ff 100%); color: #fff; border: none; transition: box-shadow 0.2s;';
    var html = '<div class="kanban-task card mb-3 shadow-sm ' + themeClass + ' ' + statusClass + ' rounded-4" data-task-idx="' + idx + '" style="border-width:2px; border-radius:1.5rem;">' +
        '<div class="card-body p-3">' +
        '<div class="d-flex align-items-center mb-2">' + icon + '<span class="task-title fw-bold flex-grow-1" style="font-size:1.2rem;">' + task.title + '</span></div>' +
        '<div class="task-meta d-flex justify-content-between mb-2">' +
        '<span class="meta-badge badge rounded-pill px-3 py-2 ' + statusClass + '" style="font-size:1rem;">' + statusLabel + '</span>' +
        '<span class="meta-date text-muted px-2 py-1 rounded-3" style="background:#f3f4f6; color:#333;"><img src="https://img.icons8.com/ios-glyphs/20/7c3aed/calendar--v1.png" alt="date" /> ' + (task.date || '') + '</span>' +
        '</div>' +
        '<div class="meta-footer d-flex align-items-center justify-content-between">' +
        '<span class="priority-badge badge ' + priorityClass + ' rounded-pill" style="font-size:0.95rem;' + priorityGradient + '"><img src="https://img.icons8.com/ios-glyphs/18/7c3aed/checked-checkbox.png" alt="priority" /> ' + capitalizeFirst(task.priority || '') + '</span>' +
        '<div class="kanban-task-actions ms-2 d-flex gap-2">' +
            '<button class="edit-task-btn btn btn-sm rounded-pill d-flex align-items-center gap-1" style="' + editBtnGradient + 'padding: 0.35rem 1.1rem;" onmouseover="this.style.boxShadow=\'0 0 0 0.2rem #1976d2\'" onmouseout="this.style.boxShadow=\'none\'">' +
                '<img src="https://img.icons8.com/ios-glyphs/18/ffffff/edit--v1.png" alt="Edit" style="margin-bottom:2px;" /> Edit' +
            '</button>' +
            '<button class="delete-task-btn btn btn-sm rounded-pill d-flex align-items-center gap-1" style="' + deleteBtnGradient + 'padding: 0.35rem 1.1rem;" onmouseover="this.style.boxShadow=\'0 0 0 0.2rem #b71c1c\'" onmouseout="this.style.boxShadow=\'none\'">' +
                '<img src="https://img.icons8.com/ios-glyphs/18/ffffff/delete-sign.png" alt="Delete" style="margin-bottom:2px;" /> Delete' +
            '</button>' +
        '</div>' +
        '</div>' +
        '</div>' +
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