import { config } from "/config/config.js";

function injectCustomCSS() {
  const style = document.createElement("style");
  style.textContent = `
        :root {
            --background-color: ${config.backgroundColor};
            --card-background-color: ${config.cardBackgroundColor};
            --guild-background-color: ${config.guildBackgroundColor};
            --neon-color: ${config.shadowColor};
            --name-color: ${config.nameColor};
            --name-highlight-color: ${config.nameHighlightColor};
            --text-color: ${config.textColor};
        }
    `;
  document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", injectCustomCSS);
