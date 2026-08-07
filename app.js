/* Investment OS dashboard */
(function () {
  const RATE_IDS = []; // 利率／利差／債券：之後加進 Fed 意圖證據牆
  const FED_EVIDENCE_IDS = [
    "fed_funds",
    "fed_bs",
    "truflation_us_cpi",
    "icsa",
    "core_pce_yoy",
    "unrate",
    "phillips",
    "dgs10",
    "dgs2",
    "t10y2y",
    "hy_spread",
  ]; // 待加：債券價格

  // Fed 意圖區完整介紹（對齊專屬框架確定區）
  // scenario＝情境推導：非絕對門檻，偏「有可能怎麼樣」
  const FED_GUIDE = {
    fed_funds: {
      what: "基準利率（有效聯邦基金利率）＝銀行隔夜拆借的「借錢底價」。升息＝借錢變貴、壓通膨；降息＝借錢變便宜、刺激經濟。",
      how: "官方水位，開會才階梯式變動。日常解讀仍以 2Y 為主（市場常比官方早動）。拿來對照：2Y 明顯高於／低於官方 → 市場在定價更鷹／更鴿。",
      anchor: "無單一買賣錨；當傳導鏈起點與標籤即可。",
      scenario:
        "若官方維持高利率很久：傳導會慢慢滲到貸款與實體（有時間差）。若開始降息：先分預防性（通膨回落、就業尚可）還是衰退式（失業／信用惡化）——見本區 Fed 意圖。單看基準利率變動，不足以決定加減碼。",
    },
    fed_bs: {
      what: "Fed 總資產（WALCL）＝資產負債表大小，代表「錢的數量」。和基準利率（錢的價格）是兩條軸：利率管貴不貴，總資產管多不多。",
      mech: "QE（放錢）：Fed 向市場買債 → 銀行用國債換成準備金（更像現金）→ 體系錢變多、總資產↑。QT（收錢）：Fed 手上的債到期 → 財政部還本金給 Fed（發債的人還錢；當初賣債的銀行不用再還）→ Fed 不拿去再買新債 → 準備金被沖掉、總資產↓。口訣：買債＝放錢；到期不續＝收錢。",
      how: "看幾週～幾個月斜率，不要只看單週雜訊。往下＝偏 QT；往上＝偏擴表（含準備金管理式買債，未必等於疫情那種無限量 QE）；橫盤＝常是暫停縮表後的持平。長圖可見：2018–19 小縮 → 2020 急擴 → 2022 後大段 QT → 近月企穩。",
      scenario:
        "偏 QT：即使利率不動，風險資產也可能偏緊。大致持平：數量緊縮暫停，焦點回到利率、就業、通膨。偏擴表：流動性偏改善，但若只是小幅準備金管理買債，別自動解讀成大牛市開關——仍對照 HY、VIX、均線。",
    },
    truflation_us_cpi: {
      what: "民間日頻通膨估算，偏 CPI 方向的「領先感覺」，不是 PCE 家族。常比官方數字早動。",
      how: "與 Core PCE 對方向即可，不必釘死小數。偏預防性：往下、沒再加速；偏壓力：又往上頂。",
      anchor: "無固定水位錨；重點看方向與加速度（常領先官方 CPI 約 2～3 個月）。",
      scenario:
        "若持續回落／低位橫盤：通膨壓力不大 → 較支持「不必再暴力升息」、預防性降息敘事較容易站得住。若突然回升並加速：市場可能更快修正 FedWatch／降息定價（偏鷹）；成長股短線常先承壓——但仍要對照 Core PCE，單邊日頻跳動不算定論。",
    },
    core_pce_yoy: {
      what: "Core PCE＝PCE 去掉食物、能源。Fed 政策主要看這個；比 CPI 更能反映消費替代。",
      how: "月頻，比 Truflation 慢。看是否仍在合理帶盤整、有沒有再加速。",
      anchor: "約 2%～3% 盤整、未再加速。",
      scenario:
        "若穩在約 2%～3%、沒再往上加速：較不支持再次暴力升息；若就業也沒崩，較接近「可談預防性寬鬆／軟著陸」條件。若明顯高於 3% 且重新上行：Fed 更難鬆、升息或維持高利率敘事回溫 → 估值壓力。若跌破 2% 且就業惡化：通膨目標近了，但若失業同步惡化，較像衰退式鬆綁，不是單純「通膨好了就買股票」。",
    },
    icsa: {
      what: "初領失業金＝每週「新申請」失業補助人數（流量／體溫計）。失業率是每月「多少人沒工作」（存量／體檢）。",
      how: "單週雜訊大，看約 4 週趨勢。偏預防性／經濟還行：數字穩、沒明顯週週墊高。",
      anchor: "未明顯突破約 30 萬人 → 大致穩健。",
      scenario:
        "若明顯站上／連續數週高於約 30 萬（尤其還在往上走）：勞動市場「流量」裂開機率上升——不是單週就宣判衰退，但市場常提早定價成長放緩、風險資產波動變大。若再疊加 HY 急擴，較接近「衰退式／急救」劇本，而不是單純預防性降息。",
    },
    unrate: {
      what: "失業率＝勞動市場「體檢報告」：多少人沒工作。慢但全面；初領較快。",
      how: "單月噪音大，看趨勢與是否伴隨初領惡化。約在可控帶 → 消費動能較不易一夜崩盤。",
      anchor: "約 4% 左右仍算可控。",
      scenario:
        "若明顯高於約 4% 且連續往上（例如往 4.5%～5% 一帶）：全面衰退機率上升 → Fed 較可能被迫「急救式」鬆綁；初期股市常是殺估值＋殺盈利，不能只因為開始降息就抄底。若只是微幅高於 4% 但橫盤、初領沒爆，仍可能只是噪音，要看斜率。",
    },
    phillips: {
      what: "菲利浦曲線描述失業率與通膨的拉扯。不是精準預測公式，而是方向性檢查：通膨有沒有受控？就業有沒有惡化？",
      how: "圖上：右＝失業越痛、上＝通膨越熱；最新點左下較友善、右上兩頭痛。",
      anchor: "對照失業約 4%、Core PCE 約 2%～3%。",
      scenario:
        "若點落在「通膨受控＋失業尚未惡化」（大致左下／中間偏友善）：Fed 較不必暴力升息、也不必立刻急救 → 風險資產較有順風條件。若往右（失業明顯惡化）：偏衰退／急救式降息劇本。若往上（通膨再熱）：偏緊、難鬆。若右上兩頭痛：最糟區——政策兩難，風險偏好通常先收縮。皆非精準預測，只是方向檢查。",
    },
    dgs10: {
      what: "美國 10 年期公債殖利率。較反映長期成長、通膨與期限溢酬。公債＝相對「無風險」基準；HY（高收益債）利差＝公司債要比公債多付多少風險補償。",
      how: "與 2Y、曲線一起看；升息環境下「現在就能拿的利息」變香時，成長股估值易被壓縮。讀 10Y 時順便對照 HY：10Y 是「基準利率水位」，HY 利差是「信用怕不怕」——兩者故事可以分開。",
      scenario:
        "若 10Y 明顯上行（通膨／期限溢酬重定價）：長天期現金流折現變差 → 成長／高估值股常先受傷。若 10Y 下行且伴隨就業惡化、HY 急擴：可能是避險湧入公債（買公債→10Y 掉）＋信用壓力同時升高 → 較像衰退定價，不是單純「利率好了就多頭」。若 10Y 緩降、HY 穩定沒急擴、就業尚可：較接近流動性改善、可談延續多頭的條件之一。若 10Y 還穩但 HY 單獨急擴：信用／流動性防線先亮，優先對照 VIX、均線，勿只看公債利率。",
    },
    dgs2: {
      what: "美國 2 年期公債殖利率。較貼近市場對 Fed 未來 1～2 年政策路徑的定價——傳導鏈裡「短債」那一環。",
      how: "短端先動：市場常比官方基準利率早反映緊／鬆。與基準利率對照看預期差；與 10Y 組成曲線。",
      anchor: "無單一水位錨；重點看與基準利率、10Y 的關係。",
      scenario:
        "若 2Y 快速上行：市場在定價 Fed 更鷹／維持更高更久 → 短端緊，風險資產估值壓力。若 2Y 快速下行：市場在定價鬆綁——此時要分：通膨回落＋就業尚可 → 較像預防性；就業／信用同步惡化 → 較像衰退式（初期股市未必馬上好）。單看 2Y 不夠，一定要回寫 FED 意圖與就業、HY。",
    },
    t10y2y: {
      what: "10Y−2Y 利差。＞0 正常向上斜；＜0 倒掛（短端比長端緊）。",
      how: "倒掛＝市場在說「現在很緊，以後可能變冷、Fed 終將鬆」。看持續時間、深度，不要只看一天。",
      anchor: "是否倒掛（＜0）；深度（如深於約 −50bps 更有意義）與是否連續數週～數月更重要。",
      scenario:
        "若持續倒掛且夠深：歷史上常預示之後成長放緩／衰退風險升高（有時間差，不是倒掛當天就崩）。若倒掛消失翻正：也不等於立刻放鬆——有時是因為 Fed 已降息、經濟真的變差，短端先掉才翻正。若正但很薄（例如只有約 +30bps）：倒掛警訊可能已過，但利率仍偏緊，不是「可以大開風險」的信號。",
    },
    hy_spread: {
      what: "HY＝High Yield（高收益債），也就是評等較低、違約風險較高的公司債（常被叫「垃圾債」）。本站數字是 HY 信用利差（OAS）：高收益債殖利率 − 接近天期的公債殖利率＝市場要多收多少「風險補償」。利差小＝大家不太怕、流動性偏鬆；利差大＝信用擔憂升溫、錢偏緊。單位用 bps（100 bps＝1 個百分點）。",
      how: "不用天天盯小數點。看三件事：方向（擴大／收斂）、速度（急不急）、位置（高不高）。重點是有沒有突然往上衝（急擴）。慢慢變或趴著 → 信用還算敢玩；短時間拉很大 → 市場在逃。",
      bandsTitle: "警戒區間（參考，不是鐵律）",
      bands: [
        {
          range: "&lt;350 bps",
          mean: "偏寬鬆，市場不太怕信用風險",
          action: "正常用第二層；別因利差低就盲目追價",
        },
        {
          range: "350～500 bps",
          mean: "常態區間",
          action: "以 QQQ / VIX 為主，HY 當監控",
        },
        {
          range: "500～600 bps",
          mean: "壓力升高",
          action: "新開倉放慢，左側更謹慎",
        },
        {
          range: "&gt;600 bps",
          mean: "明顯壓力",
          action: "優先降風險，不搶反彈",
        },
        {
          range: "&gt;800 bps",
          mean: "歷史上常伴隨信用危機／大波動",
          action: "流動性防線亮紅燈 → 不抄底",
        },
      ],
      scenario:
        "利差穩、沒亂衝：信用還 OK，平常看均線／VIX 就好。開始往上爬：先提高警覺，別急著加碼。短時間急擴，又碰上 VIX 升、QQQ 破線：流動性防線偏紅——先別抄底；就算 Fed 降息，初期股市仍可能又殺估值又殺獲利。利差從高檔慢慢掉回來：表示害怕在退，才比較適合考慮恢復風險。",
      title: "HY 信用利差（高收益債）",
    },
  };

  const MA_IDS = ["qqq", "voo", "twii", "sox"];
  const MA_COLORS = {
    close: "#15202b",
    sma30: "#166534", // 深綠
    sma60: "#a16207", // 深黃
    sma200: "#991b1b", // 深紅
  };

  const state = {
    range: "3m",
    marginRange: "3m",
    fedRanges: {},
    show: { sma30: true, sma60: true, sma200: true },
    histories: {},
    charts: {},
  };

  function tagClass(tag) {
    if (!tag) return "tag-raw";
    if (tag.includes("試行")) return "tag-trial";
    if (tag.includes("問卷") || tag.includes("FMS")) return "tag-survey";
    if (tag.includes("人工")) return "tag-manual";
    if (tag.includes("衍生")) return "tag-derived";
    return "tag-raw";
  }

  function fmt(n, digits) {
    if (n == null || Number.isNaN(n)) return "—";
    return Number(n).toLocaleString("en-US", {
      maximumFractionDigits: digits ?? 2,
      minimumFractionDigits: digits === 0 ? 0 : undefined,
    });
  }

  function daysSince(iso) {
    if (!iso) return null;
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return null;
    return Math.floor((Date.now() - t) / 86400000);
  }

  function cardHtml(s) {
    const latest = s.latest || {};
    let display = "—";
    if (latest.value != null || (s.id === "phillips" && latest.unrate != null)) {
      if (s.id === "phillips") {
        display = `失業 ${fmt(latest.unrate, 1)}% · PCE ${fmt(latest.core_pce_yoy, 2)}%`;
      } else if (s.unit === "%") display = fmt(latest.value, 2) + "%";
      else if (s.unit === "pp") display = fmt(latest.value, 2) + " pp";
      else if (s.id === "icsa") display = fmt(latest.value, 0);
      else display = fmt(latest.value, 2);
    }
    let chg = "";
    if (latest.chg_pp != null) {
      const sign = latest.chg_pp > 0 ? "+" : "";
      chg = ` · 日變 ${sign}${fmt(latest.chg_pp, 2)} pp`;
    }
    const note = (s.note || "").trim();
    return `
      <article class="card">
        <div class="label"><span>${s.label || s.id}</span><span class="tag ${tagClass(s.tag)}">${s.tag || "原始數據"}</span></div>
        <div class="value">${display}</div>
        <div class="sub">${latest.date || "—"}${chg} · ${s.source || ""}</div>
        ${note ? `<div class="note">${note}</div>` : ""}
      </article>`;
  }

  function fedEvidenceCardHtml(s) {
    const latest = s.latest || {};
    let display = "—";
    if (latest.value != null || (s.id === "phillips" && latest.unrate != null)) {
      if (s.id === "phillips") {
        display = `失業 ${fmt(latest.unrate, 1)}% · PCE ${fmt(latest.core_pce_yoy, 2)}%`;
      } else if (s.id === "fed_bs") display = fmt(latest.value, 2) + " 兆美元";
      else if (s.id === "hy_spread") display = fmt(latest.value, 0) + " bps";
      else if (s.unit === "%") display = fmt(latest.value, 2) + "%";
      else if (s.unit === "bps") display = fmt(latest.value, 0) + " bps";
      else if (s.unit === "pp") display = fmt(latest.value, 2) + " pp";
      else if (s.id === "icsa") display = fmt(latest.value, 0);
      else display = fmt(latest.value, 2);
    }
    let chg = "";
    if (s.id === "fed_bs" && latest.chg_note) {
      chg = ` · ${latest.chg_note}`;
    } else if (s.id === "hy_spread" && latest.chg_bps != null) {
      const sign = latest.chg_bps > 0 ? "+" : "";
      chg = ` · 日變 ${sign}${fmt(latest.chg_bps, 0)} bps`;
    } else if (latest.chg_pp != null) {
      const sign = latest.chg_pp > 0 ? "+" : "";
      chg = ` · 日變 ${sign}${fmt(latest.chg_pp, 2)} pp`;
    }
    let live = "";
    if (s.id === "hy_spread" && latest.value != null) {
      const bps = Number(latest.value);
      if (bps > 800) live = "目前區間：&gt;800 bps — 流動性防線偏紅，不抄底";
      else if (bps > 600) live = "目前區間：&gt;600 bps — 明顯壓力，優先降風險";
      else if (bps >= 500) live = "目前區間：500～600 bps — 壓力升高，新開倉放慢";
      else if (bps >= 350) live = "目前區間：350～500 bps — 常態，以 QQQ／VIX 為主";
      else live = "目前區間：&lt;350 bps — 偏寬鬆；別因利差低就盲目追價";
    } else if (s.id === "fed_bs" && latest.regime_label) {
      const tip =
        latest.regime === "qt"
          ? "資產往下 → 錢的數量被抽走"
          : latest.regime === "expand"
            ? "資產往上 → 偏注入流動性（未必＝無限量 QE）"
            : "近月沒有明顯縮／擴";
      live = `目前：${latest.regime_label} — ${tip}`;
    } else if (s.id === "icsa" && latest.value != null) {
      const v = Number(latest.value);
      live =
        v < 300000
          ? "目前相對錨點：偏穩（&lt; 約 30 萬）"
          : "目前相對錨點：已≥約 30 萬——盯是否連續數週惡化（非單週定論）";
    } else if (s.id === "unrate" && latest.value != null) {
      const v = Number(latest.value);
      live =
        v <= 4.2
          ? "目前相對錨點：仍近可控（約 4% 帶）"
          : v < 4.5
            ? "目前相對錨點：略高於約 4%——看斜率與初領是否同步惡化"
            : "目前相對錨點：明顯高於約 4% 帶——偏衰退風險升高（仍看趨勢）";
    } else if (s.id === "core_pce_yoy" && latest.value != null) {
      const v = Number(latest.value);
      live =
        v >= 2 && v <= 3
          ? "目前相對錨點：落在 2%～3%"
          : v < 2
            ? "目前相對錨點：低於 2%～3% 帶"
            : "目前相對錨點：高於 2%～3% 帶";
    } else if (s.id === "t10y2y" && latest.value != null) {
      const v = Number(latest.value);
      live = v >= 0 ? "目前：未倒掛（利差 ≥ 0）" : "目前：倒掛（利差 &lt; 0）";
    }
    const g = FED_GUIDE[s.id] || {};
    const title = g.title || s.label || s.id;
    const bandsHtml =
      g.bands && g.bands.length
        ? `<div class="fed-bands">
            <p><strong>${g.bandsTitle || "警戒區間"}</strong></p>
            <table>
              <thead><tr><th>HY OAS</th><th>意思</th><th>框架動作</th></tr></thead>
              <tbody>
                ${g.bands
                  .map(
                    (r) =>
                      `<tr><td>${r.range}</td><td>${r.mean}</td><td>${r.action}</td></tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>`
        : "";
    return `
      <article class="card card-fed">
        <div class="label"><span>${title}</span><span class="tag ${tagClass(s.tag)}">${s.tag || "原始數據"}</span></div>
        <div class="value">${display}</div>
        <div class="sub">${latest.date || "—"}${chg}${s.freq ? ` · ${s.freq}頻` : ""} · ${s.source || ""}</div>
        ${live ? `<div class="sub anchor-line">${live}</div>` : ""}
        <div class="fed-guide">
          ${g.what ? `<p><strong>是什麼</strong>　${g.what}</p>` : ""}
          ${g.mech ? `<p><strong>機制（白話）</strong>　${g.mech}</p>` : ""}
          ${g.how ? `<p><strong>怎麼看</strong>　${g.how}</p>` : ""}
          ${bandsHtml}
          ${g.anchor ? `<p class="fed-anchor"><strong>框架錨點</strong>　${g.anchor}</p>` : ""}
          ${g.scenario ? `<p class="fed-scenario"><strong>情境推導</strong>　${g.scenario}</p>` : ""}
        </div>
      </article>`;
  }

  function fedRangeFor(id) {
    return state.fedRanges[id] || "1y";
  }

  function fedRangeBtnsHtml(id) {
    const labels = {
      "1w": "1W",
      "1m": "1M",
      "3m": "3M",
      "6m": "6M",
      ytd: "YTD",
      "1y": "1Y",
      "3y": "3Y",
      "5y": "5Y",
      all: "全",
    };
    const active = fedRangeFor(id);
    return `<div class="range-btns fed-range-btns" data-fed-range="${id}" style="margin:0.35rem 0">${Object.entries(labels)
      .map(
        ([r, lab]) =>
          `<button type="button" data-range="${r}" class="${r === active ? "active" : ""}">${lab}</button>`
      )
      .join("")}</div>`;
  }

  function fedMarkLines(id) {
    if (id === "icsa") return [{ yAxis: 300000, name: "約30萬" }];
    if (id === "unrate") return [{ yAxis: 4, name: "約4%" }];
    if (id === "core_pce_yoy") return [{ yAxis: 2, name: "2%" }, { yAxis: 3, name: "3%" }];
    if (id === "t10y2y") return [{ yAxis: 0, name: "倒掛=0" }];
    if (id === "hy_spread")
      return [
        { yAxis: 350, name: "350" },
        { yAxis: 500, name: "500" },
        { yAxis: 600, name: "600" },
      ];
    return [];
  }

  function fedValueDigits(id, unit) {
    if (id === "icsa") return 0;
    if (id === "fed_bs") return 2;
    if (id === "hy_spread" || unit === "bps") return 0;
    if (unit === "pp" || unit === "%") return 2;
    return 2;
  }

  function renderFedEvidence(el, series) {
    const items = FED_EVIDENCE_IDS.map((id) => series[id]).filter(Boolean);
    if (!items.length) {
      el.innerHTML = `<div class="empty">尚無證據資料。</div>`;
      return;
    }
    el.innerHTML = items
      .map((s) => {
        const card = fedEvidenceCardHtml(s);
        if (s.id === "phillips") {
          return `<div class="fed-row fed-row--phillips">
            ${card}
            <div class="chart-box phillips-box">
              <div class="chart-title">菲利浦曲線（失業 × 通膨）</div>
              <p class="phillips-intro">
                每個點＝某月<strong>失業率（橫）</strong>× <strong>Core PCE（縱）</strong>。
                教科書斜線是理論；這裡看<strong>最新大點</strong>與<strong>時間路徑</strong>。灰→青綠＝越舊→越新。
              </p>
              <div class="phillips-legend" aria-hidden="true">
                <div class="pl-cell pl-tl"><span>左上</span>通膨高、失業還低<br/>偏「過熱／難降息」</div>
                <div class="pl-cell pl-tr"><span>右上</span>通膨高＋失業高<br/>兩頭痛（最棘手）</div>
                <div class="pl-cell pl-bl"><span>左下</span>通膨低、失業低<br/>相對友善</div>
                <div class="pl-cell pl-br"><span>右下</span>失業高、通膨已回<br/>偏衰退壓力、較能談鬆</div>
              </div>
              <div class="chart-el" id="chart-phillips"></div>
              <p class="phillips-foot">細線＝時間路徑。虛線＝近幾年中位。四角是讀圖輔助。</p>
            </div>
          </div>`;
        }
        return `<div class="fed-row" data-fed-id="${s.id}">
          ${card}
          <div class="chart-box">
            <div class="chart-title">${(FED_GUIDE[s.id] && FED_GUIDE[s.id].title) || s.label || s.id} 歷史</div>
            ${fedRangeBtnsHtml(s.id)}
            <div class="chart-el" id="chart-fed-${s.id}"></div>
          </div>
        </div>`;
      })
      .join("");
  }

  function drawFedLineChart(id) {
    const chart = ensureChart(`chart-fed-${id}`);
    const hist = state.histories[id];
    if (!chart || !hist || !hist.length) return;
    const r = fedRangeFor(id);
    const data = filterHistory(hist, r);
    const marks = fedMarkLines(id);
    const digits = fedValueDigits(id);
    const seriesOpt = {
      name: id,
      type: "line",
      showSymbol: false,
      data: data.map((d) => d.value),
      lineStyle: { width: 2, color: "#0f766e" },
      itemStyle: { color: "#0f766e" },
      areaStyle: { color: "rgba(15, 118, 110, 0.08)" },
    };
    if (marks.length) {
      seriesOpt.markLine = {
        silent: true,
        symbol: "none",
        lineStyle: { type: "dashed", color: "#94a3b8", width: 1 },
        label: { fontSize: 10, color: "#64748b" },
        data: marks.map((m) => ({
          yAxis: m.yAxis,
          name: m.name,
          label: { formatter: m.name, position: "insideEndTop" },
        })),
      };
    }
    chart.setOption(
      {
        animation: false,
        grid: baseGrid(r),
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const p = Array.isArray(params) ? params[0] : params;
            if (!p) return "";
            const unit =
              id === "fed_bs" ? " 兆美元" : id === "hy_spread" ? " bps" : id === "icsa" ? "" : "";
            return `${p.axisValue}<br/>${fmt(p.data, digits)}${unit}`;
          },
        },
        xAxis: {
          type: "category",
          data: data.map((d) => d.date),
          axisLabel: { fontSize: 10 },
        },
        yAxis: {
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
          axisLabel: {
            fontSize: 10,
            formatter: (v) =>
              id === "icsa"
                ? fmt(v, 0)
                : id === "fed_bs"
                  ? fmt(v, 1)
                  : id === "hy_spread"
                    ? fmt(v, 0)
                    : fmt(v, digits),
          },
        },
        series: [seriesOpt],
        ...zoomExtras(r),
      },
      true
    );
  }

  function drawAllFedCharts() {
    FED_EVIDENCE_IDS.forEach((id) => {
      if (id === "phillips") drawPhillipsChart();
      else if (state.histories[id]) drawFedLineChart(id);
    });
    // flex 布局後補一次 resize，避免圖高度卡住
    requestAnimationFrame(() => {
      FED_EVIDENCE_IDS.forEach((id) => {
        const cid = id === "phillips" ? "chart-phillips" : `chart-fed-${id}`;
        const c = state.charts[cid];
        if (c) c.resize();
      });
    });
  }

  function syncFedRangeUi(id, range) {
    document.querySelectorAll(`[data-fed-range="${id}"]`).forEach((group) => {
      group.querySelectorAll("button[data-range]").forEach((b) => {
        b.classList.toggle("active", b.dataset.range === range);
      });
    });
  }

  function maCardHtml(s) {
    const ma = s.ma || {};
    const below = ma.below_sma_close || {};
    const dist = ma.distance_pct || {};
    const chips = ["30", "60", "200"]
      .map((w) => {
        const b = below[w];
        const d = dist[w];
        if (b == null) return `<span class="chip chip-na">SMA${w} —</span>`;
        const cls = b ? "chip-bad" : "chip-ok";
        const sign = d > 0 ? "+" : "";
        const txt = b ? `破 ${w}` : `站 ${w}`;
        return `<span class="chip ${cls}">${txt} ${sign}${fmt(d, 1)}%</span>`;
      })
      .join("");
    const latest = s.latest || {};
    return `
      <article class="card">
        <div class="label"><span>${s.label}</span><span class="tag ${tagClass(s.tag)}">${s.tag}</span></div>
        <div class="value">${fmt(latest.value, 2)}</div>
        <div class="sub">${latest.date || "—"} · 收盤</div>
        <div class="ma-row">${chips}</div>
      </article>`;
  }

  function maBelow(s) {
    return (s && s.ma && s.ma.below_sma_close) || {};
  }

  function maDist(s) {
    return (s && s.ma && s.ma.distance_pct) || {};
  }

  /** 依收盤破線深度回傳水位階 */
  function breakTier(s) {
    const b = maBelow(s);
    if (b["200"] === true) return { key: "200", label: "破 200", action: "最後一次降水位 → 鎖死底倉，不再砍", cls: "tier-bear" };
    if (b["60"] === true) return { key: "60", label: "破 60", action: "中期破壞 → 再降一次總曝險", cls: "tier-warn" };
    if (b["30"] === true) return { key: "30", label: "破 30", action: "強制降低總曝險約 20%", cls: "tier-alert" };
    if (b["30"] === false) return { key: "ok", label: "站上 30／60／200", action: "均線法無強制降水位（仍看 VIX）", cls: "tier-ok" };
    return { key: "na", label: "資料不足", action: "—", cls: "tier-na" };
  }

  function tangleNote(s) {
    const d = maDist(s);
    const d30 = d["30"];
    const d60 = d["60"];
    if (d30 == null || d60 == null) return null;
    // 兩線距離 <5%：用收盤與兩條均線的相對距離差近似「糾結」
    const spread = Math.abs(d30 - d60);
    if (spread < 5) return `30／60 距離約 ${fmt(spread, 1)}%（<5%）→ 長黑可能只降 20～30%，不一次腰斬`;
    return null;
  }

  function renderRulesBox(el, series) {
    if (!el) return;
    const qqq = series && series.qqq;
    const twii = series && series.twii;
    const qTier = breakTier(qqq);
    const tTier = breakTier(twii);
    const qTangle = tangleNote(qqq);
    const tTangle = tangleNote(twii);

    const row = (key, title, body) => {
      const on =
        key === "ok"
          ? qTier.key === "ok" && tTier.key === "ok"
          : qTier.key === key || tTier.key === key;
      return `<tr class="${on ? "rule-active" : ""}">
        <td><strong>${title}</strong>${on ? ' <span class="rule-now">現在</span>' : ""}</td>
        <td>${body}</td>
      </tr>`;
    };

    const accountBlock = (name, bench, tier, tangle) => `
      <div class="rule-live ${tier.cls}">
        <div class="rule-live-k">${name}（標竿 ${bench}）</div>
        <div class="rule-live-v">${tier.label}</div>
        <div class="rule-live-a">${tier.action}</div>
        ${tangle ? `<div class="rule-live-note">${tangle}</div>` : ""}
      </div>`;

    el.innerHTML = `
      <article class="card card-rule">
        <div class="label">
          <span>破線減碼規則</span>
          <span class="tag tag-derived">第二層</span>
        </div>
        <p class="rule-lead">收盤破 SMA 才算扳機。IB 看 QQQ、台股看加權；優先砍相對弱勢、帳上賠錢股。與 VIX 同時觸發 → 取較嚴格者。</p>
        <div class="rule-live-row">
          ${accountBlock("IB", "QQQ", qTier, qTangle)}
          ${accountBlock("台股", "加權", tTier, tTangle)}
        </div>
        <table class="rule-table">
          <thead><tr><th>觸發</th><th>動作</th></tr></thead>
          <tbody>
            ${row("ok", "站上各線", "均線法不強制降水位")}
            ${row("30", "跌破 SMA30", "強制降低總曝險約 <strong>20%</strong>")}
            ${row("60", "跌破 SMA60", "中期趨勢破壞 → <strong>再降一次</strong>")}
            ${row(
              "200",
              "跌破 SMA200",
              "熊市格局 → <strong>最後一次</strong>降水位後鎖死底倉，不再砍"
            )}
          </tbody>
        </table>
        <div class="fed-guide">
          <p><strong>加回</strong>　站回 30 MA 後不衝；等站穩後<strong>第二個交易日尾盤</strong>仍守住，再分批加回。</p>
          <p><strong>個股</strong>　破線就處理，不因「基本面還好」硬扛；減碼節奏跟標竿降水位。</p>
        </div>
      </article>

      <article class="card card-rule">
        <div class="label">
          <span>部位／Full Throttle</span>
          <span class="tag tag-derived">第三層</span>
        </div>
        <p class="rule-lead">單檔 %＝該檔市值 ÷ <strong>該帳戶淨值</strong>。IB／台股分開算，不合併心算。本卡不連帳戶，只釘規則。</p>
        <table class="rule-table">
          <thead><tr><th>階段</th><th>占淨值</th><th>條件</th></tr></thead>
          <tbody>
            <tr><td>試錯／觀察</td><td class="num"><strong>5%～8%</strong></td><td>有預期差，還在驗證</td></tr>
            <tr><td>常態上限</td><td class="num"><strong>10%</strong></td><td>劇本成立；自有資金建滿到此<strong>停</strong></td></tr>
            <tr><td>Full Throttle</td><td class="num"><strong>→ 20%</strong></td><td>三條件全過 → 融資加碼同一檔</td></tr>
            <tr><td>絕對硬頂</td><td class="num"><strong>20%</strong></td><td>不可超過；同時滿倉 20% 建議 1～2 檔</td></tr>
          </tbody>
        </table>
        <p class="token-table-title">Full Throttle 三條件（全過才借錢 10%→20%）</p>
        <ol class="ft-checklist">
          <li>財報／報價已驗證劇本</li>
          <li>宏觀流動性順風（Fed 路徑有利、HY 未急擴）</li>
          <li>已有獲利護墊（加碼不傷本體）</li>
        </ol>
        <p class="token-table-title">破線時單檔怎麼砍</p>
        <table class="rule-table">
          <thead><tr><th>單檔水位</th><th>遞減</th></tr></thead>
          <tbody>
            <tr><td>≤10%（無槓桿）</td><td>10% → 8% → 5% → 清</td></tr>
            <tr><td>10%～20%（有融資）</td><td>20% → 15% → 10% → 清（優先還融資）</td></tr>
          </tbody>
        </table>
        <div class="fed-guide">
          <p><strong>槓桿</strong>　平時 1.2～1.3x；FT／很看好 1.5～1.8x；硬頂 <strong>2.0x</strong>。VIX 黃燈（18～25）先降回 1.0x。</p>
          <p><strong>建倉節奏</strong>　0→5%→約 8%→10%（不借錢）。沒過 FT 不借錢加過 10%。</p>
        </div>
      </article>`;
  }

  function renderStatusTable(el, series) {
    const rows = MA_IDS.map((id) => series[id]).filter(Boolean);
    if (!rows.length) {
      el.innerHTML = `<div class="empty">尚無均線資料</div>`;
      return;
    }
    const head = `
      <table class="status-table">
        <thead>
          <tr>
            <th>指數</th>
            <th>收盤</th>
            <th>SMA30</th>
            <th>SMA60</th>
            <th>SMA200</th>
          </tr>
        </thead>
        <tbody>
    `;
    const body = rows
      .map((s) => {
        const below = (s.ma && s.ma.below_sma_close) || {};
        const dist = (s.ma && s.ma.distance_pct) || {};
        const cell = (w) => {
          const b = below[w];
          const d = dist[w];
          if (b == null) return `<td class="na">—</td>`;
          const cls = b ? "bad" : "ok";
          const sign = d > 0 ? "+" : "";
          return `<td class="${cls}">${b ? "破" : "站"} ${sign}${fmt(d, 1)}%</td>`;
        };
        return `<tr>
          <td><strong>${s.label}</strong></td>
          <td class="num">${fmt((s.latest || {}).value, 2)}</td>
          ${cell("30")}${cell("60")}${cell("200")}
        </tr>`;
      })
      .join("");
    el.innerHTML = head + body + "</tbody></table>";
  }

  function renderSeriesGrid(el, series, ids, fallbackNote) {
    const items = ids.map((id) => series[id]).filter(Boolean);
    if (!items.length) {
      el.innerHTML = `<div class="empty">${fallbackNote}</div>`;
      return;
    }
    el.innerHTML = items.map(cardHtml).join("");
  }

  function tokenTokLabel(v) {
    if (v == null || Number.isNaN(Number(v))) return "—";
    const n = Number(v);
    if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
    return fmt(n, 0);
  }

  function renderToken(box, tok) {
    if (!box) return;
    const L = tok && tok.latest;
    if (!L) {
      box.innerHTML = `<div class="empty">尚無 Token 資料。執行 scripts/fetch_token.py。</div>`;
      return;
    }
    const srcUrl = tok.source_url || "https://openrouter.ai/rankings";
    const src = `<a href="${srcUrl}" target="_blank" rel="noopener">https://openrouter.ai/rankings</a>`;
    const R = L.region || {};
    const niceName = (s) =>
      String(s || "")
        .replace(/-\d{8}$/, "")
        .replace(/-\d{4}-\d{2}-\d{2}$/, "");
    const chgTxt = (v) =>
      v == null ? "—" : `${v > 0 ? "+" : ""}${fmt(v, 0)}%`;
    const vs = L.compare_date_wow ? `（對 ${L.compare_date_wow}）` : "";

    const topRows = (L.top20 || [])
      .slice(0, 8)
      .map((m) => {
        const regClass =
          m.region === "us" ? "tok-us" : m.region === "cn" ? "tok-cn" : "tok-other";
        return `<tr>
          <td class="num">${m.rank}</td>
          <td><span class="tok-region ${regClass}">${m.region_label || "其他"}</span></td>
          <td title="${m.slug}">${niceName(m.short || m.slug)}</td>
          <td class="num">${m.tokens_label}</td>
        </tr>`;
      })
      .join("");

    box.innerHTML = `
      <article class="card card-token-summary">
        <div class="label">
          <span>全平台 Token · 日快照（${L.date || "—"}）</span>
          <span class="tag tag-trial">${tok.tag || "代理指標"}</span>
        </div>
        <div class="value">${L.total_tokens_label || "—"}</div>
        <div class="sub">趨勢 <strong>${L.trend || "—"}</strong> · 近週 ${chgTxt(L.chg_wow_pct)}${vs} · 近月約 ${chgTxt(
      L.chg_approx_1m_pct
    )}（週排行口徑）</div>
        <div class="token-split token-split--lg">
          <span>美國 <strong>${R.us_label || "—"}</strong>（${fmt(R.us_share_pct, 0)}%）</span>
          <span>中國 <strong>${R.cn_label || "—"}</strong>（${fmt(R.cn_share_pct, 0)}%）</span>
          <span>御三家 <strong>${L.big3_tokens_label || "—"}</strong>（${fmt(L.big3_share_pct, 0)}%）</span>
        </div>

        <p class="token-table-title">當日熱門（前 8，誰在扛）</p>
        <table class="token-compare-table">
          <thead>
            <tr><th>#</th><th>地區</th><th>模型</th><th>Tokens</th></tr>
          </thead>
          <tbody>${topRows || `<tr><td colspan="4" class="muted">無</td></tr>`}</tbody>
        </table>

        <div class="fed-guide">
          <p><strong>是什麼</strong>　OpenRouter 上的 AI 用量體溫計。主判斷只看總量方向；中美／榜單只是拆解。</p>
          <p><strong>怎麼看</strong>　${tok.note || ""}</p>
          <p class="fed-scenario"><strong>情境推導</strong>　總量穩升：需求順風。走平：領先指標不熱。明顯放緩：算力採購可能降溫，半導體新開倉更保守。</p>
          <p><strong>資料來源</strong>　${src}</p>
        </div>
        <div class="sub">${tok.updated_at || "—"} · ${tok.source || ""}</div>
      </article>`;
  }

  function drawTokenChart() {
    const chart = ensureChart("chart-token-total");
    const all = state.histories.token || [];
    // 週排行口徑一致，才適合回答「有沒有持續往上」
    const hist = all.filter((d) => d.grain === "weekly_chart_top" || !d.grain);
    if (!chart || !hist.length) return;
    chart.setOption({
      animation: false,
      grid: { left: 52, right: 16, top: 36, bottom: 28 },
      legend: {
        data: ["全平台合計", "美國模型", "中國模型"],
        top: 0,
        textStyle: { fontSize: 11 },
      },
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const arr = Array.isArray(params) ? params : [params];
          if (!arr.length) return "";
          const lines = [arr[0].axisValue];
          arr.forEach((p) => {
            if (p.data == null) return;
            lines.push(`${p.marker}${p.seriesName}: ${tokenTokLabel(p.data)}`);
          });
          return lines.join("<br/>");
        },
      },
      xAxis: {
        type: "category",
        data: hist.map((d) => d.date),
        axisLabel: { fontSize: 10 },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: { lineStyle: { color: "#e8edf2" } },
        axisLabel: {
          fontSize: 10,
          formatter: (v) => tokenTokLabel(v),
        },
      },
      series: [
        {
          name: "全平台合計",
          type: "line",
          showSymbol: false,
          connectNulls: false,
          data: hist.map((d) => d.total),
          lineStyle: { width: 3, color: "#15202b" },
          itemStyle: { color: "#15202b" },
          areaStyle: { color: "rgba(21,32,43,0.05)" },
          z: 3,
        },
        {
          name: "美國模型",
          type: "line",
          showSymbol: false,
          connectNulls: false,
          data: hist.map((d) => d.us),
          lineStyle: { width: 1.6, color: "#1d4ed8" },
          itemStyle: { color: "#1d4ed8" },
          z: 2,
        },
        {
          name: "中國模型",
          type: "line",
          showSymbol: false,
          connectNulls: false,
          data: hist.map((d) => d.cn),
          lineStyle: { width: 1.6, color: "#be123c" },
          itemStyle: { color: "#be123c" },
          z: 2,
        },
      ],
    });
  }

  function renderInventory(box, inv) {
    if (!box) return;
    const L = inv && inv.latest;
    if (!L) {
      box.innerHTML = `<div class="empty">尚無庫存循環資料。執行 scripts/fetch_inventory.py。</div>`;
      return;
    }
    const srcUrl = inv.source_url || "https://www.ismworld.org/";
    const src = `<a href="${srcUrl}" target="_blank" rel="noopener">ISM PMI 報告</a>`;
    const chg =
      L.chg_mom == null ? "—" : `${L.chg_mom > 0 ? "+" : ""}${fmt(L.chg_mom, 1)}`;
    const toneCls =
      L.tone === "ok" ? "tier-ok" : L.tone === "warn" ? "tier-alert" : L.tone === "bad" ? "tier-bear" : "tier-na";

    box.innerHTML = `
      <article class="card card-rule">
        <div class="label">
          <span>ISM 差值 · ${L.date || "—"}</span>
          <span class="tag tag-derived">${inv.tag || "衍生指標"}</span>
        </div>
        <div class="value">${fmt(L.spread, 1)}</div>
        <div class="sub">新訂單 ${fmt(L.new_orders, 1)} − 客戶庫存 ${fmt(L.customers_inv, 1)} · MoM ${chg}${L.source === "seed" ? " · 種子資料（待官方月報更新）" : ""}</div>
        <div class="rule-live ${toneCls}" style="margin:0.65rem 0">
          <div class="rule-live-k">溫度計判讀（≠直接等於階段）</div>
          <div class="rule-live-a">${L.reading || "—"}</div>
          ${L.anchor ? `<div class="rule-live-note">${L.anchor}</div>` : ""}
        </div>
        <div class="token-split token-split--lg">
          <span>headline PMI <strong>${L.pmi != null ? fmt(L.pmi, 1) : "—"}</strong></span>
          <span>新訂單 <strong>${fmt(L.new_orders, 1)}</strong>（&gt;50 偏強）</span>
          <span>客戶庫存 <strong>${fmt(L.customers_inv, 1)}</strong>（&lt;50 偏「太低」）</span>
        </div>
        <p class="token-table-title">四階段怎麼判斷（差值只給線索）</p>
        <p class="fms-chart-note" style="margin:0 0 0.55rem">主動／被動 × 補／去。差值偏補或偏去；主動還是被動要靠報價＋庫存天數分辨。</p>
        <table class="rule-table">
          <thead>
            <tr>
              <th>階段</th>
              <th>差值線索</th>
              <th>驗證要對上</th>
              <th>框架動作</th>
            </tr>
          </thead>
          <tbody>
            <tr class="${L.tone === "ok" && L.spread >= 3 ? "rule-active" : ""}">
              <td><strong>① 主動補</strong><br /><span class="sub">真缺貨、搶下單</span></td>
              <td>高正值、還在升</td>
              <td>報價↑、庫存天數低／開始補、毛利擴</td>
              <td>順勢 B 戰場</td>
            </tr>
            <tr class="${L.tone === "warn" ? "rule-active" : ""}">
              <td><strong>② 被動補</strong><br /><span class="sub">需求已慢、貨還在進</span></td>
              <td>高正值、見頂回落</td>
              <td>報價漲不動、庫存天數開始升</td>
              <td>警訊、提高警覺</td>
            </tr>
            <tr class="${L.tone === "bad" && L.spread < 0 ? "rule-active" : ""}">
              <td><strong>③ 主動去</strong><br /><span class="sub">砍單清倉換現金</span></td>
              <td>負值、持續下探</td>
              <td>砍單／降價、庫存暴增、毛利縮</td>
              <td>減碼或避險</td>
            </tr>
            <tr class="${L.tone === "bad" && L.spread >= 0 ? "rule-active" : ""}">
              <td><strong>④ 被動去</strong><br /><span class="sub">貨已低、還不敢大補</span></td>
              <td>負值、止跌回升</td>
              <td>庫存已低、報價止跌、訂單弱但不崩</td>
              <td>小批左側（要預期差）</td>
            </tr>
          </tbody>
        </table>
        <div class="sub">${inv.updated_at || "—"} · ${src}（FRED 已無 ISM 分項）</div>
      </article>`;
  }

  function drawInventoryChart() {
    const chart = ensureChart("chart-inventory");
    const hist = state.histories.inventory || [];
    if (!chart || !hist.length) return;
    chart.setOption({
      animation: false,
      grid: { left: 48, right: 16, top: 36, bottom: 28 },
      legend: { data: ["差值（主看這個）", "新訂單", "客戶庫存"], top: 0, textStyle: { fontSize: 11 } },
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const arr = Array.isArray(params) ? params : [params];
          if (!arr.length) return "";
          const lines = [arr[0].axisValue];
          arr.forEach((p) => {
            if (p.data == null) return;
            lines.push(`${p.marker}${p.seriesName}: ${fmt(p.data, 1)}`);
          });
          return lines.join("<br/>");
        },
      },
      xAxis: {
        type: "category",
        data: hist.map((d) => d.date),
        axisLabel: { fontSize: 10 },
      },
      yAxis: {
        type: "value",
        scale: true,
        splitLine: { lineStyle: { color: "#e8edf2" } },
        axisLabel: { fontSize: 10 },
      },
      series: [
        {
          name: "差值（主看這個）",
          type: "line",
          showSymbol: true,
          symbolSize: 10,
          data: hist.map((d) => d.spread),
          lineStyle: { width: 3.5, color: "#0f766e" },
          itemStyle: { color: "#0f766e" },
          areaStyle: { color: "rgba(15,118,110,0.08)" },
          markLine: {
            silent: true,
            symbol: "none",
            data: [
              { yAxis: 3, name: "錨+3" },
              { yAxis: 0, name: "零軸" },
            ],
            lineStyle: { type: "dashed", color: "#94a3b8", width: 1.2 },
            label: { fontSize: 10, color: "#64748b" },
          },
          z: 3,
        },
        {
          name: "新訂單",
          type: "line",
          showSymbol: false,
          data: hist.map((d) => d.new_orders),
          lineStyle: { width: 1, color: "#93c5fd", type: "dotted" },
          itemStyle: { color: "#93c5fd" },
          z: 1,
        },
        {
          name: "客戶庫存",
          type: "line",
          showSymbol: false,
          data: hist.map((d) => d.customers_inv),
          lineStyle: { width: 1, color: "#fcd34d", type: "dotted" },
          itemStyle: { color: "#fcd34d" },
          z: 1,
        },
      ],
    });
  }

  function renderFedWatch(el, fw) {
    if (!el) return;
    if (!fw || !fw.next) {
      el.innerHTML = `<div class="empty">尚無 FedWatch 自算。執行 scripts/fetch_fedwatch.py。</div>`;
      return;
    }
    const n = fw.next;
    const tgt = fw.current_target || "—";
    const age = daysSince(fw.updated_at);
    const src =
      fw.source_url
        ? `<a href="${fw.source_url}" target="_blank" rel="noopener">對照官方 FedWatch</a>`
        : "";
    const bands = (n.bands || [])
      .map(
        (b) =>
          `<tr><td>${b.label}</td><td class="num">${fmt(b.pct, 1)}%</td><td>${
            b.vs_current === "hold" ? "維持" : b.vs_current === "ease" ? "降息側" : "升息側"
          }</td></tr>`
      )
      .join("");
    const more = (fw.meetings || [])
      .slice(1, 4)
      .map((m) => {
        return `<li><strong>${m.meeting_date}</strong>：降 ${fmt(m.ease_pct, 1)}% · 停 ${fmt(
          m.hold_pct,
          1
        )}% · 升 ${fmt(m.hike_pct, 1)}% <span class="muted">（相對目前區間）</span></li>`;
      })
      .join("");
    const ye = fw.year_end;
    const yeLine = ye
      ? `<p class="fedwatch-ye">年底會議（${ye.meeting_date}）相對目前：降 ${fmt(
          ye.ease_pct,
          1
        )}% · 停 ${fmt(ye.hold_pct, 1)}% · 升 ${fmt(ye.hike_pct, 1)}%</p>`
      : "";
    el.innerHTML = `
      <article class="card card-fedwatch">
        <div class="label">
          <span>市場定價（FedWatch 自算）</span>
          <span class="tag tag-trial">${fw.tag || "自算近似"}</span>
        </div>
        <p class="fedwatch-sub">
          下次 FOMC <strong>${n.meeting_date || "—"}</strong>
          · 目前目標 <strong>${tgt}</strong>
          ${fw.effr != null ? `· EFFR ${fmt(fw.effr, 2)}%` : ""}
        </p>
        <div class="fedwatch-probs">
          <div class="fw-p">
            <div class="fw-k">降息</div>
            <div class="fw-v ease">${fmt(n.ease_pct, 1)}%</div>
          </div>
          <div class="fw-p">
            <div class="fw-k">維持</div>
            <div class="fw-v hold">${fmt(n.hold_pct, 1)}%</div>
          </div>
          <div class="fw-p">
            <div class="fw-k">升息</div>
            <div class="fw-v hike">${fmt(n.hike_pct, 1)}%</div>
          </div>
        </div>
        <table class="fedwatch-bands">
          <thead><tr><th>會後目標區間</th><th>機率</th><th>相對目前</th></tr></thead>
          <tbody>${bands}</tbody>
        </table>
        ${yeLine}
        ${more ? `<ul class="fedwatch-more">${more}</ul>` : ""}
        <div class="fed-guide">
          <p><strong>是什麼</strong>　用聯邦基金期貨結算價＋目前目標區間，自算市場對「下次會議」升／停／降的隱含機率。思路近似 CME FedWatch，<em>不是</em>官方網頁截圖。</p>
          <p><strong>怎麼看</strong>　跟 Truflation／就業交叉：自算很鷹但通膨就業偏冷 → 可能過度定價；很鴿但通膨再熱 → 可能過度樂觀。小數與官網差幾個百分點正常。</p>
          <p class="fed-scenario"><strong>情境推導</strong>　單看機率不夠下單；用來判斷市場情緒偏鷹／偏鴿，再對照本區證據牆與第二層均線／HY。</p>
        </div>
        <div class="sub">${fw.updated_at || "—"}${
      age != null ? `（${age} 天前）` : ""
    } · ${fw.source || ""} · ${src}</div>
      </article>`;
  }

  function renderFms(box, fms) {
    const L = fms && fms.latest;
    if (!L) {
      box.innerHTML = `<div class="empty">尚無 FMS 資料。同步 Insight 後會自動抽取。</div>`;
      return;
    }
    const cashWarn = L.cash_pct_aum != null && L.cash_pct_aum < L.cash_alert_line;
    const cashHigh = L.cash_pct_aum != null && L.cash_pct_aum >= 5;
    const crowdedArr = L.most_crowded || [];
    const crowded = crowdedArr.map((c) => `${c.name} ${c.pct}%`).join(" · ");
    const land = L.landing || {};
    const age = daysSince(L.publish_date);
    const srcLink =
      L.source && String(L.source).startsWith("http")
        ? `<a href="${L.source}" target="_blank" rel="noopener">Insight 原文</a>`
        : "Insight／自動抽取";
    const list = (arr) => (arr && arr.length ? arr.join("、") : "—");
    const cleanList = (arr) =>
      list((arr || []).map((x) => String(x).replace(/\s*資產類別\s*$/, "").trim()).filter(Boolean));

    let cashLive = "目前：—";
    if (L.cash_pct_aum != null) {
      if (cashWarn) cashLive = `目前 ${fmt(L.cash_pct_aum, 1)}%：低於約 4% 警戒 → 偏樂觀、彈藥偏少`;
      else if (cashHigh) cashLive = `目前 ${fmt(L.cash_pct_aum, 1)}%：≥約 5% → 框架偏「還有子彈」參考`;
      else cashLive = `目前 ${fmt(L.cash_pct_aum, 1)}%：在警戒附近，看方向即可`;
    }

    const metaLine = `調查 ${L.survey_period || "—"} · 發布 ${L.publish_date || "—"} · 樣本 ${
      L.sample_size || "—"
    }${L.aum_bn_usd != null ? ` 人／AUM 約 ${fmt(L.aum_bn_usd, 0)} 億美元` : ""}${
      age != null ? ` · 距上次 ${age} 天` : ""
    } · ${srcLink}`;

    const cards = [
      {
        title: "現金占 AUM",
        value: `${fmt(L.cash_pct_aum, 1)}%`,
        live: cashLive,
        what: "經理人手上「還沒投入」的現金，占管理資產（AUM）的比例。",
        how: "越低＝越敢把錢投入市場。約 4% 是常見樂觀警戒；極低＝擠、彈藥少。",
        use: "框架：≥約 5% 偏買入參考；極低（如 ~3.9%）提高警覺。不單獨當買賣燈，要對照擁擠、均線、HY。",
      },
      {
        title: "景氣著陸預期",
        value: `硬 ${land.hard ?? "—"}% · 軟 ${land.soft ?? "—"}% · 不著陸 ${land.no_landing ?? "—"}%`,
        live:
          L.growth_optimism_net_pct != null
            ? `成長樂觀淨 ${L.growth_optimism_net_pct}%（淨＝偏樂觀減偏悲觀那類口徑）`
            : "成長樂觀淨：原文未抽出",
        what: "問未來約 12 個月全球經濟：硬著陸（變很差）、軟著陸（降溫但還行）、不著陸（幾乎不停）。",
        how: "不著陸／軟著陸高＝機構偏樂觀；硬著陸升＝開始怕衰退。",
        use: "和 Fed 意圖區的就業／通膨對照：若經理人很樂觀但數據轉弱，留意預期差。",
      },
      {
        title: "最擁擠交易",
        value: crowded || "—",
        live: `科技倉位 Z-Score ${
          L.tech_zscore != null ? fmt(L.tech_zscore, 1) + "σ" : "—"
        }（相對自己歷史；正＝偏超配，負＝偏低配）${
          L.equity_ow_pct != null ? ` · 願意超配股票 ${L.equity_ow_pct}%` : ""
        }`,
        what: "問卷問「現在哪邊人擠最多」——大家最常點名的擁擠交易。",
        how: "數字很高＝多數人站同一邊，擠兌／獲利了結時波動常變大。",
        use: "框架：籌碼擁擠時新開倉更嚴看估值與預期差；和現金極低一起出現時更要小心。",
      },
      {
        title: "通膨／Fed／油價預期",
        value: `預期 CPI 再升（淨） ${L.cpi_higher_net_pct ?? "—"}%`,
        live: `期中選前「不會升息」 ${L.fed_no_hike_before_midterm_pct ?? "—"}% · 年底油價中位 $${
          L.oil_yearend_median_usd ?? "—"
        }`,
        what: "經理人自己怎麼猜通膨、Fed、油價——是「看法」，不是期貨定價。",
        how: "CPI↑淨高＝怕通膨再燒；不升息比例高＝偏鴿預期。油價中位牽動通膨想像。",
        use: "拿去跟 Truflation／Core PCE／FedWatch 比：看法和市場定價差很多時，常是行情敏感點。",
      },
      {
        title: "AI 敘事（問卷）",
        value: `CAPEX 系統風險（淨） ${L.ai_capex_systemic_risk_net_pct ?? "—"}%`,
        live: `認為 AI 是泡沫 ${L.ai_bubble_pct ?? "—"}%`,
        what: "機構對「AI 大燒錢會不會變成系統風險／泡沫」的態度。",
        how: "系統風險淨升高＝更擔心 CSP 舉債燒 CAPEX；泡沫% 看有多少人直接說泡沫。",
        use: "半導體／AI 鏈情緒參考。仍要以財報、Capex、Token／需求主線為主，FMS 只輔助。",
      },
      {
        title: "倉位加減碼",
        value: "本月相對上月（MoM）",
        live: `加碼：${cleanList(L.mom_overweight)}`,
        what: "MoM＝跟上個月比，往哪裡加、往哪裡砍。Absolute＝現在問卷裡願意超配／低配誰。",
        how: "看輪動方向：錢從哪裡流出、流進防禦還是週期、美股還是海外。",
        use: `MoM 減碼：${cleanList(L.mom_underweight)}<br/>Absolute 超配：${cleanList(
          L.abs_overweight
        )}<br/>Absolute 低配：${cleanList(L.abs_underweight)}`,
      },
    ];

    box.innerHTML =
      `<p class="fms-meta">${metaLine}</p>` +
      cards
        .map(
          (c) => `
      <article class="card card-fed card-fms">
        <div class="label"><span>${c.title}</span><span class="tag tag-survey">問卷（FMS）</span></div>
        <div class="value" style="font-size:1.25rem">${c.value}</div>
        <div class="sub anchor-line">${c.live}</div>
        <div class="fed-guide">
          <p><strong>是什麼</strong>　${c.what}</p>
          <p><strong>怎麼看</strong>　${c.how}</p>
          <p class="fed-scenario"><strong>框架怎麼用</strong>　${c.use}</p>
        </div>
      </article>`
        )
        .join("");
  }

  function drawFmsCharts() {
    const hist = state.histories.fms || [];
    const cashChart = ensureChart("chart-fms-cash");
    if (cashChart && hist.length) {
      const pts = hist.filter((h) => h.cash_pct_aum != null && h.ym);
      cashChart.setOption(
        {
          animation: false,
          grid: { left: 44, right: 16, top: 24, bottom: 36 },
          tooltip: { trigger: "axis" },
          xAxis: {
            type: "category",
            data: pts.map((h) => h.ym),
            axisLabel: { fontSize: 10 },
          },
          yAxis: {
            type: "value",
            scale: true,
            axisLabel: { formatter: (v) => v + "%" },
            splitLine: { lineStyle: { color: "#e8edf2" } },
          },
          series: [
            {
              name: "現金%",
              type: "line",
              showSymbol: true,
              symbolSize: 6,
              data: pts.map((h) => h.cash_pct_aum),
              lineStyle: { width: 2, color: "#0f766e" },
              itemStyle: { color: "#0f766e" },
              markLine: {
                silent: true,
                symbol: "none",
                lineStyle: { type: "dashed", color: "#b45309" },
                data: [{ yAxis: 4, label: { formatter: "警戒 4%", fontSize: 10 } }],
              },
            },
          ],
        },
        true
      );
    }
    const landChart = ensureChart("chart-fms-landing");
    if (landChart && hist.length) {
      const pts = hist.filter((h) => h.landing && (h.landing.hard != null || h.landing.soft != null));
      landChart.setOption(
        {
          animation: false,
          grid: { left: 44, right: 16, top: 28, bottom: 36 },
          tooltip: { trigger: "axis" },
          legend: { data: ["硬著陸", "軟著陸", "不著陸"], top: 0, textStyle: { fontSize: 11 } },
          xAxis: {
            type: "category",
            data: pts.map((h) => h.ym),
            axisLabel: { fontSize: 10 },
          },
          yAxis: {
            type: "value",
            scale: true,
            axisLabel: { formatter: (v) => v + "%" },
            splitLine: { lineStyle: { color: "#e8edf2" } },
          },
          series: [
            {
              name: "硬著陸",
              type: "line",
              showSymbol: false,
              data: pts.map((h) => (h.landing && h.landing.hard != null ? h.landing.hard : null)),
              lineStyle: { width: 1.6, color: "#991b1b" },
            },
            {
              name: "軟著陸",
              type: "line",
              showSymbol: false,
              data: pts.map((h) => (h.landing && h.landing.soft != null ? h.landing.soft : null)),
              lineStyle: { width: 1.6, color: "#a16207" },
            },
            {
              name: "不著陸",
              type: "line",
              showSymbol: false,
              data: pts.map((h) =>
                h.landing && h.landing.no_landing != null ? h.landing.no_landing : null
              ),
              lineStyle: { width: 1.6, color: "#166534" },
            },
          ],
        },
        true
      );
    }
  }

  function renderManual(el, manual) {
    const cards = (manual && manual.cards) || [];
    if (!cards.length) {
      el.innerHTML = `<div class="empty">尚無人工卡</div>`;
      return;
    }
    el.innerHTML = cards
      .map((c) => {
        const age = daysSince(c.as_of);
        const src =
          c.source && String(c.source).startsWith("http")
            ? `· <a href="${c.source}" target="_blank" rel="noopener">來源</a>`
            : c.source
              ? `· ${c.source}`
              : "";
        return `
        <article class="card">
          <div class="label"><span>${c.label}</span><span class="tag ${tagClass(c.tag)}">${c.tag}</span></div>
          <div class="value" style="font-size:1.2rem">${c.value || "［待補］"}</div>
          <div class="sub">${c.as_of || "未填日期"}${age != null ? ` · 距上次 ${age} 天` : ""}</div>
          <div class="note">${c.reason || ""} ${src}</div>
        </article>`;
      })
      .join("");
  }

  function filterHistory(hist, range) {
    if (!hist || !hist.length) return [];
    if (range === "all") return hist;
    const now = Date.now();
    let cut;
    if (range === "ytd") {
      cut = Date.parse(new Date().getFullYear() + "-01-01");
    } else {
      const daysMap = {
        "1w": 7,
        "1m": 31,
        "3m": 93,
        "6m": 186,
        "1y": 365,
        "3y": 365 * 3,
        "5y": 365 * 5,
      };
      const days = daysMap[range] ?? 93;
      cut = now - days * 86400000;
    }
    return hist.filter((h) => Date.parse(h.date) >= cut);
  }

  /** 滾輪／拖曳縮放；短區間不加底部滑桿，避免圖被擠扁 */
  function zoomExtras(range) {
    const r = range || state.range;
    const short = ["1w", "1m", "3m"].includes(r);
    const zooms = [{ type: "inside", xAxisIndex: 0, filterMode: "filter", zoomOnMouseWheel: true }];
    if (!short) {
      zooms.push({
        type: "slider",
        xAxisIndex: 0,
        height: 16,
        bottom: 6,
        borderColor: "#d8dee6",
        fillerColor: "rgba(15, 118, 110, 0.15)",
        handleSize: "80%",
        textStyle: { fontSize: 10, color: "#5b6b7c" },
      });
    }
    return { dataZoom: zooms };
  }

  function baseGrid(range) {
    const r = range || state.range;
    const short = ["1w", "1m", "3m"].includes(r);
    return { left: 52, right: 14, top: 28, bottom: short ? 28 : 52 };
  }

  function ensureChart(id) {
    const el = document.getElementById(id);
    if (!el || typeof echarts === "undefined") return null;
    if (!state.charts[id]) {
      state.charts[id] = echarts.init(el);
      // 加入匯出圖片功能
      state.charts[id].setOption({
        toolbox: {
          show: true,
          right: 10,
          top: 0,
          feature: {
            saveAsImage: {
              title: "存圖",
              pixelRatio: 2,
              backgroundColor: "#fff",
            },
          },
        },
      });
    }
    return state.charts[id];
  }

  function drawPriceChart(chartId, histKey, title) {
    const chart = ensureChart(chartId);
    const hist = state.histories[histKey];
    if (!chart || !hist) return;
    const data = filterHistory(hist, state.range);
    const legend = ["收盤"];
    const series = [
      {
        name: "收盤",
        type: "line",
        showSymbol: false,
        data: data.map((d) => d.close),
        lineStyle: { width: 2, color: MA_COLORS.close },
        itemStyle: { color: MA_COLORS.close },
      },
    ];
    [
      ["sma30", "SMA30"],
      ["sma60", "SMA60"],
      ["sma200", "SMA200"],
    ].forEach(([key, name]) => {
      if (!state.show[key]) return;
      legend.push(name);
      series.push({
        name,
        type: "line",
        showSymbol: false,
        data: data.map((d) => d[key]),
        lineStyle: { width: 1.2, color: MA_COLORS[key] },
        itemStyle: { color: MA_COLORS[key] },
      });
    });
    chart.setOption(
      {
        animation: false,
        grid: baseGrid(state.range),
        tooltip: { trigger: "axis" },
        legend: { data: legend, top: 0, textStyle: { fontSize: 11 } },
        xAxis: {
          type: "category",
          data: data.map((d) => d.date),
          axisLabel: { fontSize: 10 },
        },
        yAxis: {
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
        },
        series,
        ...zoomExtras(state.range),
      },
      true
    );
  }

  function drawRelChart() {
    const chart = ensureChart("chart-rel");
    const hist = state.histories.rel;
    if (!chart || !hist) return;
    const raw = filterHistory(hist, state.range);
    if (!raw.length) {
      chart.clear();
      return;
    }
    // 依「目前可見區間」重新正規化到 100，避免切 3M 卻從五年前起點殘值起跳
    const q0 = raw[0].qqq_idx;
    const s0 = raw[0].sox_idx;
    const data = raw.map((d) => {
      const q = (d.qqq_idx / q0) * 100;
      const s = (d.sox_idx / s0) * 100;
      return {
        date: d.date,
        qqq_idx: Math.round(q * 100) / 100,
        sox_idx: Math.round(s * 100) / 100,
        sox_vs_qqq: Math.round((s - q) * 100) / 100,
      };
    });
    chart.setOption(
      {
        animation: false,
        grid: baseGrid(state.range),
        tooltip: { trigger: "axis" },
        legend: { data: ["QQQ", "SOX", "SOX−QQQ"], top: 0, textStyle: { fontSize: 11 } },
        xAxis: {
          type: "category",
          data: data.map((d) => d.date),
          axisLabel: { fontSize: 10 },
        },
        yAxis: [
          {
            type: "value",
            scale: true,
            name: "指數",
            nameTextStyle: { fontSize: 10, color: "#5b6b7c" },
            splitLine: { lineStyle: { color: "#e8edf2" } },
          },
          {
            type: "value",
            scale: true,
            name: "差",
            nameTextStyle: { fontSize: 10, color: "#5b6b7c" },
            splitLine: { show: false },
          },
        ],
        series: [
          {
            name: "QQQ",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.qqq_idx),
            lineStyle: { width: 1.6, color: "#15202b" },
          },
          {
            name: "SOX",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.sox_idx),
            lineStyle: { width: 1.6, color: "#0f766e" },
          },
          {
            name: "SOX−QQQ",
            type: "line",
            yAxisIndex: 1,
            showSymbol: false,
            data: data.map((d) => d.sox_vs_qqq),
            lineStyle: { width: 1.2, color: "#b45309", type: "dashed" },
          },
        ],
        ...zoomExtras(state.range),
      },
      true
    );
  }

  function drawVixChart() {
    const chart = ensureChart("chart-vix");
    const hist = state.histories.vix;
    if (!chart || !hist) return;
    const data = filterHistory(hist, state.range);
    const g = baseGrid(state.range);
    chart.setOption(
      {
        animation: false,
        grid: { ...g, left: 40, top: 16 },
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: data.map((d) => d.date),
          axisLabel: { fontSize: 10 },
        },
        yAxis: {
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
        },
        series: [
          {
            name: "VIX",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.close),
            areaStyle: { color: "rgba(109, 40, 217, 0.08)" },
            lineStyle: { width: 1.8, color: "#6d28d9" },
            itemStyle: { color: "#6d28d9" },
          },
        ],
        ...zoomExtras(state.range),
      },
      true
    );
  }

  function drawMarginChart(range) {
    const chart = ensureChart("chart-margin");
    const hist = state.histories.margin;
    if (!chart || !hist) return;
    const r = range || state.marginRange || "3m";
    const data = filterHistory(hist, r);
    chart.setOption(
      {
        animation: false,
        grid: baseGrid(r),
        tooltip: { trigger: "axis" },
        legend: { data: ["維持率%", "10日均"], top: 0, textStyle: { fontSize: 11 } },
        xAxis: {
          type: "category",
          data: data.map((d) => d.date),
          axisLabel: { fontSize: 10 },
        },
        yAxis: {
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
          axisLabel: { formatter: "{value}%" },
        },
        series: [
          {
            name: "維持率%",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.pct),
            lineStyle: { width: 2, color: "#0f766e" },
            itemStyle: { color: "#0f766e" },
            markLine: {
              symbol: "none",
              label: { formatter: "{b}", position: "insideEndTop", fontSize: 10 },
              data: [
                { yAxis: 166.7, name: "初始 166.7", lineStyle: { color: "#94a3b8", type: "dashed" } },
                { yAxis: 150, name: "參考 150", lineStyle: { color: "#b45309", type: "dashed" } },
                { yAxis: 140, name: "偏緊 140", lineStyle: { color: "#b91c1c", type: "dashed" } },
                { yAxis: 130, name: "極端 130", lineStyle: { color: "#7f1d1d", type: "dotted" } },
              ],
            },
          },
          {
            name: "10日均",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.ma10_pct),
            lineStyle: { width: 1.2, color: "#15202b" },
            itemStyle: { color: "#15202b" },
          },
        ],
        ...zoomExtras(r),
      },
      true
    );
  }

  function renderMarginDaySummary(el, pressure, balance) {
    if (!el) return;
    if (!pressure && !balance) {
      el.textContent = "尚無融資當日資料";
      return;
    }

    const parts = [];
    let asOf = null;

    if (pressure && pressure.history && pressure.history.length >= 2) {
      const cur = pressure.history[pressure.history.length - 1];
      const prev = pressure.history[pressure.history.length - 2];
      asOf = cur.date;
      const dpp = cur.pct - prev.pct;
      const cls = dpp > 0.005 ? "up" : dpp < -0.005 ? "down" : "flat";
      const sign = dpp > 0 ? "+" : "";
      parts.push(
        `維持率 <strong>${fmt(cur.pct, 2)}%</strong>` +
          ` <span class="${cls}">（日 ${sign}${fmt(dpp, 2)} pp）</span>`
      );
    } else if (pressure && pressure.latest) {
      asOf = pressure.latest.date;
      parts.push(`維持率 <strong>${fmt(pressure.latest.value, 2)}%</strong>`);
    }

    if (balance && balance.latest) {
      asOf = asOf || balance.latest.date;
      const chg = balance.latest.chg_yi;
      const cls =
        chg == null ? "flat" : chg > 0 ? "up" : chg < 0 ? "down" : "flat";
      const chgTxt =
        chg == null
          ? "—"
          : `${chg > 0 ? "+" : ""}${fmt(chg, 1)} 億`;
      parts.push(
        `融資餘額 <strong>${fmt(balance.latest.value, 0)} 億</strong>` +
          ` <span class="${cls}">（日 ${chgTxt}）</span>`
      );
    }

    el.innerHTML =
      parts.join('<span class="sep">·</span>') +
      (asOf ? `<span class="meta">資料日 ${asOf} · 紅＝維持率升／餘額增 · 綠＝維持率降／餘額減 · FinLab估算≠證交所整戶</span>` : "");
  }

  function renderMargin(el, pressure, balance) {
    const cards = [];
    if (pressure) {
      const L = pressure.latest || {};
      const warn =
        L.below_140 ? "低於 140%（偏緊）" : L.below_150 ? "低於 150%" : "高於 150%";
      const chipCls = L.below_140 ? "chip-bad" : L.below_150 ? "chip-bad" : "chip-ok";
      cards.push(`
      <article class="card">
        <div class="label"><span>${pressure.label}</span><span class="tag ${tagClass(pressure.tag)}">${pressure.tag}</span></div>
        <div class="value">${fmt(L.value, 2)}%</div>
        <div class="sub">${L.date || "—"} · 10日均 ${fmt(L.ma10_pct, 2)}%</div>
        <div class="ma-row"><span class="chip ${chipCls}">${warn}</span></div>
        <div class="note">${pressure.note || ""}${pressure.aka ? `<br/>${pressure.aka}` : ""}</div>
      </article>`);
    }
    if (balance) {
      const L = balance.latest || {};
      const chg = L.chg_yi;
      const chg20 = L.chg_20d_yi;
      const chgTxt =
        chg == null
          ? "—"
          : `${chg > 0 ? "+" : ""}${fmt(chg, 1)} 億（日）`;
      const chg20Txt =
        chg20 == null
          ? ""
          : ` · 近20日 ${chg20 > 0 ? "+" : ""}${fmt(chg20, 1)} 億`;
      const chipCls =
        chg == null ? "chip-na" : chg < 0 ? "chip-ok" : chg > 0 ? "chip-bad" : "chip-na";
      const chipTxt =
        chg == null ? "—" : chg < 0 ? "餘額下降（去槓桿）" : chg > 0 ? "餘額上升（加槓桿）" : "持平";
      cards.push(`
      <article class="card">
        <div class="label"><span>${balance.label}</span><span class="tag ${tagClass(balance.tag)}">${balance.tag}</span></div>
        <div class="value">${fmt(L.value, 0)} <span style="font-size:0.9rem;font-weight:600;color:var(--muted)">億</span></div>
        <div class="sub">${L.date || "—"} · 上市 ${fmt(L.tse_yi, 0)}／上櫃 ${fmt(L.otc_yi, 0)} · ${chgTxt}${chg20Txt}</div>
        <div class="ma-row"><span class="chip ${chipCls}">${chipTxt}</span></div>
        <div class="note">${balance.note || ""}</div>
      </article>`);
    }
    el.innerHTML = cards.length
      ? cards.join("")
      : `<div class="empty">尚無融資資料。執行 scripts/fetch_tw.py</div>`;
  }

  function drawMarginBalChart(range) {
    const chart = ensureChart("chart-margin-bal");
    const hist = state.histories.marginBal;
    if (!chart || !hist) return;
    const r = range || state.marginRange || "3m";
    const data = filterHistory(hist, r);
    chart.setOption(
      {
        animation: false,
        grid: baseGrid(r),
        tooltip: { trigger: "axis" },
        legend: { data: ["合計", "上市", "上櫃"], top: 0, textStyle: { fontSize: 11 } },
        xAxis: {
          type: "category",
          data: data.map((d) => d.date),
          axisLabel: { fontSize: 10 },
        },
        yAxis: {
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
          axisLabel: { formatter: "{value}" },
        },
        series: [
          {
            name: "合計",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.total_yi),
            lineStyle: { width: 2, color: "#15202b" },
            itemStyle: { color: "#15202b" },
            areaStyle: { color: "rgba(21, 32, 43, 0.06)" },
          },
          {
            name: "上市",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.tse_yi),
            lineStyle: { width: 1.2, color: "#0f766e" },
            itemStyle: { color: "#0f766e" },
          },
          {
            name: "上櫃",
            type: "line",
            showSymbol: false,
            data: data.map((d) => d.otc_yi),
            lineStyle: { width: 1.2, color: "#b45309" },
            itemStyle: { color: "#b45309" },
          },
        ],
        ...zoomExtras(r),
      },
      true
    );
  }

  function drawPhillipsChart() {
    const chart = ensureChart("chart-phillips");
    const hist = state.histories.phillips;
    if (!chart || !hist || !hist.length) return;
    const data = hist.slice(-60);
    const n = data.length;
    // [失業, 通膨, 日期, 時間序] —— 正確定義＝失業率 × 通膨（Core PCE）；第 4 維給上色
    const scatter = data.map((d, i) => [d.unrate, d.core_pce_yoy, d.date, i]);
    const past = scatter.slice(0, -1);
    const last = scatter[scatter.length - 1];
    // 時間路徑：依月份順序連線（FRED 散點常見畫法）
    const path = scatter.map((d) => [d[0], d[1]]);
    const xs = data.map((d) => d.unrate).sort((a, b) => a - b);
    const ys = data.map((d) => d.core_pce_yoy).sort((a, b) => a - b);
    const mid = (arr) => arr[Math.floor(arr.length / 2)];
    const xMid = mid(xs);
    const yMid = mid(ys);
    const latestHint = last
      ? `最新（${last[2]}）：失業 ${last[0]}% · 通膨 ${last[1]}%`
      : "";
    chart.setOption(
      {
        animation: false,
        title: {
          text: latestHint,
          left: 8,
          top: 0,
          textStyle: { fontSize: 12, fontWeight: 600, color: "#15202b" },
        },
        grid: { left: 52, right: 20, top: 36, bottom: 56 },
        visualMap: {
          show: true,
          type: "continuous",
          min: 0,
          max: Math.max(n - 1, 1),
          dimension: 3,
          seriesIndex: [1],
          orient: "horizontal",
          left: "center",
          bottom: 2,
          itemWidth: 10,
          itemHeight: 120,
          text: ["較新", "較舊"],
          textStyle: { fontSize: 11, color: "#5b6b7c" },
          inRange: {
            color: ["#cbd5e1", "#94a3b8", "#2dd4bf", "#0f766e"],
          },
          calculable: false,
          hoverLink: false,
        },
        tooltip: {
          trigger: "item",
          formatter: (p) => {
            if (p.seriesName === "時間路徑") return "";
            const v = p.value || [];
            const tag = p.seriesName === "最新" ? "【最新】" : "";
            return `${tag}${v[2] || ""}<br/>失業率 ${v[0]}%<br/>Core PCE 通膨 ${v[1]}%`;
          },
        },
        xAxis: {
          name: "失業率 %（→ 越高＝就業越痛）",
          nameLocation: "middle",
          nameGap: 28,
          nameTextStyle: { fontSize: 11, color: "#5b6b7c" },
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
        },
        yAxis: {
          name: "通膨 Core PCE YoY %（↑ 越熱）",
          nameLocation: "middle",
          nameGap: 40,
          nameTextStyle: { fontSize: 11, color: "#5b6b7c" },
          type: "value",
          scale: true,
          splitLine: { lineStyle: { color: "#e8edf2" } },
        },
        series: [
          {
            name: "時間路徑",
            type: "line",
            data: path,
            showSymbol: false,
            silent: true,
            lineStyle: { color: "rgba(15, 118, 110, 0.28)", width: 1.5 },
            z: 1,
            markLine: {
              silent: true,
              symbol: "none",
              lineStyle: { type: "dashed", color: "#94a3b8", width: 1 },
              data: [{ xAxis: xMid }, { yAxis: yMid }],
              label: { show: false },
            },
          },
          {
            name: "過去月份",
            type: "scatter",
            symbolSize: (val) => {
              const i = val[3] || 0;
              const t = n <= 2 ? 1 : i / (n - 2);
              return 6 + t * 5;
            },
            data: past,
            z: 2,
          },
          {
            name: "最新",
            type: "scatter",
            symbolSize: 18,
            data: last ? [last] : [],
            itemStyle: {
              color: "#0f766e",
              borderColor: "#fff",
              borderWidth: 2,
              shadowBlur: 6,
              shadowColor: "rgba(15, 118, 110, 0.45)",
            },
            label: {
              show: true,
              formatter: "最新",
              position: "top",
              fontSize: 11,
              color: "#0f766e",
              fontWeight: 700,
            },
            z: 10,
          },
        ],
      },
      true
    );
  }

  function redrawAll() {
    drawPriceChart("chart-qqq", "qqq");
    drawPriceChart("chart-voo", "voo");
    drawPriceChart("chart-twii", "twii");
    drawPriceChart("chart-sox", "sox");
    drawRelChart();
    drawVixChart();
    drawMarginChart(state.marginRange || "3m");
    drawMarginBalChart(state.marginRange || "3m");
    drawAllFedCharts();
    drawFmsCharts();
    drawTokenChart();
    drawInventoryChart();
  }

  let controlsWired = false;

  function wireControls() {
    if (controlsWired) return;
    controlsWired = true;
    const rangeEl = document.getElementById("global-range");
    if (rangeEl) {
      rangeEl.addEventListener("click", (ev) => {
        const btn = ev.target.closest("button[data-range]");
        if (!btn) return;
        rangeEl.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        state.range = btn.dataset.range;
        redrawAll();
      });
    }
    const toggles = document.getElementById("ma-toggles");
    if (toggles) {
      toggles.addEventListener("change", (ev) => {
        const input = ev.target;
        if (!input.matches("input[data-ma]")) return;
        state.show[input.dataset.ma] = input.checked;
        redrawAll();
      });
    }
    const marginRanges = document.querySelectorAll("[data-margin-range]");
    if (marginRanges.length) {
      state.marginRange = "3m";
      const syncMarginRangeUi = (range) => {
        marginRanges.forEach((group) => {
          group.querySelectorAll("button").forEach((b) => {
            b.classList.toggle("active", b.dataset.range === range);
          });
        });
      };
      marginRanges.forEach((group) => {
        group.addEventListener("click", (ev) => {
          const btn = ev.target.closest("button[data-range]");
          if (!btn) return;
          state.marginRange = btn.dataset.range;
          syncMarginRangeUi(state.marginRange);
          drawMarginChart(state.marginRange);
          drawMarginBalChart(state.marginRange);
        });
      });
    }
    const fedIntent = document.getElementById("fed-intent");
    if (fedIntent) {
      fedIntent.addEventListener("click", (ev) => {
        const btn = ev.target.closest("[data-fed-range] button[data-range]");
        if (!btn) return;
        const group = btn.closest("[data-fed-range]");
        const id = group && group.getAttribute("data-fed-range");
        if (!id) return;
        state.fedRanges[id] = btn.dataset.range;
        syncFedRangeUi(id, state.fedRanges[id]);
        drawFedLineChart(id);
        requestAnimationFrame(() => {
          const c = state.charts[`chart-fed-${id}`];
          if (c) c.resize();
        });
      });
    }
    window.addEventListener("resize", () => {
      Object.values(state.charts).forEach((c) => c && c.resize());
    });
  }

  async function loadJson(path) {
    const r = await fetch(path + (path.includes("?") ? "&" : "?") + "t=" + Date.now(), {
      cache: "no-store",
    });
    if (!r.ok) throw new Error(path + " " + r.status);
    return r.json();
  }

  function disposeCharts() {
    Object.keys(state.charts).forEach((id) => {
      try {
        state.charts[id].dispose();
      } catch (e) {
        /* ignore */
      }
      delete state.charts[id];
    });
  }

  async function main() {
    const meta = document.getElementById("meta-bar");
    let macro = null;
    let tw = null;
    let fms = null;
    let fedwatch = null;
    let token = null;
    let inventory = null;
    let manual = null;
    const errs = [];

    try {
      macro = await loadJson("data/macro.json");
    } catch (e) {
      errs.push("macro.json 尚未產生（先跑 scripts/fetch_macro.py）");
    }
    try {
      tw = await loadJson("data/tw.json");
    } catch (e) {
      errs.push("tw.json 尚未產生（先跑 scripts/fetch_tw.py）");
    }
    try {
      fms = await loadJson("data/fms.json");
    } catch (e) {
      errs.push("fms.json 讀取失敗");
    }
    try {
      fedwatch = await loadJson("data/fedwatch.json");
    } catch (e) {
      /* 可選 */
    }
    try {
      token = await loadJson("data/token.json");
    } catch (e) {
      /* 可選 */
    }
    try {
      inventory = await loadJson("data/inventory_cycle.json");
    } catch (e) {
      /* 可選 */
    }
    try {
      manual = await loadJson("data/manual.json");
    } catch (e) {
      errs.push("manual.json 未填或讀取失敗 → Fed 意圖需手動編輯");
    }

    const series = (macro && macro.series) || {};
    const age = macro ? daysSince(macro.updated_at) : null;
    const mm =
      (tw && tw.series && (tw.series.margin_pressure || tw.series.margin_maintenance)) ||
      null;
    const mb = (tw && tw.series && tw.series.margin_balance) || null;
    meta.innerHTML = [
      macro
        ? `macro 更新：${macro.updated_at}${age != null ? `（${age} 天前）` : ""}`
        : "macro：無",
      mm && mm.latest
        ? `維持率：${fmt(mm.latest.value, 1)}%（${mm.latest.date}）`
        : "維持率：無",
      mb && mb.latest
        ? `融資餘額：${fmt(mb.latest.value, 0)}億`
        : "",
      fms && fms.latest ? `FMS：${fms.latest.publish_date || "—"}` : "FMS：無",
      fedwatch && fedwatch.next
        ? `FedWatch自算：${fedwatch.next.meeting_date || "—"}`
        : "FedWatch自算：無",
      token && token.latest
        ? `Token：${token.latest.trend || "—"}（${token.as_of || token.latest.date || "—"}）`
        : "Token：無",
      inventory && inventory.latest
        ? `庫存差值：${inventory.latest.spread}（${inventory.latest.date || "—"}）`
        : "庫存循環：無",
      errs.length ? `⚠ ${errs.join("；")}` : "",
      macro && macro.errors && macro.errors.length
        ? `⚠ 抓數部分失敗：${macro.errors.join("；")} → 檢查 FRED key 或網路`
        : "",
    ]
      .filter(Boolean)
      .join(" · ");

    renderStatusTable(document.getElementById("status-table"), series);
    renderRulesBox(document.getElementById("rules-box"), series);

    const maEl = document.getElementById("ma-grid");
    const maItems = MA_IDS.map((id) => series[id]).filter(Boolean);
    maEl.innerHTML = maItems.length
      ? maItems.map(maCardHtml).join("")
      : `<div class="empty">尚無均線資料。執行 fetch_macro.py（yfinance 不需 key）。</div>`;

    const vixEl = document.getElementById("vix-grid");
    if (series.vix) vixEl.innerHTML = cardHtml({ ...series.vix, tag: "試行" });
    else vixEl.innerHTML = `<div class="empty">尚無 VIX</div>`;

    renderMarginDaySummary(document.getElementById("margin-day-summary"), mm, mb);
    renderMargin(document.getElementById("margin-grid"), mm, mb);
    renderFms(document.getElementById("fms-box"), fms);
    renderFedWatch(document.getElementById("fedwatch-box"), fedwatch);
    renderToken(document.getElementById("token-box"), token);
    renderInventory(document.getElementById("inventory-box"), inventory);

    const evidenceEl = document.getElementById("fed-evidence-list");
    if (evidenceEl) {
      renderFedEvidence(evidenceEl, series);
    }

    if (series.qqq) state.histories.qqq = series.qqq.history || [];
    if (series.voo) state.histories.voo = series.voo.history || [];
    if (series.twii) state.histories.twii = series.twii.history || [];
    if (series.sox) state.histories.sox = series.sox.history || [];
    if (series.vix) state.histories.vix = series.vix.history || [];
    if (series.sox_vs_qqq) state.histories.rel = series.sox_vs_qqq.history || [];
    if (series.phillips) state.histories.phillips = series.phillips.history || [];
    FED_EVIDENCE_IDS.forEach((id) => {
      if (id === "phillips") return;
      if (series[id]) state.histories[id] = series[id].history || [];
    });
    if (mm) state.histories.margin = mm.history || [];
    if (mb) state.histories.marginBal = mb.history || [];
    if (fms) state.histories.fms = fms.history || [];
    if (token) state.histories.token = token.history || [];
    if (inventory) state.histories.inventory = inventory.history || [];

    wireControls();
    redrawAll();
  }

  main();
  // 每 5 分鐘重抓 JSON（資料仍靠排程更新；這裡只刷新畫面）
  setInterval(() => {
    disposeCharts();
    main();
  }, 5 * 60 * 1000);
})();
