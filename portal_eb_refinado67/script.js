// Navegação responsiva e acessível
const toggle = document.getElementById("menuToggle");
const nav = document.getElementById("mainNav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.textContent = isOpen ? "✕" : "☰";
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.textContent = "☰";
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      toggle.textContent = "☰";
      toggle.setAttribute("aria-expanded", "false");
      toggle.focus();
    }
  });
}

// Transição suave entre páginas internas
document.body.classList.add("page-entering");
window.addEventListener("pageshow", () => document.body.classList.remove("page-leaving"));

document.querySelectorAll('a[href]').forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#") || link.target === "_blank" ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    let target;
    try { target = new URL(href, location.href); } catch { return; }
    if (target.origin !== location.origin || target.pathname === location.pathname) return;

    event.preventDefault();
    document.body.classList.remove("page-entering");
    document.body.classList.add("page-leaving");
    setTimeout(() => location.href = target.href, 350);
  });
});

// Animação de entrada dos elementos
const revealTargets = document.querySelectorAll(
  ".content h2,.content>p,.cards,.card,.dark-panel,.feature-strip,.notice-item,.faq,footer"
);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealTargets.forEach(element => {
    element.classList.add("reveal");
    observer.observe(element);
  });
} else {
  revealTargets.forEach(element => element.classList.add("visible"));
}

// Ano atual e botão voltar ao topo
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const backTop = document.createElement("button");
backTop.className = "back-top";
backTop.type = "button";
backTop.setAttribute("aria-label", "Voltar ao topo");
backTop.textContent = "↑";
document.body.appendChild(backTop);

window.addEventListener("scroll", () => {
  backTop.classList.toggle("show", window.scrollY > 450);
}, { passive: true });
backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Formulário demonstrativo de promoção — não altera dados no Roblox.
const form = document.getElementById("promotionForm");
if (form) {
  const ranks = [
    "Recruta", "Soldado", "Cabo", "3º Sargento", "2º Sargento",
    "1º Sargento", "Subtenente", "Aspirante", "2º Tenente",
    "1º Tenente", "Capitão", "Major", "Tenente-Coronel",
    "Coronel", "General de Brigada", "General de Divisão",
    "General de Exército"
  ];

  const current = document.getElementById("currentRank");
  const next = document.getElementById("newRank");
  ranks.forEach(rank => {
    current.add(new Option(rank, rank));
    next.add(new Option(rank, rank));
  });

  const result = document.getElementById("promotionResult");
  const history = document.getElementById("promotionHistory");
  const STORAGE_KEY = "ebPromotionRecords";

  function getRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function renderHistory() {
    if (!history) return;
    const records = getRecords();
    history.replaceChildren();

    if (!records.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Nenhum registro salvo neste navegador.";
      history.appendChild(empty);
      return;
    }

    records.slice(0, 10).forEach(item => {
      const row = document.createElement("div");
      row.className = "history-item";
      row.textContent = `${item.user}: ${item.oldRank} → ${item.nextRank} | Responsável: ${item.promoter} | ${item.date}`;
      history.appendChild(row);
    });
  }

  renderHistory();

  form.addEventListener("submit", event => {
    event.preventDefault();

    const user = document.getElementById("robloxUser").value.trim();
    const oldRank = current.value;
    const newRank = next.value;
    const promoter = document.getElementById("promoter").value.trim();
    const reason = document.getElementById("promotionReason").value.trim();

    if (!user || !oldRank || !newRank || !promoter) return;

    if (ranks.indexOf(newRank) <= ranks.indexOf(oldRank)) {
      alert("A nova patente precisa estar acima da patente atual.");
      return;
    }

    const record = {
      user, oldRank, nextRank: newRank, promoter, reason,
      date: new Date().toLocaleString("pt-BR")
    };

    const records = getRecords();
    records.unshift(record);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 100)));
    } catch {
      alert("Não foi possível salvar o registro neste navegador.");
      return;
    }

    result.hidden = false;
    result.textContent =
      `REGISTRO PREPARADO\n\nIntegrante: ${user}\nPatente anterior: ${oldRank}\nNova patente: ${newRank}\nResponsável: ${promoter}\nData: ${record.date}${reason ? `\nObservações: ${reason}` : ""}`;

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copiar registro";
    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(result.textContent.replace("Copiar registro", "").trim());
        copyButton.textContent = "Copiado!";
      } catch {
        copyButton.textContent = "Não foi possível copiar";
      }
    });
    result.append(document.createElement("br"), copyButton);

    renderHistory();
    form.reset();
  });
}
