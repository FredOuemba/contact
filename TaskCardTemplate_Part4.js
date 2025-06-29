  function checkEmptySections() {
    document.querySelectorAll('.progress-section').forEach(section => {
      const cards = Array.from(section.querySelectorAll('.card'));
      const visibleCards = cards.filter(card => card.style.display !== "none");
      const noTasks = section.querySelector('.no-tasks');
      
      if (visibleCards.length === 0 && noTasks) {
        noTasks.classList.remove('d-none');
      } else if (visibleCards.length > 0 && noTasks) {
        noTasks.classList.add('d-none');
      }
    });
  }
  
/**
 * Filters visible task cards on the board based on the search input.
 * If the input length is less than 3 characters, all cards are shown.
 * Otherwise, only cards with titles matching the search term are displayed.
 * 
 * Also triggers a check to update the "no tasks" message per section.
 */

function handleTaskSearch() {
  const searchInput = document.getElementById('taskSearchInput').value.trim().toLowerCase();
  const allCards = document.querySelectorAll('.card'); 

  if (searchInput.length < 2) {
    allCards.forEach(card => {
      card.style.display = "block";
    });
    checkEmptySections();
    return;
    
  }

/**
 * Filters task cards based on the user's search input.
 * 
 * - If the input has fewer than 3 characters, all task cards are shown.
 * - If the input is 3 or more characters long, only task cards whose title
 *   includes the search term (case-insensitive) will be displayed.
 * 
 * After filtering, it triggers a check to show or hide "no tasks" messages
 * in each board column, depending on whether cards remain visible.
 */
allCards.forEach(card => {
  const titleElement = card.querySelector('.card-title');
  const descElement = card.querySelector('.card-description');

  const title = titleElement ? titleElement.textContent.toLowerCase() : "";
  const description = descElement ? descElement.textContent.toLowerCase() : "";

  if (title.includes(searchInput) || description.includes(searchInput)) {
    card.style.display = "block"; 
  } else {
    card.style.display = "none"; 
  }
});

  checkEmptySections();

}
