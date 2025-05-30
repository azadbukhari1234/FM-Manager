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
  const dateString = `${day}/${month}/${year}`;
  // Count today's tasks in both lists for increment
  const all = getTasks().concat(getCompletedTasks());
  const todayCount = all.filter(t => t.workorder && t.workorder.includes(`WO-${dateString}`)).length + 1;
  return `WO-${dateString}-${todayCount}`;
}

// Render daily tasks (as per HTML layout)
function renderTasks() {
  const tasks = getTasks();
  const $list = $('#daily-task-list');
  $list.empty();
  tasks.forEach((task, idx) => {
    $list.append(`
      <div class="task-card container flex bg-yellow-100 rounded-xl w-full py-2 px-3 my-2" style="min-width:100%;max-width:100%;height:140px;" data-index="${idx}">
        <div class="w-3/4 flex flex-col justify-between h-full">
          <h2 class="text-xl font-semibold md:text-xl">${task.location}</h2>
          <div class="flex items-center">
            <span class="md:text-base text-base">${task.failuretype}</span>
          </div>
          <div class="flex">
            <p class="md:text-lg text-lg w-full task-description truncate whitespace-nowrap">${task.details}</p>
          </div>
          <div class="flex gap-4 md:gap-6 justify-between text-md md:w-3/4 w-5/6">
            <span class="md:text-base text-base">${task.time || ""}</span>
            <span class="ml-2 md:text-base text-base">${task.name}</span>
            <span class="md:text-base text-base">${task.department}</span>
          </div>
        </div>
        <div class="take-action w-1/4 flex flex-col items-end justify-between h-full space-y-1">
          <h2 class="wo-number text-md md:text-md">${task.workorder}</h2>
          ${
            task.technician
              ? `<span class="technician-label text-blue-700 font-semibold md:text-base text-base">${task.technician}</span>`
              : `<button class="takejob w-24 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 mb-1 md:text-base text-base">Take Job</button>`
          }
          <button class="complete w-24 py-1 text-sm bg-green-500 text-white rounded hover:bg-teal-500 md:text-base text-base">Complete</button>
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
      <div class="flex-shrink-0 bg-cyan-100 rounded-xl w-64 h-64 mx-1 flex flex-col justify-between" style="min-width:16rem;max-width:16rem;">
        <div class="flex justify-between mx-3 mt-2">
          <h2 class="text-xl font-semibold md:text-xl">${task.location}</h2>
          <h2 class="wo-number text-sm my-auto md:text-sm">${task.workorder}</h2>
        </div>
        <img src="${task.photo || 'images/photo1.png'}" alt="complete images" class="px-2 object-cover w-full h-32 mt-2 rounded" style="height: 128px;"/>
        <div class="flex justify-between px-3 py-2">
          <span class="md:text-base text-base">${task.name}</span>
          <span class="text-blue-700 font-semibold md:text-base text-base">${task.technician || ''}</span>
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