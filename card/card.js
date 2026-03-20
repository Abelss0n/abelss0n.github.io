const dataPath = "../data.json";

function toFirstParagraph(text) {
  if (!text) return "";
  return text.split(/\n\s*\n/)[0].trim();
}

function createActionButton(label, href) {
  const anchor = document.createElement("a");
  anchor.className = "action-btn";
  anchor.href = href;
  anchor.target = href.startsWith("mailto:") ? "_self" : "_blank";
  anchor.rel = href.startsWith("mailto:") ? "" : "noopener noreferrer";
  anchor.textContent = label;
  return anchor;
}

function buildCertificationsList(certifications) {
  if (!certifications.length) {
    return "<p>No active certifications listed right now.</p>";
  }

  const items = certifications
    .map((cert) => `<li><strong>${cert.title}</strong><br />${cert.issuer}</li>`)
    .join("");

  return `<ul>${items}</ul>`;
}

async function initCard() {
  const photoEl = document.getElementById("card-photo");
  const nameEl = document.getElementById("card-name");
  const taglineEl = document.getElementById("card-tagline");
  const summaryEl = document.getElementById("card-summary");
  const actionsEl = document.getElementById("action-buttons");
  const certToggleEl = document.getElementById("cert-toggle");
  const certListEl = document.getElementById("cert-list");

  try {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to load profile data (${response.status})`);
    }

    const data = await response.json();

    nameEl.textContent = data.name || "Abel Garcia";
    taglineEl.textContent = data.tagline || "Digital Forensics & Information Technology";
    summaryEl.textContent = toFirstParagraph(data.bio) || "Technology-minded investigator and digital forensics professional.";

    if (data.photo) {
      photoEl.src = `../${data.photo}`;
    }

    const buttons = [];
    if (data.emails?.tech) {
      buttons.push(createActionButton("Email Me", `mailto:${data.emails.tech}`));
    }
    if (data.emails?.leo) {
      buttons.push(createActionButton("Law Enforcement Contact", `mailto:${data.emails.leo}`));
    }
    if (data.social?.github) {
      buttons.push(createActionButton("GitHub", data.social.github));
    }
    if (data.social?.instagram) {
      buttons.push(createActionButton("Instagram", data.social.instagram));
    }

    actionsEl.replaceChildren(...buttons);

    const activeCerts = (data.education || []).filter((entry) => {
      return entry.kind === "certification" && /active/i.test(entry.date || "");
    });

    certListEl.innerHTML = buildCertificationsList(activeCerts);

    certToggleEl.addEventListener("click", () => {
      const expanded = certToggleEl.getAttribute("aria-expanded") === "true";
      certToggleEl.setAttribute("aria-expanded", String(!expanded));
      certListEl.hidden = expanded;
      certToggleEl.textContent = expanded ? "View Current Certifications" : "Hide Current Certifications";
    });
  } catch (error) {
    summaryEl.textContent = "Profile data could not be loaded. Please try again later.";
    actionsEl.innerHTML = "<p>Contact links are temporarily unavailable.</p>";
    certToggleEl.hidden = true;
    certListEl.hidden = true;
    // Keep error visible for easier debugging in browser dev tools.
    console.error(error);
  }
}

initCard();
