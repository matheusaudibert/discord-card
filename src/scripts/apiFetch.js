import { config } from "/src/config/config.js";

async function loadUserProfile(card, userId) {
  if (!config.profile) {
    card.style.display = "none";
    return;
  }

  try {
    const response = await fetch(`https://api.audibert.rest/user/${userId}`);
    if (!response.ok) throw new Error("Erro ao buscar dados da API");
    const data = await response.json();

    async function loadGuildData() {
      try {
        const response = await fetch(
          `https://api.audibert.rest/guild/${config.guildId}`
        );
        if (!response.ok) throw new Error("Erro ao buscar dados da guilda");
        const guild_data = await response.json();

        return guild_data || null;
      } catch (error) {
        console.error(error);
      }
    }

    const guild_data = await loadGuildData();

    handleGuild(card, guild_data);

    // Hide the card if its necessary
    handleCard(card, data);

    // Set the status
    const status = getStatus(data.data.status);

    // Avatar section
    handleAvatar(card, data, status);

    // Names section
    handleNames(card, data);

    // Badges section
    handleBadges(card, data);

    // Activity section
    handleActivity(card, data);

    // Spotify section
    handleSpotify(card, data);

    // CardActivity section
    handleActivityDisplay(card, data);

    // Social section
    handleSocial(card, data);

    //Only Components
    Onlys(card, data);

    // Update the title of the page only for the first user
    if (userId === config.userIds[0]) {
      handlePageTitle(data);
    }

    const event = new Event("profileLoaded");
    document.dispatchEvent(event);
  } catch (error) {
    console.error(error);
    card.style.display = "none";
  }
}

// Helper functions for each section

function handleCard(card, data) {
  if (
    !config.avatar &&
    !config.names &&
    (data.data.profile.badges.length === 0 || !config.badges) &&
    (!data.data.spotify || !config.spotify) &&
    (!data.data.activity || !config.activity) &&
    (data.data.profile.connected_accounts.length === 0 || !config.connections)
  ) {
    card.style.display = "none";
  }

  card.style.borderRadius = config.borderRadius;
}

function getStatus(statusCode) {
  switch (statusCode) {
    case "dnd":
      return "Do Not Disturb";
    case "invisible":
      return "Invisible";
    case "online":
      return "Online";
    case "idle":
      return "Idle";
    default:
      return "Unknown";
  }
}

function handleAvatar(card, data, status) {
  if (config.avatar) {
    const avatarContainer = card.querySelector(".avatar");
    avatarContainer.innerHTML = `
      <a href="${data.data.profile.link}" target="_blank">
        ${
          config.avatar_decoration &&
          data.data.profile.avatar_decoration &&
          data.data.profile.avatar_decoration.icon_image
            ? `<img id="avatar-decoration" src="${data.data.profile.avatar_decoration.icon_image}" />`
            : ""
        }
        <img id="avatar-icon" src="${
          data.data.profile.avatar_image
        }?size=4096" />
      </a>
      ${
        config.status
          ? `<img id="avatar-status" src="/src/assets/status/${data.data.status}.png" />`
          : ""
      }
      ${
        config.status
          ? `<div class="tooltip" id="tooltip">
               <a href="${data.data.profile.link}" target="_blank">${status}</a>
             </div>`
          : ""
      }
    `;
  } else {
    const avatarContainer = card.querySelector(".avatar");
    avatarContainer.style.display = "none";
  }
}

function handleNames(card, data) {
  if (config.names) {
    const namesContainer = card.querySelector(".names");
    namesContainer.innerHTML =
      data.data.profile.display_name === undefined
        ? `<p class="username">${data.data.profile.username}</p><p class="display_name">${data.data.profile.username}</p>`
        : `<p class="username">${data.data.profile.display_name}</p><p class="display_name">${data.data.profile.username}</p>`;
  } else {
    const namesContainer = card.querySelector(".names");
    namesContainer.style.display = "none";
  }
}

