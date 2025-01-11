import { config } from "/config/config.js";

if (config.spotify === true || config.activity === true) {
  function timeToSeconds(time) {
    const parts = time.split(":").map(Number);
    if (parts.length === 3) {
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    } else if (parts.length === 2) {
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    }
    return 0;
  }

  function secondsToTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    }
  }

  const SpotifyProgress = {
    currentSeconds: 0,
    totalSeconds: 0,
    timer: null,

    start() {
      this.stop();
      this.timer = setInterval(() => {
        if (this.currentSeconds < this.totalSeconds) {
          this.currentSeconds++;
          this.updateProgressBar();
        } else {
          this.stop();
        }
      }, 1000);
    },

    stop() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },

    updateProgressBar() {
      const currentTimeEl = document.getElementById("current-time");
      const progressFill = document.querySelector(".progress-fill");

      if (!currentTimeEl || !progressFill) return;

      currentTimeEl.textContent = secondsToTime(this.currentSeconds);
      progressFill.style.width = `${
        (this.currentSeconds / this.totalSeconds) * 100
      }%`;
    },

    setCurrentTime(seconds) {
      this.currentSeconds = seconds;
      this.updateProgressBar();
    },
  };

  async function fetchData(userId) {
    try {
      const response = await fetch(
        `https://api.audibert.rest/activity/${userId}`
      );
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  function updateSpotifyUI(data) {
    const activitieContainer = document.querySelector(".activitie");

    if (activitieContainer) {
      activitieContainer.innerHTML = `
                    
                        <img src="${data.album_image}?size=4096" alt="Album Art" style="cursor: pointer;" 
    onclick="window.open('${data.link}', '_blank')"/>
                        <div class="music-tooltip">${data.album}</div>
                    
                    <div class="details">
                        <span id="span1">${data.song}</span>
                        <span id="span2">${data.artist}</span>
                        <div class="time">
                            <span id="current-time">${data.timestamps.progress}</span>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <span id="total-time">${data.timestamps.duration}</span>
                        </div>
                    </div>`;
    }
  }

  function updateActivityUI(activity) {
    const activitieContainer = document.querySelector(".activitie");

    if (activitieContainer) {
      let marginTop;

      if (!activity.details && !activity.state) {
        marginTop = "20px";
      } else if (activity.details && activity.state) {
        marginTop = "0px";
      } else {
        marginTop = "10px";
      }

      activitieContainer.innerHTML = `
                    <img src="${activity.largeImage}?size=4096" />
                    <div class="music-tooltip">${
                      activity.largeText || activity.type
                    }</div>
                    <div class="details">
                        <span id="span1" style="margin-top: ${marginTop}">${
        activity.name
      }</span>
                        <span id="xd">
                            ${
                              activity.details ? `${activity.details}<br>` : ""
                            }${activity.state || ""}
                        </span>
                        <div class="time">
                            <span id="lol">${
                              activity.timestamps?.time_lapsed ?? "00:00"
                            }</span>
                        </div>
                    </div>`;
    }
  }

  function showSpotifyUI() {
    const activitieContainer = document.querySelector(".activitie");

    if (activitieContainer) {
      activitieContainer.style.display = "flex";
      requestAnimationFrame(() => activitieContainer.classList.add("active"));
    }
  }

  function hideSpotifyUI() {
    const activitieContainer = document.querySelector(".activitie");

    if (activitieContainer) {
      activitieContainer.classList.remove("active");
      setTimeout(() => {
        if (!activitieContainer.classList.contains("active")) {
          activitieContainer.style.display = "none";
        }
      }, 500);
    }
  }

  async function startWatcher(userId) {
    let currentSongId = null;

    async function checkForUpdate() {
      const data = await fetchData(userId);

      if (!data) {
        hideSpotifyUI();
        SpotifyProgress.stop();
        currentSongId = null;
        return;
      }

      if (data.status) {
        const statusElement = document.querySelector("#avatar-status");
        if (statusElement) {
          statusElement.src = `/src/assets/status/${data.status}.png`;
        }
      }

      const spotifyData = data.spotify;
      const activityData = data.activity?.[0];

      if (spotifyData && config.spotify === true) {
        if (spotifyData.song !== currentSongId) {
          currentSongId = spotifyData.song;
          updateSpotifyUI(spotifyData);

          showSpotifyUI();

          SpotifyProgress.currentSeconds = timeToSeconds(
            spotifyData.timestamps.progress
          );
          SpotifyProgress.totalSeconds = timeToSeconds(
            spotifyData.timestamps.duration
          );
          SpotifyProgress.start();
        } else {
          const currentTime = timeToSeconds(spotifyData.timestamps.progress);
          if (currentTime !== SpotifyProgress.currentSeconds) {
            SpotifyProgress.setCurrentTime(currentTime);
          }
        }
      } else if (activityData && config.activity === true) {
        currentSongId = null;

        updateActivityUI(activityData);

        showSpotifyUI();
      } else {
        hideSpotifyUI();
      }
    }

    await checkForUpdate();

    setInterval(checkForUpdate, 1000);
  }

  startWatcher(config.userIds[0]);
}
