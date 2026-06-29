const FLAGS = {
    "South Africa": "za",
    Canada: "ca",
    Brazil: "br",
    Japan: "jp",
    Germany: "de",
    Paraguay: "py",
    Netherlands: "nl",
    Morocco: "ma",
    "Ivory Coast": "ci",
    Norway: "no",
    France: "fr",
    Sweden: "se",
    Mexico: "mx",
    Ecuador: "ec",
    England: "gb-eng",
    "Cabo Verde": "cv",
    Egypt: "eg",
    "United States": "us",
    "Bosnia & Herz.": "ba",
    Spain: "es",
    Austria: "at",
    Switzerland: "ch",
    Belgium: "be",
    Portugal: "pt",
    Ghana: "gh",
    Colombia: "co",
    Croatia: "hr",
    Argentina: "ar",
    Uruguay: "uy",
    Australia: "au",
    "DR Congo": "cd",
    Senegal: "sn",
    Algeria: "dz",
};

const TEAMS = {
    m1: ["South Africa", "Canada"],
    m2: ["Netherlands", "Morocco"],
    m3: ["Germany", "Paraguay"],
    m4: ["France", "Sweden"],
    m5: ["Belgium", "Senegal"],
    m6: ["United States", "Bosnia & Herz."],
    m7: ["Spain", "Austria"],
    m8: ["Portugal", "Croatia"],
    m9: ["Brazil", "Japan"],
    m10: ["Ivory Coast", "Norway"],
    m11: ["Mexico", "Ecuador"],
    m12: ["England", "DR Congo"],
    m13: ["Switzerland", "Algeria"],
    m14: ["Colombia", "Ghana"],
    m15: ["Australia", "Egypt"],
    m16: ["Argentina", "Cabo Verde"],
};

// bracket structure
// Each match: { id, num, date, time, venue, col, nextMatch, nextSlot, loserMatch, loserSlot }
// nextMatch = which match the winner feeds into
// nextSlot  = which slot (1 or 2) in that match
// loserMatch/loserSlot = for SF matches → 3rd place

let MATCHES = [];
const matchMap = {};

async function loadData() {
    const response = await fetch("./matches.json");
    MATCHES = await response.json();

    MATCHES.forEach((m) => {
        const col = document.getElementById(m.col);
        if (col) col.appendChild(makeMatch(m));
        matchMap[m.id] = m;
    });

    fillKnownTeams();
    
    document.getElementById("final-time").textContent = formatMatchMeta({
        time: "2026-07-19T19:00:00Z",
    });

    document.getElementById("3RD-time").textContent = formatMatchMeta({
        time: "2026-07-18T19:00:00Z",
    });
    
    scheduleConnectorDraw();
}

document.addEventListener("DOMContentLoaded", loadData);

// ── Draw SVG connectors ──────────────────────────────────────────────

// Returns the mid-Y of a match card's right or left edge, relative to .main-container
function matchMidY(matchId) {
    const el = document.getElementById("match-" + matchId);
    if (!el) return null;
    const container = document.querySelector(".main-container");
    const er = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    return er.top - cr.top + er.height / 2;
}

function matchEdgeX(matchId, side) {
    const el = document.getElementById("match-" + matchId);
    if (!el) return null;
    const container = document.querySelector(".main-container");
    const er = el.getBoundingClientRect();
    const cr = container.getBoundingClientRect();
    return side === "right" ? er.right - cr.left : er.left - cr.left;
}

// Draw an elbow connector: from right edge of `fromId` → left edge of `toId`, slot-aware
// slot 1 = upper input, slot 2 = lower input of the target match
function drawConnector(svg, fromId, toId, toSlot) {
    const fromEl = document.getElementById("match-" + fromId);
    const toEl = document.getElementById("match-" + toId);
    if (!svg || !fromEl || !toEl) return null;

    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();

    const goingLeftToRight = fromRect.left < toRect.left;

    const x1 = matchEdgeX(fromId, goingLeftToRight ? "right" : "left");
    const x2 = matchEdgeX(toId, goingLeftToRight ? "left" : "right");
    const y1 = matchMidY(fromId);

    // target the specific team-row mid-Y for the slot
    const targetRow = document.getElementById("row-" + toId + "-" + toSlot);
    const container = document.querySelector(".main-container");
    let y2 = matchMidY(toId);

    if (targetRow && container) {
        const rr = targetRow.getBoundingClientRect();
        const cr = container.getBoundingClientRect();
        y2 = rr.top - cr.top + rr.height / 2;
    }

    if (x1 == null || y1 == null || x2 == null || y2 == null) return null;

    const midX = (x1 + x2) / 2;
    const d = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "connector");
    path.dataset.from = fromId;
    path.dataset.to = toId;
    path.dataset.slot = toSlot;
    svg.appendChild(path);

    return path;
}

