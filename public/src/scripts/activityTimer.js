function updateActivityTime() {
  const timeElement = document.getElementById("lol");
  if (!timeElement) return;

  function parseTime(timeStr) {
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) {
      
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
      
      return parts[0] * 60 + parts[1];
    }
    return 0;
  }

  function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  let totalSeconds = parseTime(timeElement.textContent);

  const timer = setInterval(() => {
    totalSeconds++;
    timeElement.textContent = formatTime(totalSeconds);
  }, 1000);
}

document.addEventListener("activityLoaded", function () {
  const timeElement = document.getElementById("lol");
  if (!timeElement) return;

  function parseTime(timeStr) {
    if (!timeStr || timeStr === "00:00") return 0;
    const parts = timeStr.split(":");
    if (parts.length === 2) {
      const [hours, minutes] = parts.map(Number);
      return hours * 60 + minutes;
    }
    return 0;
  }

  function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  }

  let totalMinutes = parseTime(timeElement.textContent);

  
  if (window.activityTimer) clearInterval(window.activityTimer);

  window.activityTimer = setInterval(() => {
    totalMinutes++;
    timeElement.textContent = formatTime(totalMinutes);
  }, 60000);
});
