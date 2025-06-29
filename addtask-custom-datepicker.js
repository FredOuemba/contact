document.addEventListener('DOMContentLoaded', function () {
  const dueDateInput = document.getElementById('due-date-custom');
  const calendarBtn = document.getElementById('calendarBtn');
  const hiddenDateInput = document.getElementById('hiddenDateInput');

  function formatDateToDDMMYYYY(date) {
    const d = new Date(date);
    if (isNaN(d)) return '';
    const day = ('0' + d.getDate()).slice(-2);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function openNativeDatePicker() {
    hiddenDateInput.showPicker
      ? hiddenDateInput.showPicker()
      : hiddenDateInput.click();
  }

  dueDateInput.addEventListener('focus', openNativeDatePicker);
  dueDateInput.addEventListener('click', openNativeDatePicker);
  calendarBtn.addEventListener('click', openNativeDatePicker);

  hiddenDateInput.addEventListener('change', function() {
    dueDateInput.value = formatDateToDDMMYYYY(this.value);
  });

  // Prevent manual typing
  dueDateInput.addEventListener('keydown', e => e.preventDefault());
});