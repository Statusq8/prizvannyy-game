  // ==== src/core/02_numbers.js — Числа: биомы и залы по этажу, большие числа (B), формулы HP и золота ====
  // ---------- биомы ----------
  const ROMAN = ['', '', ' II', ' III', ' IV', ' V', ' VI', ' VII', ' VIII', ' IX', ' X'];
  function biomeIndex(floor) { return Math.floor((floor - 1) / CONFIG.biomeFloors); }
  function biomeOf(floor) { const B = CONFIG.biomes; return B[biomeIndex(floor) % B.length]; }
  function biomeCycle(floor) { return Math.floor(biomeIndex(floor) / CONFIG.biomes.length) + 1; }
  function biomeName(floor) { const n = biomeCycle(floor); return biomeOf(floor).name + (ROMAN[n] !== undefined ? ROMAN[n] : ' ' + n); }
  function hallOf(floor) { const H = CONFIG.halls; return H[Math.floor(((floor - 1) % CONFIG.biomeFloors) / CONFIG.hallFloors) % H.length]; }
  function isFinalBoss(floor) { return floor % CONFIG.biomeFloors === 0; }
  function isBiomeStart(floor) { return (floor - 1) % CONFIG.biomeFloors === 0; }


  // ---------- большие числа ----------
  // Значение — обычное число, пока |x| < 1e300; дальше — Big { m, e } = m·10^e (1 ≤ |m| < 10).
  // Все суммы золота, HP, урона, цен и душ идут через B.* — так Башня проходима без предела.
  function Big(m, e) { this.m = m; this.e = e; }
  Big.prototype.valueOf = function () { return B.toNum(this); };   // запасной путь для старого кода: огромное → Infinity
  Big.prototype.toString = function () { return B.str(this); };
  const LIM = 1e300, LOGLIM = 290;
  const B = {
    isBig: x => x instanceof Big,
    norm(m, e) {
      if (m === 0 || !isFinite(m)) return m === 0 ? 0 : m;
      const k = Math.floor(Math.log10(Math.abs(m)));
      m /= Math.pow(10, k); e += k;
      if (Math.abs(m) >= 10) { m /= 10; e++; }
      if (Math.abs(m) < 1) { m *= 10; e--; }
      if (e < 300) return m * Math.pow(10, e);
      return new Big(m, e);
    },
    // 10^l: число, если влезает, иначе Big
    fromLog10(l) { if (l < LOGLIM) return Math.pow(10, l); const e = Math.floor(l); return new Big(Math.pow(10, l - e), e); },
    toBig(x) {
      if (x instanceof Big) return x;
      if (x === 0) return new Big(0, 0);
      const e = Math.floor(Math.log10(Math.abs(x))); let m = x / Math.pow(10, e);
      if (Math.abs(m) >= 10) return new Big(m / 10, e + 1);
      return new Big(m, e);
    },
    toNum(x) { return x instanceof Big ? (x.e > 308 ? (x.m < 0 ? -Infinity : Infinity) : x.m * Math.pow(10, x.e)) : x; },
    log10(x) { return x instanceof Big ? x.e + Math.log10(Math.abs(x.m)) : Math.log10(Math.abs(x)); },
    sign(x) { const v = x instanceof Big ? x.m : x; return v > 0 ? 1 : v < 0 ? -1 : 0; },
    add(a, b) {
      if (!(a instanceof Big) && !(b instanceof Big)) { const r = a + b; if (Math.abs(r) < LIM) return r; }
      const A = B.toBig(a), C2 = B.toBig(b);
      if (A.m === 0) return b; if (C2.m === 0) return a;
      const [x, y] = A.e >= C2.e ? [A, C2] : [C2, A], d = x.e - y.e;
      if (d > 17) return x.e < 300 ? x.m * Math.pow(10, x.e) : x;
      return B.norm(x.m + y.m * Math.pow(10, -d), x.e);
    },
    sub(a, b) { return B.add(a, B.neg(b)); },
    neg(x) { return x instanceof Big ? new Big(-x.m, x.e) : -x; },
    mul(a, b) {
      if (!(a instanceof Big) && !(b instanceof Big)) { const r = a * b; if (Math.abs(r) < LIM) return r; }
      const A = B.toBig(a), C2 = B.toBig(b);
      if (A.m === 0 || C2.m === 0) return 0;
      return B.norm(A.m * C2.m, A.e + C2.e);
    },
    div(a, b) {
      if (!(a instanceof Big) && !(b instanceof Big)) return a / b;
      const A = B.toBig(a), C2 = B.toBig(b);
      if (A.m === 0) return 0;
      return B.norm(A.m / C2.m, A.e - C2.e);
    },
    cmp(a, b) {
      if (!(a instanceof Big) && !(b instanceof Big)) return a < b ? -1 : a > b ? 1 : 0;
      const sa = B.sign(a), sb = B.sign(b);
      if (sa !== sb) return sa < sb ? -1 : 1;
      if (sa === 0) return 0;
      const la = B.log10(a), lb = B.log10(b);
      return la === lb ? 0 : (la < lb ? -sa : sa);
    },
    lt: (a, b) => B.cmp(a, b) < 0, lte: (a, b) => B.cmp(a, b) <= 0,
    gt: (a, b) => B.cmp(a, b) > 0, gte: (a, b) => B.cmp(a, b) >= 0,
    max: (a, b) => (B.cmp(a, b) >= 0 ? a : b), min: (a, b) => (B.cmp(a, b) <= 0 ? a : b),
    ceil: x => (x instanceof Big ? x : Math.ceil(x)),
    floor: x => (x instanceof Big ? x : Math.floor(x)),
    // сохранение: число как есть, Big — строкой «1.2345e678»
    str: x => (x instanceof Big ? x.m.toPrecision(15) + 'e' + x.e : x),
    parse(v) {
      if (typeof v === 'number') return isFinite(v) ? v : null;
      if (typeof v !== 'string') return null;
      const r = /^(-?\d+(?:\.\d+)?)e(\d+)$/.exec(v);
      if (!r) return null;
      return B.norm(Number(r[1]), Number(r[2]));
    },
  };

  // Счётчики действий для заданий
  function cnt(s, key, n) { s.counters[key] = (s.counters[key] || 0) + (n === undefined ? 1 : n); }

  // ---------- формулы ----------
  // «Эффективный номер этажа» для роста HP и золота: линейно до knee, выше — knee·slope·ln(f/knee)
  function floorSteps(floor) {
    const K = CONFIG.floorCurve.knee;
    const F = CONFIG.floorCurve;
    if (floor <= K) return floor - 1;
    return F.late != null ? (K - 1) + (floor - K) * F.late : (K - 1) + K * F.slope * Math.log(floor / K);
  }
  function enemyMaxHp(floor, isBoss) {
    const bm = isBoss ? CONFIG.bossHpMult * (isFinalBoss(floor) ? CONFIG.finalBossHpMult : 1) : 1;
    const l = Math.log10(CONFIG.enemyBaseHp * biomeOf(floor).hp * bm) + floorSteps(floor) * Math.log10(CONFIG.enemyHpGrowth);
    if (l >= LOGLIM) return B.fromLog10(l);
    const hp = CONFIG.enemyBaseHp * Math.pow(CONFIG.enemyHpGrowth, floorSteps(floor)) * biomeOf(floor).hp;
    return Math.ceil(isBoss ? hp * bm : hp);
  }