// Draw connectors for each match that feeds into another
const connectorPaths = {}; // key: `${fromId}→${toId}:${slot}`

function drawAllConnectors() {
    const svg = document.getElementById("connector-layer");
    svg.innerHTML = "";

    MATCHES.forEach((m) => {
        if (!m.nextMatch || m.nextMatch === "FINAL") return;
        const key = `${m.id}→${m.nextMatch}:${m.nextSlot}`;
        const path = drawConnector(svg, m.id, m.nextMatch, m.nextSlot, false);
        if (path) connectorPaths[key] = path;
    });
}

function scheduleConnectorDraw() {
    // Wait for layout then draw
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            drawAllConnectors();
        });
    });
}

window.addEventListener("resize", () => {
    drawAllConnectors();
});

function formatMatchMeta(m) {
    if (typeof m.time === "string" && /^\d{4}-\d{2}-\d{2}T/.test(m.time)) {
        const dt = new Date(m.time);
        const date = dt.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
        const time = dt.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
        return `${date} · ${time}`;
    }

    return `${m.date || ""}${m.date && m.time ? " · " : ""}${m.time || ""}`;
}

function makeMatch(m) {
    const div = document.createElement("div");
    div.className = "match" + (m.cssClass ? " " + m.cssClass : "");
    div.id = "match-" + m.id;
    div.innerHTML = `
                            <div class="match-meta">
                                <span class="match-num">${formatMatchMeta(m)}</span>
                            </div>
                            <div class="team-row" id="row-${m.id}-1" data-match="${m.id}" data-slot="1">
                                <input class="team-input" id="t-${m.id}-1" placeholder="—" />
                            </div>
                            <div class="team-row" id="row-${m.id}-2" data-match="${m.id}" data-slot="2">
                                <input class="team-input" id="t-${m.id}-2" placeholder="—" />
                            </div>`;
    return div;
}

// Set a team value + flag
function setTeam(matchId, slot, name, cls) {
    const inp = document.getElementById("t-" + matchId + "-" + slot);
    if (!inp) return;

    inp.value = name;
    inp.className = "team-input" + (cls ? " " + cls : "");

    const row = inp.closest(".team-row");
    let flg = row.querySelector(".team-flag");

    if (!flg) {
        flg = document.createElement("span");
        flg.className = "team-flag";
        flg.id = "flag-" + matchId + "-" + slot;
        row.insertBefore(flg, inp);
    }
    flg.innerHTML = FLAGS[name]
        ? "<img src='https://flagcdn.com/w20/" +
          FLAGS[name] +
          ".png' srcset='https://flagcdn.com/w40/" +
          FLAGS[name] +
          ".png 2x, https://flagcdn.com/w60/" +
          FLAGS[name] +
          ".png 3x' alt='" +
          name +
          "' />"
        : "";
}

// Advance winner to next round
function advance(matchId, slot) {
    const m = matchMap[matchId];
    if (!m) {
        if (matchId === "FINAL") {
            const name = document.getElementById("t-FINAL-" + slot)?.value;
            if (!name) return;
            // highlight winner row
            markWinner("FINAL", slot);
            flashRow("FINAL", slot);
        }
        if (matchId === "3RD") {
            const name = document.getElementById("t-3RD-" + slot)?.value;
            if (!name) return;
            // highlight winner row
            markWinner("3RD", slot);
            flashRow("3RD", slot);
        }
        return;
    }
    const name = document.getElementById("t-" + matchId + "-" + slot)?.value;
    if (!name) return;

    markWinner(matchId, slot);
    flashRow(matchId, slot);

    // winner → next match
    if (m.nextMatch) {
        setTeam(m.nextMatch, m.nextSlot, name, "");
        flashRow(m.nextMatch, m.nextSlot);
    }
    // loser → 3rd place (SF only)
    if (m.loserMatch) {
        const loserSlot = slot === 1 ? 2 : 1; // the other team in the same match
        const otherName = document.getElementById(
            "t-" + matchId + "-" + (slot === 1 ? 2 : 1),
        )?.value;
        if (otherName) {
            setTeam(m.loserMatch, m.loserSlot, otherName, "");
            flashRow(m.loserMatch, m.loserSlot);
        }
    }
}

