(() => {
  "use strict";

  const CONFIG = window.TRAVEL_GUIDE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));

  function accessTokenFromHash() {
    const hash = location.hash || "";
    const m = hash.match(/^#\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : "";
  }

  async function loadViewModel() {
    const token = accessTokenFromHash();

    if (token && CONFIG.cloudbaseEnvId) {
      if (!window.TravelGuideCloudBase?.getFinalGuide) {
        throw new Error("cloudbase_guide_client_unavailable");
      }
      return await window.TravelGuideCloudBase.getFinalGuide(token);
    }

    if (token && CONFIG.apiBase) {
      const res = await fetch(`${CONFIG.apiBase.replace(/\/$/, "")}/v1/final-guide`, {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        cache: "no-store"
      });
      if (!res.ok) throw new Error(`guide_api_${res.status}`);
      return await res.json();
    }

    if (token) {
      throw new Error("guide_backend_not_configured");
    }

    const res = await fetch(CONFIG.demoUrl || "./demo.json", { cache: "no-store" });
    if (!res.ok) throw new Error("demo_load_failed");
    const data = await res.json();
    data.__demo = true;
    return data;
  }

  function safeExternalUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(String(value), location.href);
      return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function navigationButton(action) {
    const url = safeExternalUrl(action?.url);
    if (!url) return "";
    return `<a class="btn ${action.primary ? "primary" : ""}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(action.label || "导航")}</a>`;
  }

  function detailsHtml(details = []) {
    if (!details.length) return "";
    return `<div class="details">${details.map((d) => {
      const body = d.items?.length
        ? `<ul>${d.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`
        : `<p>${esc(d.text || "")}</p>`;
      return `<details><summary>${esc(d.title)}</summary>${body}</details>`;
    }).join("")}</div>`;
  }

  function cardHtml(card) {
    const actions = (card.actions || []).map(navigationButton).join("");
    return `<article class="card">
      <div class="card-main">
        <div class="time">${esc(card.time || "")}</div>
        <div class="row">
          <div class="title">${esc(card.title)}</div>
          ${card.badge ? `<span class="badge ${esc(card.badge.tone || "")}">${esc(card.badge.text)}</span>` : ""}
        </div>
        ${card.subtitle ? `<div class="summary">${esc(card.subtitle)}</div>` : ""}
        ${card.description ? `<div class="desc">${esc(card.description)}</div>` : ""}
        ${card.keyline ? `<div class="keyline">${esc(card.keyline)}</div>` : ""}
        ${actions ? `<div class="actions">${actions}</div>` : ""}
      </div>
      ${detailsHtml(card.details || [])}
    </article>`;
  }

  function transitionHtml(item) {
    const actions = (item.actions || []).map(navigationButton).join("");
    return `<div class="transition">
      <b>↓ ${esc(item.title || "下一步")}</b>
      ${item.description ? `<p>${esc(item.description)}</p>` : ""}
      ${actions ? `<div class="actions">${actions}</div>` : ""}
    </div>`;
  }

  function alertHtml(a) {
    return `<div class="alert ${esc(a.tone || "")}">
      <div class="row">
        <b>${esc(a.title)}</b>
        ${a.badge ? `<span class="badge ${esc(a.badge.tone || "")}">${esc(a.badge.text)}</span>` : ""}
      </div>
      ${a.text ? `<div class="muted" style="margin-top:6px">${esc(a.text)}</div>` : ""}
    </div>`;
  }

  function renderToday(vm) {
    const t = vm.today;
    if (!t) {
      $("#today").innerHTML = '<div class="empty">今天没有可显示的行程。</div>';
      return;
    }

    const carry = (t.carry || []).length
      ? `<div class="muted" style="font-weight:800;margin:13px 2px 5px">今天建议带</div>
         <div class="carry">${t.carry.map((x) => `<div class="carry-item"><b>${esc(x.item)}</b><p>${esc(x.reason)}</p></div>`).join("")}</div>`
      : "";

    const flow = (t.flow || []).map((x) => {
      if (x.type === "transition") return transitionHtml(x);
      return cardHtml(x);
    }).join("");

    $("#today").innerHTML = `
      <div class="section-head">
        <h2>${esc(t.title)}</h2>
        <div class="muted">${esc(t.summary || "")}</div>
      </div>
      ${(t.alerts || []).map(alertHtml).join("")}
      ${carry}
      ${flow || '<div class="empty">今天没有安排。</div>'}
    `;
  }

  function renderAll(vm) {
    $("#all").innerHTML = `
      <div class="section-head">
        <h2>全部行程</h2>
        <div class="muted">这里展示最终已确认的行程，不暴露规划过程和内部评分。</div>
      </div>
      ${(vm.days || []).map((d) => `
        <div class="day-card">
          <b>${esc(d.title)}</b>
          ${d.summary ? `<div class="muted" style="margin:5px 0 7px">${esc(d.summary)}</div>` : ""}
          ${(d.blocks || []).map((b) => `
            <div class="day-block">
              <b>${esc(b.time || "")} · ${esc(b.title)}</b>
              ${b.description ? `<div class="muted">${esc(b.description)}</div>` : ""}
            </div>
          `).join("")}
        </div>
      `).join("") || '<div class="empty">暂无行程。</div>'}
    `;
  }

  function taskHtml(t) {
    return `<div class="task">
      <div class="task-dot">${t.done ? "✓" : ""}</div>
      <div>
        <b>${esc(t.title)}</b>
        ${t.text ? `<p>${esc(t.text)}</p>` : ""}
        ${t.badge ? `<span class="badge ${esc(t.badge.tone || "")}">${esc(t.badge.text)}</span>` : ""}
      </div>
    </div>`;
  }

  function taskGroup(title, tasks) {
    return `<div>
      <h3>${esc(title)}</h3>
      ${tasks.length ? tasks.map(taskHtml).join("") : '<div class="empty">没有</div>'}
    </div>`;
  }

  function renderTasks(vm) {
    const tasks = vm.tasks || {};
    $("#tasks").innerHTML = `
      <div class="section-head">
        <h2>行程待办</h2>
        <div class="muted">这里只显示必须由客户本人完成的动作。</div>
      </div>
      ${taskGroup("现在要做", tasks.now || [])}
      ${taskGroup("之后再做", tasks.later || [])}
      ${taskGroup("已完成", tasks.done || [])}
    `;
  }

  function render(vm) {
    $("#tripTitle").textContent = vm.header?.title || "旅行攻略";
    $("#tripMeta").textContent = vm.header?.meta || "";

    if (vm.__demo) {
      const banner = $("#statusBanner");
      banner.classList.remove("hidden");
      banner.textContent = "当前为结构演示数据。正式客户数据不会写进 GitHub，而会由私有后端按访问令牌返回。";
    }

    renderToday(vm);
    renderAll(vm);
    renderTasks(vm);
  }

  function showError(err) {
    const banner = $("#statusBanner");
    banner.classList.remove("hidden");
    banner.textContent = "攻略暂时无法加载。请稍后重试，或联系旅行规划师。";
    $("#today").innerHTML = '<div class="empty">没有可显示的数据。</div>';
    console.error(err);
  }

  $$(".nav button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".nav button").forEach((x) => x.classList.remove("active"));
      $$(".view").forEach((x) => x.classList.remove("active"));
      button.classList.add("active");
      $("#" + button.dataset.view).classList.add("active");
      scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  loadViewModel().then(render).catch(showError);
})();
