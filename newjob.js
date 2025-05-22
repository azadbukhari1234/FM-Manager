        // for Toggling Menu
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');

        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

         // Dialog handling
        const newJobLarge = document.getElementById('large-menu');
        const newJobMobile = document.getElementById('mobile-menu');
        const newJobDialog = document.getElementById('new-job-dialog');
        const cancelDialog = document.getElementById('cancel-dialog');
        const newJobForm = document.getElementById('new-job-form');

        newJobLarge.addEventListener('click', (e) => {
            e.preventDefault();
            newJobDialog.showModal();
        });

        newJobMobile.addEventListener('click', (e) => {
            e.preventDefault();
            newJobDialog.showModal();
        });

        cancelDialog.addEventListener('click', () => {
            newJobDialog.close();
            newJobForm.reset();
        });

        newJobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Here you would typically send the form data to a server
            console.log('Form submitted:', {
                title: document.getElementById('job-title').value,
                description: document.getElementById('job-description').value,
                department: document.getElementById('department').value,
                urgency: document.getElementById('urgency').value
            });
            newJobDialog.close();
            newJobForm.reset();
        });
