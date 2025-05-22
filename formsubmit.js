document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const taskContainer = document.getElementById('task');

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // Prevent default form submission

    // Get form values
    const name = document.getElementById('name').value;
    const department = document.getElementById('department').value;
    const location = document.getElementById('location').value;
    const report = document.getElementById('report').value;

    // Generate a simple work order number (for demo purposes)
    const workOrder = `W${Math.floor(Math.random() * 1000)}-051925`;

    // Get current time for "Today" and time display
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Create new task element
    const newTask = document.createElement('div');
    newTask.classList.add('col-md-4', 'mb-4');
    newTask.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${location}</h5>
          <h6 class="card-subtitle mb-2 text-muted">${workOrder}</h6>
          <p class="card-text">${report}</p>
          <p class="card-text">
            <small class="text-muted">
              Today<br>
              ${timeString}<br>
              ${department}
            </small>
          </p>
        </div>
      </div>
    `;

    // Append new task to the task container
    taskContainer.insertBefore(newTask, taskContainer.firstChild); // Add to top

    // Clear form
    form.reset();
  });

  // Handle Cancel button to clear form
  const cancelButton = document.querySelector('input[value="Cancel"]');
  cancelButton.addEventListener('click', () => {
    form.reset();
  });
});