function markWinner(matchId, slot) {
    [1, 2].forEach((s) => {
        const row = document.getElementById("row-" + matchId + "-" + s);
        if (row) row.classList.remove("winner-row");
    });
    const winRow = document.getElementById("row-" + matchId + "-" + slot);
    if (winRow) winRow.classList.add("winner-row");
}

function flashRow(matchId, slot) {
    const row = document.getElementById("row-" + matchId + "-" + slot);
    if (!row) return;
    row.classList.remove("just-advanced");
    void row.offsetWidth;
    row.classList.add("just-advanced");
    setTimeout(() => row.classList.remove("just-advanced"), 500);
}

// Double-click delegation
document.addEventListener("dblclick", (e) => {
    window.getSelection()?.removeAllRanges();
    const row = e.target.closest(".team-row[data-match]");
    if (!row) return;
    e.preventDefault();
    advance(row.dataset.match, parseInt(row.dataset.slot));
});

// Fill confirmed teams
function fillKnownTeams() {
    Object.entries(TEAMS).forEach(([mid, teams]) => {
        [1, 2].forEach((n, i) => setTeam(mid, n, teams[i], "confirmed"));
    });
}

function clearAll() {
    if (!confirm("Reset entire bracket?")) return;
    document.querySelectorAll("input.team-input").forEach((el) => {
        el.value = "";
        el.className = "team-input";
    });
    document.querySelectorAll(".team-flag").forEach((el) => el.remove());
    document
        .querySelectorAll(".team-row")
        .forEach((el) => el.classList.remove("winner-row", "just-advanced"));
    fillKnownTeams();
}

function highlightPreviousWinner(currentMatchId, typedName) {
    const parentMatch = MATCHES.find((m) => {
        if (m.nextMatch !== currentMatchId) return false;

        return [1, 2].some((slot) => {
            const value = document
                .getElementById(`t-${m.id}-${slot}`)
                ?.value.trim();
            return (
                value &&
                value.trim().toLowerCase() === typedName.trim().toLowerCase()
            );
        });
    });

    if (!parentMatch) return;

    const winningSlot = [1, 2].find((slot) => {
        const value = document
            .getElementById(`t-${parentMatch.id}-${slot}`)
            ?.value.trim();
        return (
            value &&
            value.trim().toLowerCase() === typedName.trim().toLowerCase()
        );
    });

    if (!winningSlot) return;

    markWinner(parentMatch.id, winningSlot);
    flashRow(parentMatch.id, winningSlot);
}

// Allow manual typing to update flag
document.addEventListener("input", (e) => {
    if (!e.target.classList.contains("team-input")) return;

    const input = e.target;
    const row = input.closest(".team-row");
    if (!row) return;

    const name = input.value.trim();

    const key = Object.keys(FLAGS).find(
        (country) => country.toLowerCase() === name.toLowerCase(),
    );
    const code = key ? FLAGS[key] : null;

    let flg = row.querySelector(".team-flag");

    if (code) {
        if (!flg) {
            flg = document.createElement("span");
            flg.className = "team-flag";
            row.insertBefore(flg, input);
        }

        flg.innerHTML = `
                        <img src="https://flagcdn.com/w20/${code}.png"
                            srcset="https://flagcdn.com/w40/${code}.png 2x,
                                    https://flagcdn.com/w60/${code}.png 3x"
                            alt="${name}">
                        `;

        highlightPreviousWinner(row.dataset.match, name);
    } else if (flg) {
        flg.remove();
    }

    input.classList.remove("confirmed", "winner");
});
