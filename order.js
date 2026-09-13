/* ==========================================================
   nouch  —  order flow
   ========================================================== */
(function () {
  'use strict';

  var dl = (window.dataLayer = window.dataLayer || []);

  var form    = document.getElementById('orderForm');
  var nextBtn = document.getElementById('nextBtn');
  var btnNote = document.getElementById('btnNote');
  var stepNum = document.getElementById('stepNum');
  var bars    = document.querySelectorAll('.obar__i');
  var doneBox = document.getElementById('done');

  var COLOR = { mist: 'ミスト', sand: 'サンド', clay: 'クレイ' };

  /* ----------------------------------------------------
     フィットの型
     ---------------------------------------------------- */
  var FIT = {
    1: {
      name: 'Fit 01 / Narrow',
      short: 'Fit 01',
      desc: '鼻あてが狭く、シールが深く当たる形',
      svg: '<svg class="result__svg" viewBox="0 0 327 112" aria-hidden="true">' +
           '<rect x="129.5" y="61" width="68" height="10" rx="5"/>' +
           '<path d="M 100 66 h -46" stroke-width="10" stroke-linecap="round"/>' +
           '<path d="M 227 66 h 46" stroke-width="10" stroke-linecap="round"/>' +
           '<ellipse cx="129.5" cy="66" rx="27" ry="22"/><ellipse cx="197.5" cy="66" rx="27" ry="22"/>' +
           '<ellipse class="lens" cx="129.5" cy="66" rx="18" ry="13"/><ellipse class="lens" cx="197.5" cy="66" rx="18" ry="13"/></svg>'
    },
    2: {
      name: 'Fit 02 / Standard',
      short: 'Fit 02',
      desc: '中間の形。多くの子はここから',
      svg: '<svg class="result__svg" viewBox="0 0 327 112" aria-hidden="true">' +
           '<rect x="122.5" y="61" width="82" height="10" rx="5"/>' +
           '<path d="M 91 66 h -46" stroke-width="10" stroke-linecap="round"/>' +
           '<path d="M 236 66 h 46" stroke-width="10" stroke-linecap="round"/>' +
           '<ellipse cx="122.5" cy="66" rx="29" ry="22"/><ellipse cx="204.5" cy="66" rx="29" ry="22"/>' +
           '<ellipse class="lens" cx="122.5" cy="66" rx="22" ry="15"/><ellipse class="lens" cx="204.5" cy="66" rx="22" ry="15"/></svg>'
    },
    3: {
      name: 'Fit 03 / Wide',
      short: 'Fit 03',
      desc: '鼻あてが広く、シールが浅く広く当たる形',
      svg: '<svg class="result__svg" viewBox="0 0 327 112" aria-hidden="true">' +
           '<rect x="115.5" y="61" width="96" height="10" rx="5"/>' +
           '<path d="M 82 66 h -46" stroke-width="10" stroke-linecap="round"/>' +
           '<path d="M 245 66 h 46" stroke-width="10" stroke-linecap="round"/>' +
           '<ellipse cx="115.5" cy="66" rx="31" ry="21"/><ellipse cx="211.5" cy="66" rx="31" ry="21"/>' +
           '<ellipse class="lens" cx="115.5" cy="66" rx="26" ry="16"/><ellipse class="lens" cx="211.5" cy="66" rx="26" ry="16"/></svg>'
    }
  };

  var AGE  = { a: { base: 1, t: '5〜6歳' }, b: { base: 2, t: '7〜8歳' },
               c: { base: 2, t: '9〜10歳' }, d: { base: 3, t: '11〜12歳' } };

  var MARK = {
    nose:  { shift:  1, t: '鼻のわきに跡が残っていた（鼻あてが狭く、内側に引っぱられていた）' },
    ring:  { shift:  1, t: '目のまわりに一周、跡が残っていた（シールが深く食い込んでいた）' },
    cheek: { shift: -1, t: '目の下・ほお側だけに跡が残っていた（下にずれて当たっていた）' },
    none:  { shift:  0, t: '跡は出ていない、または分からない' }
  };

  /* ----------------------------------------------------
     状態
     ---------------------------------------------------- */
  var state = { age: null, mark: null, freq: null, fit: 2, color: 'mist', growth: false };
  var step = 1;

  function val(n) {
    var el = form.querySelector('input[name="' + n + '"]:checked');
    return el ? el.value : null;
  }

  function decideFit() {
    var f = AGE[state.age].base + MARK[state.mark].shift;
    return Math.min(3, Math.max(1, f));
  }

  function whyText() {
    var a = AGE[state.age], m = MARK[state.mark], f = FIT[state.fit];
    var s = '<strong>' + a.t + '</strong>、そして<strong>' + m.t + '</strong>。';
    if (m.shift > 0) {
      s += 'この年齢の標準よりも、当たる面を広げたほうが跡が出にくくなります。だから ' +
           f.short + '（' + f.desc + '）から始めます。';
    } else if (m.shift < 0) {
      s += 'ゴーグルが下がっていたので、もう少し深く当たる形で止めたほうが安定します。だから ' +
           f.short + '（' + f.desc + '）から始めます。';
    } else {
      s += '前の跡の情報がないので、この年齢でいちばん当たる可能性が高い ' +
           f.short + '（' + f.desc + '）から始めます。';
    }
    return s;
  }

  /* ----------------------------------------------------
     画面の切り替え
     ---------------------------------------------------- */
  var LABEL = ['', '提案を見る', 'この提案で進む', 'この色で進む', '申し込む'];

  function paint() {
    for (var i = 1; i <= 4; i++) {
      document.getElementById('step' + i).hidden = (i !== step);
    }
    bars.forEach(function (b) {
      b.classList.toggle('is-done', Number(b.dataset.step) <= step);
    });
    stepNum.textContent = step + ' / 4';
    nextBtn.textContent = LABEL[step];
    check();
  }

  function check() {
    var ok = true, note = '';
    if (step === 1) {
      state.age = val('age'); state.mark = val('mark'); state.freq = val('freq');
      ok = !!(state.age && state.mark && state.freq);
      note = ok ? '答えをもとに、こちらでフィットを選びます。'
                : '3問すべてに答えると次に進めます。';
      if (!ok) nextBtn.textContent = '質問に答えてください';
      else nextBtn.textContent = LABEL[1];
    } else if (step === 2) {
      note = '選び直す必要はありません。合わなければ交換します。';
    } else if (step === 3) {
      note = '色はフィットに影響しません。';
    } else {
      var nm = document.getElementById('nm').value.trim();
      var em = document.getElementById('em').value.trim();
      ok = nm.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
      note = ok ? '※ 学習課題のため、実際には送信されません。'
                : 'お名前とメールアドレスを入力してください。';
    }
    nextBtn.disabled = !ok;
    btnNote.textContent = note;
  }

  function go(n) {
    step = n;
    paint();
    var top = document.querySelector('.obar').getBoundingClientRect().top + window.pageYOffset - 70;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }

  /* ----------------------------------------------------
     STEP 2 を組み立てる
     ---------------------------------------------------- */
  function buildResult() {
    state.fit = decideFit();
    var f = FIT[state.fit];
    document.getElementById('fitName').textContent = f.name;
    document.getElementById('fitSvg').innerHTML = f.svg;
    document.getElementById('fitWhy').innerHTML = whyText();
    dl.push({ event: 'fit_suggested', fit: f.short, age: state.age, mark: state.mark });
  }

  /* ----------------------------------------------------
     STEP 4 を組み立てる
     ---------------------------------------------------- */
  function buildBill() {
    document.getElementById('billFit').textContent =
      'nouch ゴーグル ／ ' + FIT[state.fit].short + ' ／ ' + COLOR[state.color];

    var lead = document.getElementById('growthLead');
    if (state.freq === 'high') {
      lead.textContent = '週に3回以上泳ぐなら、顔の変化にゴーグルが合わなくなるのも早くなります。育って合わなくなったときに選び直せるようにしておくこともできます。';
    } else if (state.freq === 'mid') {
      lead.textContent = '子どもの顔は1年で変わります。育って合わなくなったときに、選び直せるようにしておくこともできます。';
    } else {
      lead.textContent = '月に数回なら、まずは本体だけでも十分です。必要になったらあとから追加できます。';
    }

    var on = document.getElementById('growth').checked;
    state.growth = on;
    document.getElementById('billGrowth').hidden = !on;
    document.getElementById('billSum').textContent = '$' + (on ? 67 : 38);
  }

  /* ----------------------------------------------------
     イベント
     ---------------------------------------------------- */
  form.addEventListener('change', function (e) {
    if (e.target.id === 'growth') { buildBill(); dl.push({ event: 'growth_toggle', on: e.target.checked }); }
    check();
  });
  form.addEventListener('input', check);

  document.querySelectorAll('.swatch').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var c = btn.dataset.color;
      if (btn.classList.contains('is-on')) return;
      document.querySelectorAll('.swatch').forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      state.color = c;
      var img = document.getElementById('pickImg');
      img.classList.add('is-swap');
      var next = new Image();
      next.onload = function () {
        img.src = next.src;
        img.alt = 'nouch ゴーグル ' + COLOR[c];
        img.classList.remove('is-swap');
      };
      next.src = 'product-' + c + '.png';
      dl.push({ event: 'select_color', color: c });
    });
  });

  nextBtn.addEventListener('click', function () {
    if (nextBtn.disabled) return;
    if (step === 1) { buildResult(); go(2); }
    else if (step === 2) { go(3); }
    else if (step === 3) { buildBill(); go(4); }
    else {
      var nm = document.getElementById('nm').value.trim();
      dl.push({
        event: 'order_submit',
        fit: FIT[state.fit].short,
        color: state.color,
        growth: state.growth,
        value: state.growth ? 67 : 38
      });
      form.hidden = true;
      document.getElementById('doneP').innerHTML =
        (nm ? nm + ' さま、' : '') + 'まずは <strong>' + FIT[state.fit].short + ' ／ ' +
        COLOR[state.color] + '</strong> をお送りします。' +
        (state.growth ? '<br>Growth Plan も一緒に開始します。' : '') +
        '<br>使ってみて合わなければ、90日以内に最大2回まで無料で交換します。返送は不要です。';
      doneBox.hidden = false;
      window.scrollTo({ top: doneBox.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
    }
  });

  dl.push({ event: 'order_start' });
  paint();
})();
