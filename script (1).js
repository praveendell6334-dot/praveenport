/* ===========================================================
   PRAVEEN — DATA ANALYST PORTFOLIO — script.js
   =========================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setYear();
    initThemeToggle();
    initMobileNav();
    initSmoothScroll();
    initTypewriter();
    initKpiCounters();
    initSkillBars();
    initHeroMiniChart();
    initProjectFilters();
    initProjectCharts();
    initCaseStudyModal();
    initDashboardWidget();
    initRoiCalculator();
    initContactForm();
    initResumeButton();
    initHeaderScrollState();
  }

  /* ---------- helpers ---------- */
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function formatCurrency(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  /* ---------- footer year ---------- */
  function setYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- theme toggle ---------- */
  function initThemeToggle() {
    var toggle = document.getElementById("themeToggle");
    var icon = document.getElementById("themeIcon");
    var root = document.documentElement;

    var saved = null;
    try { saved = window.localStorage.getItem("praveen-theme"); } catch (e) { saved = null; }

    if (saved === "light") applyTheme("light");
    else applyTheme("dark");

    function applyTheme(mode) {
      if (mode === "light") {
        root.setAttribute("data-theme", "light");
        if (icon) { icon.classList.remove("fa-moon"); icon.classList.add("fa-sun"); }
      } else {
        root.removeAttribute("data-theme");
        if (icon) { icon.classList.remove("fa-sun"); icon.classList.add("fa-moon"); }
      }
      refreshAllCharts();
    }

    toggle.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      var next = isLight ? "dark" : "light";
      applyTheme(next);
      try { window.localStorage.setItem("praveen-theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- mobile nav ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    menu.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- smooth scroll (with sticky header offset) ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var headerH = document.querySelector(".site-header").offsetHeight;
        var top = target.getBoundingClientRect().top + window.pageYOffset - headerH + 1;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  function initHeaderScrollState() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    window.addEventListener("scroll", function () {
      header.style.boxShadow = window.scrollY > 8 ? "0 6px 20px rgba(2,6,23,0.25)" : "none";
    });
  }

  /* ---------- typewriter in hero ---------- */
  function initTypewriter() {
    var el = document.getElementById("typewriter");
    if (!el) return;
    var phrases = ["business decisions.", "predictive forecasts.", "BI dashboards.", "growth strategies."];
    var phraseIndex = 0, charIndex = 0, deleting = false;

    function tick() {
      var current = phrases[phraseIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          deleting = true;
          setTimeout(tick, 1600);
          return;
        }
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          phraseIndex = (phraseIndex + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting ? 35 : 65);
    }
    tick();
  }

  /* ---------- KPI counters (animate on view) ---------- */
  function initKpiCounters() {
    var numbers = document.querySelectorAll(".kpi-number");
    if (!numbers.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    numbers.forEach(function (n) { observer.observe(n); });

    function animateCount(el) {
      var target = parseFloat(el.getAttribute("data-target"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var suffix = el.getAttribute("data-suffix") || "";
      var duration = 1400;
      var start = performance.now();

      function frame(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(frame);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      requestAnimationFrame(frame);
    }
  }

  /* ---------- skill bars fill on view ---------- */
  function initSkillBars() {
    var bars = document.querySelectorAll(".skill-bar");
    if (!bars.length) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { observer.observe(b); });
  }

  /* ================= CHART.JS SECTION ================= */
  var chartRegistry = []; // { chart, rebuild }

  function chartColors() {
    return {
      blue: "#3B82F6",
      teal: "#14B8A6",
      amber: "#F59E0B",
      red: "#F43F5E",
      grid: cssVar("--border") || "#2C3B54",
      text: cssVar("--text-dim") || "#94A3B8",
      card: cssVar("--card") || "#1E293B"
    };
  }

  function baseGridOptions() {
    var c = chartColors();
    return {
      grid: { color: c.grid, drawBorder: false },
      ticks: { color: c.text, font: { family: "Inter", size: 11 } }
    };
  }

  function refreshAllCharts() {
    // Re-theme charts by rebuilding them (Chart.js doesn't hot-swap CSS colors)
    chartRegistry.forEach(function (entry) {
      if (entry.rebuild) entry.rebuild();
    });
  }

  /* --- hero mini chart --- */
  function initHeroMiniChart() {
    var canvas = document.getElementById("heroMiniChart");
    if (!canvas || typeof Chart === "undefined") return;
    var chart = null;

    function build() {
      if (chart) chart.destroy();
      var c = chartColors();
      chart = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [{
            data: [42, 55, 49, 68, 61, 77, 84],
            borderColor: c.teal,
            backgroundColor: "rgba(20,184,166,0.15)",
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 900 },
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: {
            x: { display: false },
            y: { display: false }
          }
        }
      });
    }
    build();
    chartRegistry.push({ chart: chart, rebuild: build });
  }

  /* --- project card mockup charts --- */
  function initProjectCharts() {
    if (typeof Chart === "undefined") return;
    var canvases = document.querySelectorAll(".project-chart");

    var dataSets = {
      p1: { type: "bar", labels: ["W1", "W2", "W3", "W4", "W5", "W6"], data: [62, 71, 68, 80, 88, 95] },
      p2: { type: "line", labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"], data: [340, 300, 260, 190, 110, 32] },
      p3: { type: "line", labels: ["W1", "W2", "W3", "W4", "W5", "W6"], data: [18, 16, 15, 12, 10, 8] },
      p4: { type: "doughnut", labels: ["Paid Search", "Social", "Email", "Organic"], data: [34, 26, 18, 22] }
    };

    canvases.forEach(function (canvas) {
      var id = canvas.getAttribute("data-chart-id");
      var cfg = dataSets[id];
      if (!cfg) return;
      var chart = null;

      function build() {
        if (chart) chart.destroy();
        var c = chartColors();
        var grid = baseGridOptions();

        if (cfg.type === "doughnut") {
          chart = new Chart(canvas.getContext("2d"), {
            type: "doughnut",
            data: {
              labels: cfg.labels,
              datasets: [{
                data: cfg.data,
                backgroundColor: [c.blue, c.teal, c.amber, "#8B5CF6"],
                borderColor: c.card,
                borderWidth: 3
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              animation: { duration: 800 },
              plugins: {
                legend: { position: "bottom", labels: { color: c.text, boxWidth: 10, font: { size: 10 } } }
              },
              cutout: "62%"
            }
          });
        } else {
          chart = new Chart(canvas.getContext("2d"), {
            type: cfg.type,
            data: {
              labels: cfg.labels,
              datasets: [{
                data: cfg.data,
                backgroundColor: cfg.type === "bar" ? "rgba(59,130,246,0.55)" : "rgba(20,184,166,0.15)",
                borderColor: cfg.type === "bar" ? c.blue : c.teal,
                borderRadius: cfg.type === "bar" ? 6 : 0,
                fill: cfg.type === "line",
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: true,
              animation: { duration: 800 },
              plugins: { legend: { display: false } },
              scales: {
                x: { grid: { display: false }, ticks: grid.ticks },
                y: { grid: grid.grid, ticks: grid.ticks, beginAtZero: true }
              }
            }
          });
        }
      }
      build();
      chartRegistry.push({ chart: chart, rebuild: build });
    });
  }

  /* --- interactive dashboard widget --- */
  function initDashboardWidget() {
    var canvas = document.getElementById("dashboardChart");
    if (!canvas || typeof Chart === "undefined") return;

    var metricSegment = document.getElementById("metricSegment");
    var rangeSegment = document.getElementById("rangeSegment");
    var forecastToggle = document.getElementById("forecastToggle");
    var forecastWrap = document.getElementById("forecastToggleWrap");

    var state = { metric: "revenue", range: 12, forecast: true };
    var chart = null;

    var revenueData12 = [42, 45, 41, 48, 52, 58, 55, 62, 67, 71, 69, 76];
    var revenueForecast12 = [null, null, null, null, null, null, null, null, null, null, 69, 76, 83, 90, 95];
    var months12 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan*", "Feb*", "Mar*"];

    var segmentLabels = ["New", "Returning", "VIP", "At-Risk", "Dormant"];
    var segmentData = [320, 480, 140, 95, 210];

    function currentSlice() {
      if (state.metric === "segments") {
        return { labels: segmentLabels, data: segmentData };
      }
      var months = state.range === 6 ? months12.slice(6, 12) : months12.slice(0, 12);
      var data = state.range === 6 ? revenueData12.slice(6) : revenueData12;
      var forecast = state.forecast ? (state.range === 6 ? revenueForecast12.slice(6) : revenueForecast12) : null;
      var labels = state.forecast ? months12.slice(state.range === 6 ? 6 : 0) : months;
      return { labels: labels, data: data, forecast: forecast };
    }

    function build() {
      if (chart) chart.destroy();
      var c = chartColors();
      var slice = currentSlice();

      if (state.metric === "segments") {
        chart = new Chart(canvas.getContext("2d"), {
          type: "bar",
          data: {
            labels: slice.labels,
            datasets: [{
              label: "Customers",
              data: slice.data,
              backgroundColor: [c.blue, c.teal, c.amber, c.red, "#8B5CF6"],
              borderRadius: 8,
              maxBarThickness: 56
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700 },
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { display: false }, ticks: { color: c.text } },
              y: { grid: { color: c.grid }, ticks: { color: c.text }, beginAtZero: true }
            }
          }
        });
      } else {
        var datasets = [{
          label: "Revenue ($k)",
          data: slice.data,
          borderColor: c.blue,
          backgroundColor: "rgba(59,130,246,0.14)",
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: c.blue,
          borderWidth: 2.5
        }];

        if (slice.forecast) {
          datasets.push({
            label: "Forecast",
            data: slice.forecast,
            borderColor: c.teal,
            backgroundColor: "transparent",
            borderDash: [6, 5],
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: c.teal,
            borderWidth: 2.5
          });
        }

        chart = new Chart(canvas.getContext("2d"), {
          type: "line",
          data: { labels: slice.labels, datasets: datasets },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700 },
            interaction: { mode: "index", intersect: false },
            plugins: {
              legend: { position: "top", align: "end", labels: { color: c.text, boxWidth: 10, usePointStyle: true } }
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: c.text } },
              y: { grid: { color: c.grid }, ticks: { color: c.text, callback: function (v) { return "$" + v + "k"; } } }
            }
          }
        });
      }

      updateStats(slice);
    }

    function updateStats(slice) {
      var totalEl = document.getElementById("statTotal");
      var avgEl = document.getElementById("statAvg");
      var trendEl = document.getElementById("statTrend");
      var data = slice.data;
      var total = data.reduce(function (a, b) { return a + b; }, 0);
      var avg = total / data.length;
      var trend = data.length > 1 ? ((data[data.length - 1] - data[0]) / data[0]) * 100 : 0;

      if (state.metric === "segments") {
        totalEl.textContent = total.toLocaleString() + " users";
        avgEl.textContent = Math.round(avg).toLocaleString() + " / segment";
      } else {
        totalEl.textContent = "$" + total.toLocaleString() + "k";
        avgEl.textContent = "$" + Math.round(avg).toLocaleString() + "k";
      }
      trendEl.textContent = (trend >= 0 ? "+" : "") + trend.toFixed(1) + "%";
      trendEl.style.color = trend >= 0 ? cssVar("--teal") : cssVar("--red");
    }

    metricSegment.addEventListener("click", function (e) {
      var btn = e.target.closest(".segment");
      if (!btn) return;
      metricSegment.querySelectorAll(".segment").forEach(function (s) { s.classList.remove("active"); });
      btn.classList.add("active");
      state.metric = btn.getAttribute("data-metric");
      forecastWrap.style.opacity = state.metric === "segments" ? "0.4" : "1";
      forecastWrap.style.pointerEvents = state.metric === "segments" ? "none" : "auto";
      rangeSegment.style.opacity = state.metric === "segments" ? "0.4" : "1";
      rangeSegment.style.pointerEvents = state.metric === "segments" ? "none" : "auto";
      build();
    });

    rangeSegment.addEventListener("click", function (e) {
      var btn = e.target.closest(".segment");
      if (!btn) return;
      rangeSegment.querySelectorAll(".segment").forEach(function (s) { s.classList.remove("active"); });
      btn.classList.add("active");
      state.range = parseInt(btn.getAttribute("data-range"), 10);
      build();
    });

    forecastToggle.addEventListener("change", function () {
      state.forecast = forecastToggle.checked;
      build();
    });

    build();
    chartRegistry.push({ chart: chart, rebuild: build });
  }

  /* ---------- project filtering ---------- */
  function initProjectFilters() {
    var buttons = document.querySelectorAll(".filter-btn");
    var cards = document.querySelectorAll(".project-card");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-selected", "false"); });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        var filter = btn.getAttribute("data-filter");

        cards.forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("hide", !match);
        });
      });
    });
  }

  /* ---------- case study modal ---------- */
  function initCaseStudyModal() {
    var overlay = document.getElementById("modalOverlay");
    var content = document.getElementById("modalContent");
    var closeBtn = document.getElementById("modalClose");
    if (!overlay) return;

    var caseStudies = {
      p1: {
        title: "Retail Revenue Command Center",
        tag: "Power BI · DAX · SQL Server",
        problem: "Forty-plus stores reported sales through disconnected spreadsheets. Regional managers found out about stock-outs days after they happened, losing sales during peak windows.",
        methodology: "Consolidated POS and inventory feeds into a single SQL Server warehouse, modeled a star schema, and built DAX measures for real-time stock-out risk scoring refreshed every 15 minutes.",
        analysis: "Segmented stores by velocity tier and cross-referenced against replenishment lead time to flag at-risk SKUs three days before they would stock out, instead of after.",
        roi: "Conversion rate increased 14%, translating to an estimated $410K in recovered quarterly revenue."
      },
      p2: {
        title: "Query Latency Overhaul",
        tag: "SQL · Python · PostgreSQL",
        problem: "Nightly ETL jobs ran 6+ hours on unindexed tables with row-by-row transformations, delaying every morning report the finance team depended on.",
        methodology: "Profiled query plans, rebuilt indexing strategy, converted row-based Python transforms to vectorized Pandas operations, and parallelized independent pipeline stages with Airflow.",
        analysis: "Benchmarked each pipeline stage pre/post optimization, isolating the three slowest joins as 80% of total runtime and rewriting them as materialized views refreshed incrementally.",
        roi: "Runtime dropped from 6 hours to 32 minutes (91% reduction), reports now ready before the 8am stand-up."
      },
      p3: {
        title: "Customer Churn Predictor",
        tag: "Python · Scikit-learn · R",
        problem: "A subscription business could only see churn after cancellation, with no mechanism to intervene while a customer was still recoverable.",
        methodology: "Engineered behavioral features (login frequency, support ticket sentiment, usage decay) and trained a gradient-boosted classifier, validated with R for statistical significance testing.",
        analysis: "Identified the top five leading indicators of churn, with usage decay in the two weeks prior being the single strongest predictor at 68% of model weight.",
        roi: "Proactive retention triggers reduced churn by 22%, preserving an estimated $1.1M in annual recurring revenue."
      },
      p4: {
        title: "Marketing Attribution Dashboard",
        tag: "Tableau · SQL · Excel",
        problem: "Marketing spend was allocated by gut feeling; leadership had no reliable way to compare channel performance on equal footing.",
        methodology: "Built a multi-touch attribution model in SQL, blending first-touch and time-decay weighting, then surfaced results in a Tableau dashboard with channel-level drill-downs.",
        analysis: "Found paid search was over-credited under last-click attribution while email's assist-conversions were consistently undercounted.",
        roi: "Budget reallocation toward under-credited channels produced a 31% lift in return on ad spend within one quarter."
      }
    };

    document.querySelectorAll(".case-study-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-project");
        var cs = caseStudies[key];
        if (!cs) return;

        content.innerHTML =
          '<span class="modal-tag">' + cs.tag + '</span>' +
          '<h2 id="modalTitle">' + cs.title + '</h2>' +
          '<div class="modal-section"><h4>Problem</h4><p>' + cs.problem + '</p></div>' +
          '<div class="modal-section"><h4>Methodology</h4><p>' + cs.methodology + '</p></div>' +
          '<div class="modal-section"><h4>Analysis</h4><p>' + cs.analysis + '</p></div>' +
          '<div class="modal-section"><h4>Business ROI</h4><div class="modal-roi">' + cs.roi + '</div></div>';

        openModal();
      });
    });

    function openModal() {
      overlay.classList.add("open");
      document.body.style.overflow = "hidden";
      closeBtn.focus();
    }
    function closeModal() {
      overlay.classList.remove("open");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", closeModal);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("open")) closeModal();
    });
  }

  /* ---------- ROI calculator ---------- */
  function initRoiCalculator() {
    var adSpend = document.getElementById("adSpend");
    var churnRate = document.getElementById("churnRate");
    var avgOrder = document.getElementById("avgOrder");
    if (!adSpend || !churnRate || !avgOrder) return;

    var adSpendValue = document.getElementById("adSpendValue");
    var churnRateValue = document.getElementById("churnRateValue");
    var avgOrderValue = document.getElementById("avgOrderValue");

    var resultRevenue = document.getElementById("resultRevenue");
    var resultChurn = document.getElementById("resultChurn");
    var resultRoi = document.getElementById("resultRoi");

    function recalc() {
      var spend = parseFloat(adSpend.value);
      var churn = parseFloat(churnRate.value);
      var order = parseFloat(avgOrder.value);

      adSpendValue.textContent = "$" + spend.toLocaleString();
      churnRateValue.textContent = churn + "%";
      avgOrderValue.textContent = "$" + order.toLocaleString();

      // Illustrative simulated model (not a real financial forecast)
      var estCustomersReached = spend / 12; // rough acquisition efficiency
      var churnReductionPct = Math.min(churn * 0.35, 9); // model recovers up to 35% of churn, capped
      var recoveredCustomers = estCustomersReached * (churnReductionPct / 100);
      var monthlyRevenueRecovery = recoveredCustomers * order * 0.6;
      var annualRoi = ((monthlyRevenueRecovery * 12) - spend * 0.15) / (spend * 0.15) * 100;

      resultRevenue.textContent = formatCurrency(monthlyRevenueRecovery);
      resultChurn.textContent = "-" + churnReductionPct.toFixed(1) + "%";
      resultRoi.textContent = (annualRoi >= 0 ? "+" : "") + Math.round(annualRoi) + "%";
    }

    [adSpend, churnRate, avgOrder].forEach(function (input) {
      input.addEventListener("input", recalc);
    });
    recalc();
  }

  /* ---------- contact form validation ---------- */
  function initContactForm() {
    var form = document.getElementById("contactForm");
    if (!form) return;
    var success = document.getElementById("formSuccess");

    var fields = {
      name: { el: document.getElementById("name"), error: document.getElementById("nameError") },
      email: { el: document.getElementById("email"), error: document.getElementById("emailError") },
      subject: { el: document.getElementById("subject"), error: document.getElementById("subjectError") },
      message: { el: document.getElementById("message"), error: document.getElementById("messageError") }
    };

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function validateField(key) {
      var field = fields[key];
      var value = field.el.value.trim();
      var msg = "";

      if (!value) {
        msg = "This field is required.";
      } else if (key === "email" && !emailPattern.test(value)) {
        msg = "Enter a valid email address.";
      } else if (key === "message" && value.length < 10) {
        msg = "Message should be at least 10 characters.";
      }

      field.error.textContent = msg;
      field.el.closest(".form-field").classList.toggle("invalid", !!msg);
      return !msg;
    }

    Object.keys(fields).forEach(function (key) {
      fields[key].el.addEventListener("blur", function () { validateField(key); });
      fields[key].el.addEventListener("input", function () {
        if (fields[key].el.closest(".form-field").classList.contains("invalid")) validateField(key);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var allValid = Object.keys(fields).map(validateField).every(Boolean);

      if (allValid) {
        success.textContent = "Thanks — your message has been queued. I'll reply within 1–2 business days.";
        form.reset();
        Object.keys(fields).forEach(function (key) {
          fields[key].el.closest(".form-field").classList.remove("invalid");
        });
        setTimeout(function () { success.textContent = ""; }, 6000);
      } else {
        success.textContent = "";
      }
    });
  }

  /* ---------- resume button ---------- */
  function initResumeButton() {
    var btn = document.getElementById("resumeBtn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      // Placeholder: no resume file is attached to this template.
      window.alert("Add a link to your resume PDF on the \"Download Resume\" button (id=\"resumeBtn\" in index.html) to enable this download.");
    });
  }

})();
