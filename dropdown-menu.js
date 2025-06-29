// User dropdown (profile)
function toggleDropdown() {
  document.getElementById('userDropdown').classList.toggle('show');
}
window.onclick = function(event) {
  if (!event.target.matches('.user-initial-small')) {
    var dropdowns = document.getElementsByClassName("dropdown-menu-small");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
};
document.addEventListener('DOMContentLoaded', () => {
  const userInitialButton = document.querySelector('.user-initial-small');
  if (userInitialButton) {
    userInitialButton.addEventListener('click', toggleDropdown);
  }
});
window.toggleDropdown = toggleDropdown;

// --- Category Dropdown ---
(() => {
  const categorySelect = document.getElementById('category-select');
  const categoryOptions = document.getElementById('category-options');
  const categoryArrow = document.getElementById('category-arrow');
  const categoryArrowWrapper = document.getElementById('category-arrow-wrapper');
  const categorySelectedLabel = document.getElementById('category-selected-label');
  let isOpen = false;

  categorySelect.onclick = function(e) {
    e.stopPropagation();
    isOpen = !isOpen;
    categoryOptions.style.display = isOpen ? "block" : "none";
    categoryArrow.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
    categorySelect.classList.toggle('active', isOpen);
  };

  categoryArrowWrapper.onmouseenter = function() {
    categoryArrowWrapper.classList.add('arrow-hover');
  };
  categoryArrowWrapper.onmouseleave = function() {
    categoryArrowWrapper.classList.remove('arrow-hover');
  };

  document.querySelectorAll('.category-option').forEach(opt => {
    opt.onclick = function(e) {
      e.stopPropagation();
      categorySelectedLabel.textContent = this.textContent;
      document.querySelectorAll('.category-option').forEach(o => o.classList.remove('selected'));
      this.classList.add('selected');
      isOpen = false;
      categoryOptions.style.display = "none";
      categoryArrow.style.transform = "rotate(0deg)";
      categorySelect.classList.add('active');
      categorySelect.classList.add('has-value');
    };
  });

  document.addEventListener('click', function(e) {
    if(isOpen) {
      isOpen = false;
      categoryOptions.style.display = "none";
      categoryArrow.style.transform = "rotate(0deg)";
    }
  });
})();

// --- Assigned Dropdown (same look/function as Category) ---
(() => {
  const assignedSelect = document.getElementById('assigned-select');
  const assignedOptions = document.getElementById('assigned-list');
  const assignedArrow = document.getElementById('assigned-arrow');
  const assignedArrowWrapper = document.getElementById('assigned-arrow-wrapper');
  let assignedOpen = false;
  
  assignedSelect.onclick = function(e) {
    e.stopPropagation();
    assignedOpen = !assignedOpen;
    assignedOptions.classList.toggle('d-none', !assignedOpen);
    assignedArrow.style.transform = assignedOpen ? "rotate(180deg)" : "rotate(0deg)";
    assignedSelect.classList.toggle('active', assignedOpen);
  };

  assignedArrowWrapper.onmouseenter = function() {
    assignedArrowWrapper.classList.add('arrow-hover');
  };
  assignedArrowWrapper.onmouseleave = function() {
    assignedArrowWrapper.classList.remove('arrow-hover');
  };

  document.addEventListener('click', function(e) {
    if (assignedOpen) {
      assignedOpen = false;
      assignedOptions.classList.add('d-none');
      assignedArrow.style.transform = "rotate(0deg)";
      assignedSelect.classList.remove('active');
    }
  });

  // Example contacts for demo (replace with your dynamic contact logic!)
  const contacts = ["contact1", ".....2", "....3"];
  assignedOptions.innerHTML = contacts.map(name =>
    `<div class="assigned-option">${name}</div>`
  ).join('');

  assignedOptions.querySelectorAll('.assigned-option').forEach(opt => {
    opt.onclick = function(e) {
      e.stopPropagation();
      // Show avatar/initial (simple demo)
      const selected = document.createElement('span');
      selected.textContent = this.textContent[0];
      selected.className = 'selected-avatar';
      document.getElementById('selected-avatars').appendChild(selected);
      assignedOpen = false;
      assignedOptions.classList.add('d-none');
      assignedArrow.style.transform = "rotate(0deg)";
      assignedSelect.classList.add('active');
    };
  });
})();