function handleBadges(card, data) {
  if (config.badges) {
    const badgesContainer = card.querySelector(".badges");
    badgesContainer.innerHTML = "";
    data.data.profile.badges.forEach((badge) => {
      const badgeHTML = `
        <div class="badge-wrapper">
          <img src="${badge.icon_image}" alt="${badge.description}" />
          <span class="tooltip">${badge.description}</span>
        </div>
      `;
      badgesContainer.innerHTML += badgeHTML;
    });
  }

  if (data.data.profile.badges.length === 0 || !config.badges) {
    const activityContainer = card.querySelector(".badges");
    activityContainer.style.display = "none";
  }
}

function handleSpotify(card, data) {
  if (config.spotify) {
    if (data.data.spotify != null) {
      const activitieContainer = card.querySelector(".activitie");
      activitieContainer.innerHTML = `
        
          <img 
              src="${data.data.spotify.album_image}?size=4096" 
              alt="Album Art" 
              style="cursor: pointer;" 
              onclick="window.open('${data.data.spotify.link}', '_blank')" 
          />

          <div class="music-tooltip">
            ${data.data.spotify.album}
          </div>
        
        <div class="details">
          <span id="span1">${data.data.spotify.song}</span>
          <span id="span2">${data.data.spotify.artist}</span>
          <div class="time">
            <span id="current-time">${data.data.spotify.timestamps.progress}</span>
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
            <span id="total-time">${data.data.spotify.timestamps.duration}</span>
          </div>
        </div>
      `;

      function animateProgressBar(progress, duration) {
        const fill = card.querySelector(".progress-fill");
        fill.style.width = "0%";
        requestAnimationFrame(() => {
          const percent = (progress / duration) * 100;
          fill.style.width = `${percent}%`;
        });
      }

      animateProgressBar(
        data.data.spotify.timestamps.progress,
        data.data.spotify.timestamps.duration
      );

      const spotifyEvent = new Event("spotifyDataLoaded");
      document.dispatchEvent(spotifyEvent);
    }
  }
}

function handleActivity(card, data) {
  if (config.activity) {
    if (data.data.activity && data.data.activity.length > 0) {
      const activity = data.data.activity[0];
      const activityContainer = card.querySelector(".activitie");
      let marginTop;

      if (!activity.details && !activity.state) {
        marginTop = "20px";
      } else if (activity.details && activity.state) {
        marginTop = "0px";
      } else {
        marginTop = "10px";
      }

      activityContainer.innerHTML = `
            <img src="${activity.largeImage}?size=4096" />
            <div class="music-tooltip">${
              activity.largeText || activity.type
            }</div>
            <div class="details">
                <span id="span1" style="margin-top: ${marginTop}">${
        activity.name
      }</span>
                <span id="xd">
                    ${activity.details ? `${activity.details}<br>` : ""}${
        activity.state || ""
      }
                </span>
                <div class="time">
                    <span id="lol">${
                      activity.timestamps?.time_lapsed ?? "00:00"
                    }</span>
                </div>
            </div>`;
    }
  }
}

function handleActivityDisplay(card, data) {
  if (
    (!data.data.spotify || !config.spotify) &&
    (!data.data.activity || !config.activity)
  ) {
    const activityContainer = card.querySelector(".activitie");
    activityContainer.style.display = "none";
  }
}

function formatNumber(num) {
  if (num < 1000) return num;
  return Math.floor(num / 1000) + "k";
}

function handleGuild(card, guild_data) {
  const guildContainer = card.querySelector(".guild");
  if (config.displayGuild) {
    if (guild_data) {
      const memberCount = formatNumber(guild_data.data.member_count);

      guildContainer.innerHTML = `
            <img src="${guild_data.data.icon}" />
            <div class="server-info">
              <div class="server-name-container">
                <span class="server-name">${guild_data.data.name}</span>
                <img src="${guild_data.data.emoji}" alt="server-emoji" />
              </div>
              <div class="counter">
                <img src="/src/assets/status/online.png" />
                <span class="online">${guild_data.data.member_online_count} Online</span>
                <span>&#8203;</span><span>&#8203;</span>
                <img src="/src/assets/status/invisible.png" />
                <span class="online">${memberCount} Members</span>
              </div>
            </div>
            <span class="join" onclick="window.open('${guild_data.invite}', '_blank')">Join</span>
        `;

      guildContainer.style.display = "flex";
    } else {
      guildContainer.style.display = "none";
    }
  } else {
    guildContainer.style.display = "none";
  }
}

