(() => {
  "use strict";

  const STR = {
    ru: {
      title: "Чек-лист квартиры",
      hint: "Нажмите на вещь, если она на месте и цела. Ошиблись? Нажмите ещё раз.",
      restore: "нажмите, чтобы вернуть",
      reset: "Новый жилец",
      finish: "Проверить",
      confirmReset: "Начать новую проверку? Все отметки будут сброшены.",
      undo: "Ой, вернуть",
      unchecked: "{item} — снова в списке 🔄",
      quips: [
        "{item} — проверено ✅",
        "{item} — на базе 🫡",
        "{item} — без происшествий 😌",
        "{item} — галочка поставлена ✔️",
        "{item} — пережило ещё одного жильца 💪",
      ],
      allGoodTitle: "Всё на месте!",
      allGoodText: "Ничего не пропало и не сломалось. Квартира готова к новому жильцу — можно выдыхать.",
      missingTitle: "Кое-чего не хватает",
      missingText: "Эти вещи не отмечены — потеряны, сломаны или просто очень хорошо спрятались:",
      emptyTitle: "Вы ещё ничего не проверили",
      emptyText: "Пройдитесь по квартире и нажимайте на вещи, которые на месте.",
      close: "Продолжить проверку",
      closeDone: "Ура!",
    },
    en: {
      title: "Apartment checklist",
      hint: "Tap an item if it’s there and intact. Tapped by mistake? Tap it again.",
      restore: "tap to restore",
      reset: "New tenant",
      finish: "Check",
      confirmReset: "Start a new check? All marks will be cleared.",
      undo: "Oops, undo",
      unchecked: "{item} — back on the list 🔄",
      quips: [
        "{item} — present and accounted for ✅",
        "{item} — reporting for duty 🫡",
        "{item} — no drama 😌",
        "{item} — ticked off ✔️",
        "{item} — survived another tenant 💪",
      ],
      allGoodTitle: "Everything’s here!",
      allGoodText: "Nothing lost, nothing broken. The apartment is ready for the next tenant — you can breathe out.",
      missingTitle: "Something’s missing",
      missingText: "These items aren’t checked — lost, broken, or just really good at hide-and-seek:",
      emptyTitle: "Nothing checked yet",
      emptyText: "Walk around the apartment and tap the items that are in place.",
      close: "Keep checking",
      closeDone: "Hooray!",
    },
  };

  const MOODS = ["😬", "🧐", "🙂", "😎", "🥳"];
  const CONFETTI = ["🎉", "✨", "🎊", "⭐", "🏠", "🔑"];

  const apartments = (window.INVENTORY && window.INVENTORY.apartments) || [];
  const $ = (id) => document.getElementById(id);
  const els = {
    title: $("title"), lang: $("lang"), apt: $("apt"), hint: $("hint"),
    mood: $("mood"), barFill: $("bar-fill"), count: $("count"), grid: $("grid"),
    reset: $("reset"), finish: $("finish"),
    toast: $("toast"), toastText: $("toast-text"), toastUndo: $("toast-undo"),
    result: $("result"), resultEmoji: $("result-emoji"), resultTitle: $("result-title"),
    resultText: $("result-text"), resultList: $("result-list"), resultClose: $("result-close"),
  };

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
    },
  };

  let lang = store.get("lang", "ru") === "en" ? "en" : "ru";
  let apt = null;
  let checked = new Set();
  let lastAction = null;
  let toastTimer = 0;

  const t = (key) => STR[lang][key];
  const fill = (s, item) => s.replace("{item}", item.title[lang]);
  const stateKey = () => "checked:" + apt.id;

  function pickApartment() {
    const id = decodeURIComponent(location.hash.slice(1));
    return apartments.find((a) => a.id === id) || apartments[0];
  }

  function loadApartment() {
    apt = pickApartment();
    if (!apt) { els.grid.textContent = "No apartments in inventory.js"; return; }
    const ids = new Set(apt.items.map((i) => i.id));
    checked = new Set(store.get(stateKey(), []).filter((id) => ids.has(id)));
    lastAction = null;
    hideToast();
    renderAll();
  }

  function save() { store.set(stateKey(), [...checked]); }

  // ---------- rendering ----------
  function renderAll() {
    document.documentElement.lang = lang;
    document.title = t("title");
    els.title.textContent = t("title");
    els.hint.textContent = t("hint");
    els.reset.textContent = t("reset");
    els.finish.textContent = t("finish");
    els.toastUndo.textContent = t("undo");
    els.lang.textContent = lang === "ru" ? "EN" : "RU";
    renderAptSelect();
    renderGrid();
    renderProgress(false);
  }

  function renderAptSelect() {
    els.apt.hidden = apartments.length < 2;
    els.apt.replaceChildren(...apartments.map((a) => {
      const o = document.createElement("option");
      o.value = a.id;
      o.textContent = a.title[lang];
      o.selected = a.id === apt.id;
      return o;
    }));
  }

  function renderGrid() {
    const frag = document.createDocumentFragment();
    for (const item of apt.items) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "card";
      card.dataset.id = item.id;

      const pic = document.createElement("div");
      pic.className = "pic";
      if (item.img) {
        const img = document.createElement("img");
        img.src = item.img;
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 256;
        img.height = 256;
        pic.append(img);
      } else {
        const e = document.createElement("span");
        e.className = "emoji";
        e.setAttribute("aria-hidden", "true");
        e.textContent = item.emoji || "📦";
        pic.append(e);
      }

      const title = document.createElement("span");
      title.className = "title";
      title.textContent = item.title[lang];

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.setAttribute("aria-hidden", "true");
      badge.textContent = "✓";

      const restore = document.createElement("span");
      restore.className = "restore";
      restore.textContent = t("restore");

      card.append(badge, pic, title, restore);
      updateCard(card, item.id);
      frag.append(card);
    }
    els.grid.replaceChildren(frag);
  }

  function updateCard(card, id) {
    const done = checked.has(id);
    card.classList.toggle("done", done);
    card.setAttribute("aria-pressed", String(done));
  }

  function renderProgress(bump) {
    const total = apt.items.length;
    const n = checked.size;
    const ratio = total ? n / total : 0;
    els.count.textContent = n + " / " + total;
    els.barFill.style.width = ratio * 100 + "%";
    els.barFill.style.backgroundPosition = 100 - ratio * 100 + "% 0";
    els.mood.textContent = MOODS[Math.min(MOODS.length - 1, Math.floor(ratio * (MOODS.length - 1) + 1e-9))];
    if (bump) {
      els.mood.classList.remove("bump");
      void els.mood.offsetWidth;
      els.mood.classList.add("bump");
      setTimeout(() => els.mood.classList.remove("bump"), 250);
    }
  }

  // ---------- actions ----------
  function toggle(id, fromUndo) {
    const item = apt.items.find((i) => i.id === id);
    if (!item) return;
    const nowDone = !checked.has(id);
    nowDone ? checked.add(id) : checked.delete(id);
    save();

    const card = els.grid.querySelector('[data-id="' + CSS.escape(id) + '"]');
    if (card) {
      updateCard(card, id);
      if (nowDone) {
        card.classList.remove("pop");
        void card.offsetWidth;
        card.classList.add("pop");
      }
    }
    renderProgress(true);
    if (navigator.vibrate) navigator.vibrate(nowDone ? 12 : [8, 40, 8]);

    if (fromUndo) { hideToast(); return; }
    lastAction = id;
    const quips = t("quips");
    showToast(nowDone ? fill(quips[Math.floor(Math.random() * quips.length)], item) : fill(t("unchecked"), item));

    if (nowDone && checked.size === apt.items.length) setTimeout(finish, 450);
  }

  function showToast(text) {
    els.toastText.textContent = text;
    els.toast.hidden = false;
    els.toast.style.animation = "none";
    void els.toast.offsetWidth;
    els.toast.style.animation = "";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 3500);
  }

  function hideToast() {
    clearTimeout(toastTimer);
    els.toast.hidden = true;
  }

  function finish() {
    hideToast();
    const missing = apt.items.filter((i) => !checked.has(i.id));
    const allGood = missing.length === 0;
    const none = checked.size === 0;

    els.resultEmoji.textContent = allGood ? "🥳" : none ? "🙈" : "🕵️";
    els.resultTitle.textContent = t(allGood ? "allGoodTitle" : none ? "emptyTitle" : "missingTitle");
    els.resultText.textContent = t(allGood ? "allGoodText" : none ? "emptyText" : "missingText");
    els.resultClose.textContent = t(allGood ? "closeDone" : "close");
    els.resultList.replaceChildren(...(none ? [] : missing).map((i) => {
      const li = document.createElement("li");
      const e = document.createElement("span");
      e.textContent = i.emoji || "📦";
      const s = document.createElement("span");
      s.textContent = i.title[lang];
      li.append(e, s);
      return li;
    }));

    if (!els.result.open) els.result.showModal();
    if (allGood) confetti();
  }

  function confetti() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = document.createElement("div");
    box.className = "confetti";
    for (let i = 0; i < 36; i++) {
      const s = document.createElement("span");
      s.textContent = CONFETTI[i % CONFETTI.length];
      s.style.left = Math.random() * 100 + "vw";
      s.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
      s.style.animationDelay = Math.random() * 0.6 + "s";
      s.style.fontSize = 20 + Math.random() * 22 + "px";
      box.append(s);
    }
    document.body.append(box);
    setTimeout(() => box.remove(), 4200);
  }

  // ---------- events ----------
  els.grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) toggle(card.dataset.id, false);
  });

  els.toastUndo.addEventListener("click", () => {
    if (lastAction) toggle(lastAction, true);
    lastAction = null;
  });

  els.lang.addEventListener("click", () => {
    lang = lang === "ru" ? "en" : "ru";
    store.set("lang", lang);
    hideToast();
    renderAll();
  });

  els.apt.addEventListener("change", () => { location.hash = els.apt.value; });
  window.addEventListener("hashchange", loadApartment);

  els.reset.addEventListener("click", () => {
    if (!checked.size || confirm(t("confirmReset"))) {
      checked.clear();
      save();
      lastAction = null;
      hideToast();
      renderGrid();
      renderProgress(true);
    }
  });

  els.finish.addEventListener("click", finish);

  // close dialog by tapping the backdrop
  els.result.addEventListener("click", (e) => { if (e.target === els.result) els.result.close(); });

  loadApartment();
})();
