// Utility functions for LocalStorage
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}
function getCompletedTasks() {
  return JSON.parse(localStorage.getItem('completedTasks') || '[]');
}
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}
function saveCompletedTasks(tasks) {
  localStorage.setItem('completedTasks', JSON.stringify(tasks));
}

// Work order: WO-dd/mm/yyyy-XX, where XX auto-increments each day
function generateWorkOrder() {
  const today = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const day = pad(today.getDate());
  const month = pad(today.getMonth() + 1);
  const year = today.getFullYear();
  const dateString = `${day}${month}${year}`;
  
  // Count today's tasks in both lists for increment
  const all = getTasks().concat(getCompletedTasks());
  const todayCount = all.filter(t => t.workorder && t.workorder.includes(`WO-${dateString}`)).length + 1;
  return `WO ${dateString}-${todayCount}`;
}

// Render daily tasks (as per HTML layout)
function renderTasks() {
  const tasks = getTasks();
  const $list = $('#daily-task-list');
  $list.empty();
  tasks.forEach((task, idx) => {
    $list.append(`
      <div class="task-card container flex bg-yellow-100 rounded-xl w-full py-2 px-2 space-y-1 data-index="${idx}">
        <div class="w-3/4">
          <h2 id="labelLocation" class="text-xl font-semibold">${task.location}</h2>
          <div class="flex">
                <span id="failuretype">${task.failuretype}</span>
                <span class="ml-2 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-200 rounded-full">${task.priority}</span>
          </div>
          <div class="flex">
                    <p id="reportdetails" class="md:text-lg text-md w-4/6 md:w-full task-description truncate md:whitespace-normal">${task.details}</p>
                    <button class="text-sm text-blue-600 hover:underline md:hidden toggle-description-btn">Show more</button>
          </div>
          <div class="flex justify-between text-md md:w-3/4 w-5/6">
                    <span>Today</span> at <span>${task.time || ""}</span>
                    <span id="name" class="ml-2">${task.name}</span>
                    <span id="department">${task.department}</span>
            </div>
          </div>    
          <div class="take-action w-1/4 text-right space-y-1">
              <h2 id="workorder" class="wo-number text-md">${task.workorder}</h2>
              ${
                task.technician
                ? `<span class="technician-label text-blue-700 font-semibold md:text-base text-base">${task.technician}</span>`
                : `<button class="takejob w-24 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mb-1 md:text-base text-base">Take Job</button>`
              }
              <button id="complete" name="compltask" class="complete w-24 py-1 text-sm bg-green-500 text-white rounded hover:bg-teal-500">Complete</button>
          </div>
      </div>
    `);
  });
}

// Render completed tasks - keep card and photo size, no scroll, no priority, no date, keep layout
function renderCompletedTasks() {
  const tasks = getCompletedTasks();
  const $list = $('#completetaskphoto');
  $list.empty();
  tasks.forEach((task) => {
    $list.append(`
      <div class="flex-shrink-0 bg-cyan-100 rounded-xl w-64 style="min-width:16rem;max-width:16rem;max-height:16rem;">
              <div class="flex justify-between mx-3 my-1">
                <h2 id="report-location" class="text-xl font-semibold">${task.location}</h2>
                <h2 id="workorder" class="wo-number text-sm my-auto">${task.workorder}</h2>
              </div>
              <img id="completephoto" src="${task.photo || 'images/photo1.png'}" alt="complete images" class="px-2 w-full object-cover" style="height: 170px;">
              <div class="flex justify-between px-3 py-auto">
                <span id="submittime">${task.submittime}</span>
                <span id="technician" class="text-blue-700 text-md">${task.technician || ''}</span>
              </div>
          </div>
    `);
  });
}

// Modal dialog logic
$(document).ready(function(){
  // Show new job dialog
  $('#large-menu, #new-job-large, #new-job-mobile').click(function() {
    $('#new-job-dialog')[0].showModal();
  });
  $('#menu-toggle').click(function() {
    $('#mobile-menu').toggle();
  });
  $('#cancel-dialog').click(function() {
    $('#new-job-dialog')[0].close();
  });

  // New job form submit
  $('#new-job-form').on('submit', function(e) {
    e.preventDefault();
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const time = pad(now.getHours()) + ':' + pad(now.getMinutes());
    const task = {
      name: $('#name').val(),
      failuretype: $('#failuretype').val(),
      department: $('#department').val(),
      location: $('#report-location').val(),
      details: $('#report-details').val(),
      time,
      workorder: generateWorkOrder()
    };
    const tasks = getTasks();
    tasks.push(task);
    saveTasks(tasks);
    renderTasks();
    $('#new-job-dialog')[0].close();
    this.reset();
  });

  // Take Job (assign technician)
  $('#daily-task-list').on('click', '.takejob', function() {
    $('#techbox')[0].showModal();
    const idx = $(this).closest('.task-card').data('index');
    $('#techbox').data('task-index', idx);
  });
  $('#submit-technician').click(function(e) {
    e.preventDefault();
    const idx = $('#techbox').data('task-index');
    const technician = $('#technician-select').val();
    let tasks = getTasks();
    if (tasks[idx]) {
      tasks[idx].technician = technician;
      saveTasks(tasks);
      renderTasks();
    }
    $('#techbox')[0].close();
  });
  $('#cancel-techbox').click(function() {
    $('#techbox')[0].close();
  });

  // Complete button (upload photo)
  $('#daily-task-list').on('click', '.complete', function() {
    $('#subphoto')[0].showModal();
    const idx = $(this).closest('.task-card').data('index');
    $('#subphoto').data('task-index', idx);
  });
  $('#cancelupldialog').click(function() {
    $('#subphoto')[0].close();
  });

  // Submit complete with photo
  $('#tosubmitphoto').submit(function(e) {
    e.preventDefault();
    const idx = $('#subphoto').data('task-index');
    let tasks = getTasks();
    let completedTasks = getCompletedTasks();
    const fileInput = $('#photo-upload')[0];
    let photoData = '';
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        photoData = e.target.result;
        finishComplete(idx, photoData);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      finishComplete(idx, '');
    }
    function finishComplete(idx, photoData) {
      const completedTask = {...tasks[idx], photo: photoData};
      completedTasks.push(completedTask);
      tasks.splice(idx, 1);
      saveTasks(tasks);
      saveCompletedTasks(completedTasks);
      renderTasks();
      renderCompletedTasks();
      $('#subphoto')[0].close();
    }
  });

  // Initial render
  renderTasks();
  renderCompletedTasks();
});