function handleSocial(card, data) {
  const socialContainer = card.querySelector(".social");
  socialContainer.innerHTML = "";
  const iconMap = {
    github: "/src/assets/icons/github.png",
    spotify: "/src/assets/icons/spotify.png",
    twitch: "/src/assets/icons/twitch.png",
    youtube: "/src/assets/icons/youtube.png",
    reddit: "/src/assets/icons/reddit.png",
    twitter: "/src/assets/icons/x.png",
    tiktok: "/src/assets/icons/tiktok.png",
    instagram: "/src/assets/icons/instagram.png",
    roblox: "/src/assets/icons/roblox.png",
    ebay: "/src/assets/icons/ebay.png",
    domain: "/src/assets/icons/domain.png",
    steam: "/src/assets/icons/steam.png",
  };

  if (config.connections) {
    data.data.profile.connected_accounts.forEach((account) => {
      if (iconMap.hasOwnProperty(account.type)) {
        const socialHTML = `
          <a href="${account.link || "#"}" target="_blank">
            <img src="${iconMap[account.type]}" />
            <div class="tooltip">${account.name}</div>
          </a>
        `;
        socialContainer.innerHTML += socialHTML;
      }
    });
  }

  if (
    data.data.profile.connected_accounts.length === 0 ||
    !config.connections
  ) {
    const activityContainer = card.querySelector(".social");
    activityContainer.style.display = "none";
  }
}

function handlePageTitle(data) {
  if (config.pageTitle === "") {
    document.title =
      data.data.profile.display_name || data.data.profile.username;
  } else {
    document.title = config.pageTitle;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  function showCardWithTransition(card, initialScreen) {
    const video = document.querySelector(".video-background video");
    const audio = document.getElementById("background-audio");
    const span = initialScreen.querySelector("span");
    const originalTitle = document.title; // Armazena o título original

    audio.volume = 0; // Inicializa o volume do áudio

    // Função para realizar o fade-in do áudio
    function fadeInAudio(audio, duration) {
      const step = 0.1;
      const interval = duration / (1 / step);

      let volume = 0;
      const fadeAudio = setInterval(() => {
        if (volume < 1) {
          volume += step;
          if (volume > 1) volume = 1;
          audio.volume = volume;
        } else {
          clearInterval(fadeAudio);
        }
      }, interval);
    }

    if (span) {
      span.textContent = config.message || "Clique aqui!";
    }

    initialScreen.style.pointerEvents = "none"; // Desativa interações até o título mudar

    // Observa mudanças no título da página
    const titleObserver = new MutationObserver(() => {
      if (document.title !== originalTitle) {
        initialScreen.style.pointerEvents = "auto";
        if (span) {
          span.classList.add("title-changed");
        }
        titleObserver.disconnect();
      }
    });

    // Inicia o observador no <title>
    titleObserver.observe(document.querySelector("title"), {
      childList: true,
      subtree: true,
    });

    card.classList.remove("visible");

    initialScreen.addEventListener("click", function () {
      if (document.title === originalTitle) {
        // Se o título ainda não mudou, não faz nada
        return;
      }

      // Reproduz o vídeo e o áudio com fade-in
      audio
        .play()
        .then(() => {
          fadeInAudio(audio, 0);
        })
        .catch((err) => {
          console.log("Erro ao reproduzir áudio:", err);
        });

      video.play().catch((err) => {
        console.log("Erro ao reproduzir vídeo:", err);
      });

      initialScreen.style.transition = "opacity 1s ease";
      initialScreen.style.opacity = "0";

      // Mostra card com delay se necessário
      setTimeout(() => {
        card.classList.add("visible");
      }, config.delayTime || 0);

      setTimeout(() => {
        initialScreen.style.display = "none";
      }, 1000);
    });
  }

  // Função para criar um novo card
  function createCard() {
    const cardTemplate = `
      <div class="card mouse-effect">
          <div class="avatar"></div>
          <div class="names"></div>
          <div class="badges"></div>
          <div class="activitie"></div>
          <div class="guild" style="display: none"></div>
          <div class="social"></div>
          
      </div>
    `;
    const container = document.createElement("div");
    container.innerHTML = cardTemplate;
    return container.firstElementChild;
  }

  // Função principal para inicializar todos os cards
  function initializeCards() {
    // Remove os cards existentes
    const existingCards = document.querySelectorAll(".card");
    existingCards.forEach((card) => card.remove());

    // Cria e adiciona novos cards para cada usuário
    config.userIds.forEach((userId) => {
      const card = createCard();
      document.body.appendChild(card);

      // Carrega o perfil do usuário no card
      loadUserProfile(card, userId);

      // Adiciona funcionalidade para mostrar o card com transição
      const initialScreen = document.querySelector(".initial-screen"); // Substitua pelo seletor correto
      if (initialScreen) {
        showCardWithTransition(card, initialScreen);
      }
    });

    // Carrega os dados da guilda
  }

  // Inicializa os cards quando o DOM estiver carregado
  initializeCards();
});

