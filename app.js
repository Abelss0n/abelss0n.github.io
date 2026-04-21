(() => {
  // ------- Helpers -------
  const $ = (sel) => document.querySelector(sel);

  async function loadData(url = new URL('data.json', document.baseURI)) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to load data.json from:', url.toString(), err);
      throw err;
    }
  }

  function showLoadError(err) {
    const bioEl = $('#bio');
    if (bioEl) {
      bioEl.innerHTML = `<p class="muted">Unable to load profile data. Please try again later.</p>`;
    }
    console.error(err);
  }

  // --- Education grouped rendering with counts ---
  function renderEduGroupWithCount(rootId, countId, items = []) {
    const root = document.getElementById(rootId);
    const countEl = document.getElementById(countId);
    if (!root || !countEl) return;

    root.innerHTML = '';
    (items || []).forEach(item => {
      const div = document.createElement('div');
      div.className = 'edu';
      div.innerHTML = `
        <img src="${item.badge}" alt="${item.title} badge" />
        <div>
          <h4>${item.title}</h4>
          <p>${item.date || ''}</p>
          ${item.issuer ? `<p class="muted">${item.issuer}</p>` : ''}
        </div>
      `;
      root.appendChild(div);
    });

    // Update count
    countEl.textContent = String(items.length);

    // Optionally hide the whole group if empty:
    const wrapper = root.closest('.edugroup');
    if (wrapper) wrapper.style.display = items.length ? '' : 'none';
  }

  function groupEducation(list = []) {
    const norm = (k) => (k || 'certification').toLowerCase();
    const groups = { education: [], certification: [], training: [] };
    list.forEach(item => {
      const kind = norm(item.kind);
      if (groups[kind]) groups[kind].push(item);
      else groups.certification.push(item); // fallback
    });
    return groups;
  }

  function renderProjects(projects = []) {
    const root = document.getElementById('projects-list');
    if (!root) return;
    root.innerHTML = '';

    projects.forEach(p => {
      const details = document.createElement('details');
      details.className = 'edugroup'; // reuse same look & feel
      // closed by default, so no `open` attribute

      details.innerHTML = `
        <summary>
          <span class="chev" aria-hidden="true">▸</span>
          <span class="label">${p.name || 'Untitled Project'}</span>
        </summary>
        <div class="proj-body">
          ${p.description ? `<p>${p.description}</p>` : ''}
          ${p.image ? `<div class="proj-img"><img src="${p.image}" alt="${p.name} preview" /></div>` : ''}
          ${p.url ? `
            <p style="margin-top:10px;">
              <a class="proj-link" href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="Open project: ${p.name}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"/>
                </svg>
                Visit project
              </a>
            </p>` : ''}
        </div>
      `;

      root.appendChild(details);
    });
  }

  // ------- Hydration -------
  function hydrate(DATA) {
    const nameNorm = document.getElementById('name-normal');
    const nameAure = document.getElementById('name-aurebesh');
    if (nameNorm)  nameNorm.textContent  = DATA.name || 'Your Name';
    if (nameAure)  nameAure.textContent  = DATA.name || 'Your Name';
    const initialsEl = $('#initials');
    const taglineEl = $('#tagline');
    const bioEl = $('#bio');
    const contactIcons = $('#contact-icons');
    const yearEl = $('#year');

    const photoWrap = document.getElementById('profile-photo-wrap');
    const photoEl   = document.getElementById('profile-photo');

    if (photoEl && DATA.photo) {
      photoEl.src = DATA.photo;
      photoEl.alt = `Portrait of ${DATA.name || 'me'}`;
      if (photoWrap) photoWrap.hidden = false;
    } else if (photoWrap) {
      photoWrap.hidden = true;
    }

    // if (nameEl) nameEl.textContent = DATA.name || 'Your Name';
    if (initialsEl) {
      initialsEl.textContent = (DATA.initials || (DATA.name || 'YN')
        .split(' ').map(w => w[0]).join(''))
        .slice(0, 3).toUpperCase();
    }
    if (taglineEl) taglineEl.textContent = DATA.tagline || '';
    if (bioEl) {
      bioEl.innerHTML = (DATA.bio || '')
        .split(/\n\n+/)
        .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
    }
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Home hero content ---
    const homeTitle = document.getElementById('home-title');
    const homeSubtitle = document.getElementById('home-subtitle');
    if (homeTitle)  homeTitle.textContent = `Howdy, I am ${DATA.name || 'Abel Garcia'}.`;
    if (homeSubtitle) {
      homeSubtitle.textContent = "Criminal Investigator | Digital Forensic Technician | Hobby Developer | Star Wars Fan.";
    }

    // --- Home icons (reuse same markup as contact icons) ---
    const homeIcons = document.getElementById('home-icons');
    if (homeIcons) {
      homeIcons.innerHTML = `
        <a href="mailto:${DATA.emails?.tech || ''}" aria-label="Tech Email" title="Tech Email: ${DATA.emails?.tech || ''}">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10h-2V5H5v10H3V5Zm-1 12h20v2H2v-2Z"/></svg>
        </a>
        <a href="mailto:${DATA.emails?.leo || ''}" aria-label="LEO Email" title="LEO Email: ${DATA.emails?.leo || ''}">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M12 2 4 5v6c0 5.25 3.5 10.74 8 12 4.5-1.26 8-6.75 8-12V5l-8-3Zm0 2.18L18 6v4.82c0 4.18-2.79 8.57-6 9.9-3.21-1.33-6-5.72-6-9.9V6l6-1.82Z"/></svg>
        </a>
        <a href="${DATA.social?.github || '#'}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1.01.07 1.55 1.05 1.55 1.05.9 1.58 2.37 1.12 2.95.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.76 1.05a9.22 9.22 0 0 1 5.02 0c1.92-1.32 2.76-1.05 2.76-1.05.55 1.41.21 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.67.94.67 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/></svg>
        </a>
        <a href="${DATA.social?.linkedin || '#'}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M6.94 8.5A1.56 1.56 0 1 0 6.94 5.38a1.56 1.56 0 0 0 0 3.12ZM5.56 9.69h2.76V18H5.56V9.7Zm4.5 0h2.65v1.13h.04c.37-.7 1.27-1.44 2.62-1.44 2.8 0 3.31 1.84 3.31 4.22V18h-2.76v-3.9c0-.93-.02-2.13-1.3-2.13-1.3 0-1.5 1.01-1.5 2.06V18h-2.76V9.7Z"/></svg>
        </a>
        <a href="${DATA.social?.instagram || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.2A2.8 2.8 0 1 0 12 15.8 2.8 2.8 0 0 0 12 9.2Zm5-1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/></svg>
        </a>
      `;
    }


    // Contact icons with hover tooltips
    if (contactIcons) {
      contactIcons.innerHTML = `
        <a href="mailto:${DATA.emails?.tech || ''}" aria-label="Tech Email" title="Tech Email: ${DATA.emails?.tech || ''}">
          <!-- Laptop SVG -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10h-2V5H5v10H3V5Zm-1 12h20v2H2v-2Z"/>
          </svg>
        </a>
        <a href="mailto:${DATA.emails?.leo || ''}" aria-label="LEO Email" title="LEO Email: ${DATA.emails?.leo || ''}">
          <!-- Shield/Badge SVG -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
               xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M12 2 4 5v6c0 5.25 3.5 10.74 8 12 4.5-1.26 8-6.75 8-12V5l-8-3Zm0 2.18L18 6v4.82c0 4.18-2.79 8.57-6 9.9-3.21-1.33-6-5.72-6-9.9V6l6-1.82Z"/>
          </svg>
        </a>
        <a href="${DATA.social?.github || '#'}" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">
          <!-- GitHub SVG -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.73.5.09.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.17-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1.01.07 1.55 1.05 1.55 1.05.9 1.58 2.37 1.12 2.95.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.72 0 0 .84-.27 2.76 1.05a9.22 9.22 0 0 1 5.02 0c1.92-1.32 2.76-1.05 2.76-1.05.55 1.41.21 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.95-2.34 4.81-4.57 5.07.36.32.67.94.67 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"/>
          </svg>
        </a>
        <a href="${DATA.social?.linkedin || '#'}" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn">
          <!-- LinkedIn SVG -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M6.94 8.5A1.56 1.56 0 1 0 6.94 5.38a1.56 1.56 0 0 0 0 3.12ZM5.56 9.69h2.76V18H5.56V9.7Zm4.5 0h2.65v1.13h.04c.37-.7 1.27-1.44 2.62-1.44 2.8 0 3.31 1.84 3.31 4.22V18h-2.76v-3.9c0-.93-.02-2.13-1.3-2.13-1.3 0-1.5 1.01-1.5 2.06V18h-2.76V9.7Z"/>
          </svg>
        </a>
        <a href="${DATA.social?.instagram || '#'}" target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram">
          <!-- Instagram SVG -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path fill="currentColor" d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2.2A2.8 2.8 0 1 0 12 15.8 2.8 2.8 0 0 0 12 9.2Zm5-1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
          </svg>
        </a>
      `;
    }

    // Education groups
    const groups = groupEducation(DATA.education || []);
    renderEduGroupWithCount('edu-education', 'count-education', groups.education);
    renderEduGroupWithCount('edu-certification', 'count-certification', groups.certification);
    renderEduGroupWithCount('edu-training', 'count-training', groups.training);

    // Work timeline
    const workRoot = $('#work-list');
    if (workRoot) {
      workRoot.innerHTML = '';
      (DATA.work || []).forEach(job => {
        const wrap = document.createElement('article');
        wrap.className = 'job';
        const bullets = (job.bullets || []).map(b => `<li>${b}</li>`).join('');
        wrap.innerHTML = `
          <h4>${job.role} · ${job.org}</h4>
          <div class="meta">${job.period}${job.location ? ' • ' + job.location : ''}</div>
          ${bullets ? `<ul>${bullets}</ul>` : ''}
        `;
        workRoot.appendChild(wrap);
      });
    }

    // Projects
    renderProjects(DATA.projects || []);
  }



  // ------- Tabs -------
  function setActive(targetId) {
    document.querySelectorAll('section.card').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(targetId);
    if (target) target.classList.add('active');
    document.querySelectorAll('.nav .tab').forEach(btn => {
      btn.setAttribute('aria-current', btn.dataset.target === targetId ? 'page' : 'false');
    });
    const h = target && target.querySelector('h2');
    if (h && typeof h.focus === 'function') h.focus();
  }

  function wireTabs() {
    document.querySelectorAll('.nav .tab').forEach(btn => {
      btn.addEventListener('click', () => setActive(btn.dataset.target));
    });
  }

  // ------- Boot -------
  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const data = await loadData(); // change to absolute URL later if you host off-site
      hydrate(data);
    } catch (e) {
      showLoadError(e);
    } finally {
      wireTabs();
      setActive('home');
    }
  });
})();