function Onlys(card, data) {
  // Only Avatar

  if (
    config.avatar &&
    !config.names &&
    (data.data.profile.badges.length === 0 || !config.badges) &&
    (!data.data.spotify || !config.spotify) &&
    (!data.data.activity || !config.activity) &&
    (data.data.profile.connected_accounts.length === 0 || !config.connections)
  ) {
    const Container = card.querySelector(".avatar");
    Container.style.marginBottom = "30px";
  }

  // Only Names

  if (
    !config.avatar &&
    config.names &&
    (data.data.profile.badges.length === 0 || !config.badges) &&
    (!data.data.spotify || !config.spotify) &&
    (!data.data.activity || !config.activity) &&
    (data.data.profile.connected_accounts.length === 0 || !config.connections)
  ) {
    const Container = card.querySelector(".names .display_name");
    Container.style.marginBottom = "0px";
  }

  // Only Badges

  if (
    !config.avatar &&
    !config.names &&
    config.badges &&
    !config.connections &&
    !data.data.spotify &&
    !config.activity
  ) {
    const Container = card.querySelector(".badges");
    Container.style.marginBottom = "0px";
  }

  // Only activitie

  if (
    !config.avatar &&
    !config.names &&
    !config.badges &&
    !config.connections &&
    !data.data.spotify &&
    config.activity
  ) {
    const Container = card.querySelector(".activitie");
    Container.style.marginBottom = "0px";
    Container.style.marginTop = "0px";
  }

  if (
    !config.avatar &&
    !config.names &&
    (data.data.profile.badges.length === 0 || !config.badges) &&
    (!data.data.spotify || !config.spotify) &&
    (!data.data.activity || !config.activity) &&
    (data.data.profile.connected_accounts.length != 0 || config.connections)
  ) {
    const Container = card.querySelector(".social");
    Container.style.marginBottom = "0px";
    Container.style.marginTop = "0px";
  }

  if (
    ((data.data.spotify && config.spotify) ||
      (data.data.activity && config.activity)) &&
    (data.data.profile.connected_accounts.length === 0 || !config.connections)
  ) {
    const Container = card.querySelector(".activitie");
    Container.style.marginBottom = "0px";
  }

  if (
    (data.data.profile.badges.length != 0 || config.badges) &&
    (!data.data.spotify || !config.spotify) &&
    (!data.data.activity || !config.activity) &&
    (data.data.profile.connected_accounts.length === 0 || !config.connections)
  ) {
    const Container = card.querySelector(".badges");
    Container.style.marginBottom = "0px";
  }

  if (
    data.data.profile.connected_accounts.length === 0 ||
    !config.connections
  ) {
    const Container = card.querySelector(".guild");
    Container.style.marginBottom = "0px";
  }
}
