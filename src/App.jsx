import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, ChevronDown, Loader2, Info, AlertCircle, BarChart2, List, Download, Share2, Check, X, Copy, Lock, Unlock, Key, Database, GitCompare, ExternalLink } from 'lucide-react';

// --- DATASET CONFIGURATION ---
const DATASET_CONFIG = {
  "ces.rst.crdt": {uri: "ces.rst.crdt.json", hasSignals: false},
  "deu.pdtb.pcc": {uri: "deu.pdtb.pcc.json", hasSignals: true},
  "deu.rst.pcc": {uri: "deu.rst.pcc.json", hasSignals: false},
  "eng.dep.covdtb": {uri: "eng.dep.covdtb.json", hasSignals: false},
  "eng.dep.scidtb": {uri: "eng.dep.scidtb.json", hasSignals: false},
  "eng.erst.gentle": {uri: "eng.erst.gentle.json", hasSignals: true},
  "eng.erst.gum": {uri: "eng.erst.gum.json", hasSignals: true, default: true},
  "eng.pdtb.gentle": {uri: "eng.pdtb.gentle.json", hasSignals: true},
  "eng.pdtb.gum": {uri: "eng.pdtb.gum.json", hasSignals: true},
  "eng.pdtb.pdtb": {uri: "https://gucorpling.org/discoexplorer/discoauth.py?dataset=eng.pdtb.pdtb.json", hasSignals: true, restricted: true},
  "eng.pdtb.tedm": {uri: "eng.pdtb.tedm.json", hasSignals: true},
  "eng.rst.oll": {uri: "eng.rst.oll.json", hasSignals: false},
  "eng.rst.rstdt": {uri: "https://gucorpling.org/discoexplorer/discoauth.py?dataset=eng.rst.rstdt.json", hasSignals: false, restricted: true},
  "eng.rst.sts": {uri: "eng.rst.sts.json", hasSignals: false},
  "eng.rst.umuc": {uri: "eng.rst.umuc.json", hasSignals: false},
  "eng.sdrt.msdc": {uri: "eng.sdrt.msdc.json", hasSignals: false},
  "eng.sdrt.stac": {uri: "eng.sdrt.stac.json", hasSignals: false},
  "eus.rst.ert": {uri: "eus.rst.ert.json", hasSignals: false},
  "fas.rst.prstc": {uri: "fas.rst.prstc.json", hasSignals: false},
  "fra.sdrt.annodis": {uri: "fra.sdrt.annodis.json", hasSignals: false},
  "ita.pdtb.luna": {uri: "ita.pdtb.luna.json", hasSignals: true},
  "nld.rst.nldt": {uri: "nld.rst.nldt.json", hasSignals: false},
  "pcm.pdtb.disconaija": {uri: "pcm.pdtb.disconaija.json", hasSignals: true},
  "pol.iso.pdc": {uri: "pol.iso.pdc.json", hasSignals: true},
  "por.pdtb.crpc": {uri: "por.pdtb.crpc.json", hasSignals: true},
  "por.pdtb.tedm": {uri: "por.pdtb.tedm.json", hasSignals: true},
  "por.rst.cstn": {uri: "por.rst.cstn.json", hasSignals: false},
  "rus.rst.rrt": {uri: "rus.rst.rrt.json", hasSignals: false},
  "spa.rst.rststb": {uri: "spa.rst.rststb.json", hasSignals: false},
  "spa.rst.sctb": {uri: "spa.rst.sctb.json", hasSignals: false},
  "tha.pdtb.tdtb": {uri: "tha.pdtb.tdtb.json", hasSignals: false},
  "tur.pdtb.tdb": {uri: "https://gucorpling.org/discoexplorer/discoauth.py?dataset=tur.pdtb.tdb.json", hasSignals: false, restricted: true},
  "tur.pdtb.tedm": {uri: "tur.pdtb.tedm.json", hasSignals: true},
  "zho.dep.scidtb": {uri: "zho.dep.scidtb.json", hasSignals: false},
  "zho.pdtb.cdtb": {uri: "https://gucorpling.org/discoexplorer/discoauth.py?dataset=zho.pdtb.cdtb.json", hasSignals: false, restricted: true},
  "zho.pdtb.ted": {uri: "zho.pdtb.ted.json", hasSignals: true},
  "zho.rst.gcdt": {uri: "zho.rst.gcdt.json", hasSignals: false},
  "zho.rst.sctb": {uri: "zho.rst.sctb.json", hasSignals: false},
};

const LANG_FLAGS = {
  ces: "🇨🇿", deu: "🇩🇪", eng: "🇺🇸", eus: "🇪🇸", fas: "🇮🇷", fra: "🇫🇷", ita: "🇮🇹", nld: "🇳🇱", 
  pcm: "🇳🇬", pol: "🇵🇱", por: "🇵🇹", rus: "🇷🇺", spa: "🇪🇸", tha: "🇹🇭", tur: "🇹🇷", zho: "🇨🇳", bra: "🇧🇷"
};

const SIGNAL_COLORS = {
  dm: "#F54927", syn: "#7CE3f8", sem: "#7DF527", grf: "#F5FA87", 
  lex: "#FAD087", num: "#FA87EB", mrf: "#633102", ref: "#807E7D"
};

const POS_VOCAB = new Set(['ADJ','ADP','ADV','AUX','CCONJ','CONJ','DET','NOUN','NUM','PART','PRON','PROPN','PUNCT','SCONJ','SYM','VERB','X']);
const DEPREL_VOCAB = new Set(['acl','acl:relcl','advcl','advcl:relcl','advmod','amod','appos','aux','aux:pass','case','cc','cc:preconj','ccomp','compound','compound:prt','conj','cop','csubj','csubj:outer','csubj:pass','dep','det','det:predet','discourse','dislocated','expl','fixed','flat','goeswith','iobj','list','mark','nmod','nmod:desc','nmod:poss','nmod:unmarked','nsubj','nsubj:outer','nsubj:pass','nummod','obj','obl','obl:agent','obl:unmarked','orphan','parataxis','punct','reparandum','root','vocative','xcomp']);

const SIGNAL_DISPLAY_NAMES = {"altlex": "alternate_expression","indwd": "indicative_word","indph": "indicative_phrase","atsrc": "attribution_source","lxchn": "lexical_chain","mrnym": "meronymy","sbinv": "subject_auxiliary_inversion","synym": "synonymy","antnm": "antonymy","inf": "infinitival_clause","relcl": "relative_clause","prop": "propositional_reference","pres": "present_participial_clause","semcol": "semicolon","count": "same_count","col": "colon","seq": "items_in_sequence","dem": "demonstrative_reference","gnrl": "general_word","intrp": "interrupted_matrix_clause","causx": "causal_excess","sem": "semantic","syn": "syntactic","grf": "graphical","mrf": "morphological","imp": "implicit","num": "numerical","ref": "reference","lex": "lexical","dm": "dm","orp": "orphan","nsr": "unsure","ly": "layout","prn": "parentheses","mdf": "modified_head","nmn": "nominal_modifier","rpr": "reported_speech","rpt": "repetition","prs": "personal_reference","cmp": "comparative_reference","pst_": "past_participial_clause","prl": "parallel_syntactic_construction","qt": "quotation_marks","dsh": "dash","qst": "question_mark","md": "mood","ngt": "negation","tns": "tense"};

const getSignalDisplayName = (val) => SIGNAL_DISPLAY_NAMES[val] || val;
const getDisrptLabel = (label) => Array.isArray(label) ? label[0] : (label || 'Unknown');
const getOrigLabel = (label) => Array.isArray(label) && label.length > 1 ? label[1] : 'Unknown';

// --- LOGGING ---
const debug = false;
const ENABLE_QUERY_TIMING = false;

// --- MOCK DATA ---
const MOCK_DATA_EN = {
  docs: {
    "GUM_essay_tools": [
      ["I","am","just","questioning","the","techno","-","romantics","technology","by","its","very","nature","is","enlarging","and","fulfilling",".","who","think"],
      ["I","be","just","question","the","techno","-","romantic","technology","by","its","very","nature","be","enlarging","and","fulfilling",".","who","think"],
      ["PRON","AUX","ADV","VERB","DET","NOUN","PUNCT","NOUN","NOUN","ADP","PRON","ADJ","NOUN","AUX","ADJ","CCONJ","ADJ","PUNCT","PRON","VERB"],
      ["nsubj","aux","advmod","root","det","compound","punct","obj","nsubj","case","nmod:poss","amod","obl","aux","ccomp","cc","conj","punct","nsubj","acl:relcl"],
      [1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,0,1,1,1]
    ]
  },
  meta: { "GUM_essay_tools": { "genre": "essay", "author": "student" } },
  relations: [
    { id: "1", docname: "GUM_essay_tools", preContext: [0, 0], arg1: [0, 18], interContext: [18, 18], arg2: [18, 20], postContext: [20, 20], label: ["attribution", "attribution-positive"], direction: "1>2", signals: [["sem", "attribution_source", "18"]] },
    { id: "4", docname: "GUM_essay_tools", preContext: [0, 0], arg1: [0, 10], interContext: [10, 12], arg2: [12, 20], postContext: [20, 20], label: ["explanation", "explanation-justify"], direction: "1<2", signals: [["dm", "concession", "10-11"], ["sem", "attribution_source", "13"]] }
  ]
};

const MOCK_DATA_FR = {
  docs: {
    "lemonde_01": [
      ["Hier",",","je","suis","allé","au","marché","et","bien","que","je","sois","fatigué","j'","ai","acheté","des","pommes","."],
      ["hier",",","il","être","aller","au","marché","et","bien","que","il","être","fatiguer","il","avoir","acheter","un","pomme","."],
      ["ADV","PUNCT","PRON","AUX","VERB","ADP","NOUN","CCONJ","ADV","SCONJ","PRON","AUX","ADJ","PRON","AUX","VERB","DET","NOUN","PUNCT"],
      ["advmod","punct","nsubj","aux","root","case","obl","cc","advmod","mark","nsubj","cop","advcl","nsubj","aux","conj","det","obj","punct"],
      [0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1]
    ],
    "lemonde_02": [
      ["C'","était","dangereux",",","les","rues","étaient","mouillées","surtout","parce","qu'","il","a","plu","abondamment","la","nuit","dernière","."],
      ["ce","être","dangereux",",","le","rue","être","mouillé","surtout","parce","que","il","avoir","pleuvoir","abondamment","le","nuit","dernier","."],
      ["PRON","AUX","ADJ","PUNCT","DET","NOUN","AUX","ADJ","ADV","ADV","SCONJ","PRON","AUX","VERB","ADV","DET","NOUN","ADJ","PUNCT"],
      ["nsubj","cop","root","punct","det","nsubj","cop","conj","advmod","advmod","mark","nsubj","aux","advcl","advmod","det","obl","amod","punct"],
      [0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1]
    ]
  },
  meta: {
    "lemonde_01": { "genre": "news" },
    "lemonde_02": { "genre": "news" }
  },
  relations: [
    { id: "101", docname: "lemonde_01", preContext: [0, 2], arg1: [2, 7], interContext: [7, 8], arg2: [8, 13], postContext: [13, 19], label: ["concession", "Contrast"], direction: "1<2", signals: [["dm", "concession", "8-9"]] },
    { id: "102", docname: "lemonde_02", preContext: [0, 4], arg1: [4, 8], interContext: [8, 9], arg2: [9, 18], postContext: [18, 19], label: ["cause", "Explanation"], direction: "1>2", signals: [["dm", "cause", "9-10"]] }  ]
};

// --- HELPER METHODS ---
const parseQuery = (queryString) => {
  if (!queryString.trim()) return [];
  return queryString.trim().split(/\s+/).map(tokenStr => {
    const parts = tokenStr.split('|');
    const criteria = {};
    if (parts[0] !== '') criteria.w = parts[0]; 
    for (let i = 1; i < parts.length; i++) {
      const val = parts[i];
      if (!val) continue; 
      if (POS_VOCAB.has(val.toUpperCase())) criteria.p = val.toUpperCase();
      else if (DEPREL_VOCAB.has(val.toLowerCase())) criteria.d = val.toLowerCase();
      else criteria.l = val.toLowerCase();
    }
    return criteria;
  });
};

const parseSignalTokens = (tokenStr) => {
  const indices = new Set();
  if (!tokenStr) return indices;
  const parts = tokenStr.split(',');
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) indices.add(i);
      }
    } else {
      const val = parseInt(part, 10);
      if (!isNaN(val)) indices.add(val);
    }
  }
  return indices;
};

const buildSignalMap = (signals) => {
  const map = new Map();
  if (!signals) return map;
  signals.forEach(s => {
      const type = s[0], subtype = s[1], indices = parseSignalTokens(s[2]);
      const size = indices.size;
      if (size > 0) {
          indices.forEach(idx => {
              const existing = map.get(idx);
              if (!existing) {
                  map.set(idx, { type, subtype, size, allSignals: [{type, subtype}] });
              } else {
                  if (!existing.allSignals.some(sig => sig.type === type && sig.subtype === subtype)) {
                      existing.allSignals.push({type, subtype});
                  }
                  if (size < existing.size) {
                      existing.type = type; existing.subtype = subtype; existing.size = size;
                  }
              }
          });
      }
  });
  return map;
};

const getMatchIndices = (tokens, parsedQuery, caseInsensitive) => {
  const matched = new Set();
  const matchedPositions = parsedQuery.map(() => new Set());
  if (!tokens || parsedQuery.length === 0) return { matched, matchedPositions };

  for (let i = 0; i <= tokens.length - parsedQuery.length; i++) {
    let isMatch = true;
    for (let j = 0; j < parsedQuery.length; j++) {
      const t = tokens[i + j], q = parsedQuery[j];
      if (t.isGap) { isMatch = false; break; }
      if (q.w && (caseInsensitive ? t.w.toLowerCase() : t.w) !== (caseInsensitive ? q.w.toLowerCase() : q.w)) { isMatch = false; break; }
      if (q.l && (caseInsensitive ? t.l.toLowerCase() : t.l) !== (caseInsensitive ? q.l.toLowerCase() : q.l)) { isMatch = false; break; }
      if (q.p && t.p !== q.p) { isMatch = false; break; }
      if (q.d && t.d !== q.d) { isMatch = false; break; }
    }
    if (isMatch) {
      for (let j = 0; j < parsedQuery.length; j++) {
        matched.add(tokens[i + j].docIndex);
        matchedPositions[j].add(tokens[i + j].docIndex);
      }
    }
  }
  return { matched, matchedPositions };
};

const getAnywhereMatchIndices = (tokens, parsedQuery, caseInsensitive) => {
  const matched = new Set();
  const matchedPositions = parsedQuery.map(() => new Set());
  if (!tokens || parsedQuery.length === 0) return { matched, matchedPositions };

  let allQueriesMatched = true;

  for (let j = 0; j < parsedQuery.length; j++) {
    const q = parsedQuery[j];
    let queryMatched = false;

    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      if (t.isGap) continue;
      
      let isMatch = true;
      if (q.w && (caseInsensitive ? t.w.toLowerCase() : t.w) !== (caseInsensitive ? q.w.toLowerCase() : q.w)) isMatch = false;
      if (q.l && (caseInsensitive ? t.l.toLowerCase() : t.l) !== (caseInsensitive ? q.l.toLowerCase() : q.l)) isMatch = false;
      if (q.p && t.p !== q.p) isMatch = false;
      if (q.d && t.d !== q.d) isMatch = false;

      if (isMatch) {
        matched.add(t.docIndex);
        matchedPositions[j].add(t.docIndex);
        queryMatched = true;
      }
    }
    if (!queryMatched) { allQueriesMatched = false; break; }
  }
  return allQueriesMatched ? { matched, matchedPositions } : { matched: new Set(), matchedPositions: parsedQuery.map(() => new Set()) };
};

const deterministicShuffle = (array, seedStr) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  let a = h >>> 0;
  const rand = () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const hydrateTokens = (docTokens, span) => {
  if (!docTokens || !span || span.length === 0) return [];
  const [wArr, lArr, pArr, dArr, sArr] = docTokens;
  const tokens = [];
  for (let k = 0; k < span.length; k += 2) {
    const start = span[k], end = span[k + 1];
    if (k > 0 && span[k - 1] < start) tokens.push({ isGap: true });
    if (start === end) continue;
    for (let i = start; i < end; i++) {
      tokens.push({ w: wArr[i], l: lArr[i], p: pArr[i], d: dArr[i], s: sArr[i], docIndex: i });
    }
  }
  return tokens;
};

const formatNumericAxis = (val, key) => {
  if (val == null) return '';
  if (key && (key.includes('pos') || key.includes('Pct') || key.includes('percentage'))) {
    return val.toFixed(1);
  }
  return val.toFixed(0);
};

const isCountScaleFacet = (key) => key === 'num_distance' || key === 'num_signal_count' || key.endsWith('_len');

// --- FILTER IGNORE FLAGS ---
const getIgnoreFlags = (axis) => {
  if (axis === 'signalTypeYesNo') return ['signalType', 'signalSubtype'];
  if (axis === 'signalSubtypeYesNo') return ['signalSubtype'];
  if (axis === 'disrptLabelYesNo') return ['disrptLabel'];
  if (axis === 'origLabelYesNo') return ['origLabel'];
  return [];
};

// --- CUSTOM SVG CHARTS ---
const calculateStats = (arr) => {
  if (!arr || arr.length === 0) return { min: 0, q1: 0, median: 0, q3: 0, max: 0, mean: 0, count: 0, outliers: [], trueMin: 0, trueMax: 0 };
  const sorted = [...arr].sort((a,b) => a-b);
  const count = sorted.length;
  const mean = sorted.reduce((a,b) => a+b, 0) / count;
  const median = sorted[Math.floor(count / 2)]; 
  const q1 = sorted[Math.floor(count / 4)];
  const q3 = sorted[Math.floor(count * (3/4))];
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;
  const outliers = sorted.filter(v => v < lowerFence || v > upperFence);
  const min = Math.max(sorted[0], lowerFence);
  const max = Math.min(sorted[sorted.length-1], upperFence);
  return { min, q1, median, q3, max, mean, count, outliers, trueMin: sorted[0], trueMax: sorted[sorted.length-1] };
};

const BoxPlotSVG = ({ stats, globalMin, globalMax, color, valueKey, width = 60, height = 200, logScale = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const padTop = 10, padBottom = 10;
  const h = height - padTop - padBottom;
  const toScale = (v) => logScale ? Math.log1p(Math.max(0, v)) : v;
  const scaledMin = toScale(globalMin);
  const scaledMax = toScale(globalMax);
  const range = scaledMax - scaledMin || 1;
  const scaleY = (v) => padTop + h - ((toScale(v) - scaledMin) / range) * h;
  const cX = width / 2;
  const boxW = 24;
  const formatTooltipValue = (v) => {
    if (v == null) return '';
    const fixed = v.toFixed(2);
    if (fixed.endsWith('.00')) return String(Math.round(v));
    return fixed;
  };
  const tooltipRows = [
    `Mean: ${formatTooltipValue(stats.mean)}`,
    `Median: ${formatTooltipValue(stats.median)}`,
    `Min: ${formatTooltipValue(stats.trueMin)}`,
    `Max: ${formatTooltipValue(stats.trueMax)}`
  ];
  const tooltipX = cX + boxW / 2 + 8;
  const tooltipY = Math.max(2, scaleY(stats.q3) - 58);
  const handleTooltipEnter = () => setShowTooltip(true);
  const handleTooltipLeave = () => setShowTooltip(false);

  return (
    <svg
      width={width}
      height={height}
      className={`overflow-visible block relative ${showTooltip ? 'z-50' : 'z-0'}`}
    >
      {/* Whiskers */}
      <line x1={cX} x2={cX} y1={scaleY(stats.max)} y2={scaleY(stats.q3)} stroke={color} strokeWidth="2" strokeDasharray="4 2" />
      <line x1={cX} x2={cX} y1={scaleY(stats.min)} y2={scaleY(stats.q1)} stroke={color} strokeWidth="2" strokeDasharray="4 2" />
      <line x1={cX - 6} x2={cX + 6} y1={scaleY(stats.max)} y2={scaleY(stats.max)} stroke={color} strokeWidth="2" />
      <line x1={cX - 6} x2={cX + 6} y1={scaleY(stats.min)} y2={scaleY(stats.min)} stroke={color} strokeWidth="2" />
      
      {/* Box */}
      <rect
        x={cX - boxW/2}
        width={boxW}
        y={scaleY(stats.q3)}
        height={Math.max(2, scaleY(stats.q1) - scaleY(stats.q3))}
        fill={color}
        fillOpacity="0.3"
        stroke={color}
        strokeWidth="2"
        onMouseEnter={handleTooltipEnter}
        onMouseLeave={handleTooltipLeave}
      />
      
      {/* Median & Mean */}
      <line x1={cX - boxW/2} x2={cX + boxW/2} y1={scaleY(stats.median)} y2={scaleY(stats.median)} stroke="white" strokeWidth="2" />
      <circle cx={cX} cy={scaleY(stats.mean)} r="3" fill="#334155" />

      {/* Outliers */}
      {stats.outliers.map((o, i) => (
        <circle
          key={i}
          cx={cX}
          cy={scaleY(o)}
          r="2"
          fill="none"
          stroke={color}
          opacity="0.4"
          onMouseEnter={handleTooltipEnter}
          onMouseLeave={handleTooltipLeave}
        />
      ))}

      {showTooltip && (
        <g pointerEvents="none">
          <rect x={tooltipX} y={tooltipY} width="118" height="58" rx="6" fill="#0f172a" fillOpacity="0.95" />
          {tooltipRows.map((row, idx) => (
            <text key={idx} x={tooltipX + 8} y={tooltipY + 14 + idx * 12} fontSize="11" fill="#f8fafc">{row}</text>
          ))}
        </g>
      )}
    </svg>
  );
};

const ScatterPlotSVG = ({ data, xLabel, yLabel, xKey, yKey }) => {
  const width = 600, height = 300;
  const pad = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  const scaleX = (v) => pad.left + ((v - minX) / rangeX) * innerW;
  const scaleY = (v) => pad.top + innerH - ((v - minY) / rangeY) * innerH;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm">
      {/* Axes */}
      <line x1={pad.left} x2={width - pad.right} y1={height - pad.bottom} y2={height - pad.bottom} stroke="#cbd5e1" strokeWidth="2" />
      <line x1={pad.left} x2={pad.left} y1={pad.top} y2={height - pad.bottom} stroke="#cbd5e1" strokeWidth="2" />

      {/* Labels */}
      <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="600">{xLabel}</text>
      <text x={-height / 2} y={20} transform="rotate(-90)" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="600">{yLabel}</text>

      {/* Min/Max Text Indicators */}
      <text x={pad.left} y={height - pad.bottom + 15} fontSize="10" fill="#94a3b8" textAnchor="middle">{formatNumericAxis(minX, xKey)}</text>
      <text x={width - pad.right} y={height - pad.bottom + 15} fontSize="10" fill="#94a3b8" textAnchor="middle">{formatNumericAxis(maxX, xKey)}</text>
      <text x={pad.left - 10} y={height - pad.bottom} fontSize="10" fill="#94a3b8" textAnchor="end" alignmentBaseline="middle">{formatNumericAxis(minY, yKey)}</text>
      <text x={pad.left - 10} y={pad.top} fontSize="10" fill="#94a3b8" textAnchor="end" alignmentBaseline="middle">{formatNumericAxis(maxY, yKey)}</text>

      {/* Points */}
      {data.map((d, i) => (
        <circle key={i} cx={scaleX(d.x)} cy={scaleY(d.y)} r="4" fill="#3b82f6" opacity="0.3" className="hover:opacity-100 transition-all cursor-pointer" title={`X: ${formatNumericAxis(d.x, xKey)}\nY: ${formatNumericAxis(d.y, yKey)}`} />
      ))}
    </svg>
  );
};


export default function App() {
  const getInitialState = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      try { return JSON.parse(decodeURIComponent(atob(q))); } catch (e) { console.error(e); }
    }
    return null;
  };

  const initialState = useMemo(() => getInitialState(), []);
  const defaultDataset = useMemo(() => Object.keys(DATASET_CONFIG).find(key => DATASET_CONFIG[key].default) || Object.keys(DATASET_CONFIG)[0], []);

  const [dataset, setDataset] = useState(initialState?.dataset || defaultDataset);
  const [data, setData] = useState({ docs: {}, meta: {}, relations: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [compareDataset, setCompareDataset] = useState(initialState?.compareDataset || '');
  const [compareData, setCompareData] = useState({ docs: {}, meta: {}, relations: [] });
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState(null);
  
  const [logoUrl, setLogoUrl] = useState(null);
  const [logoError, setLogoError] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState('');

  const [activeTab, setActiveTab] = useState(initialState?.activeTab || 'results'); 

  const [searchTerm, setSearchTerm] = useState(initialState?.searchTerm || '');
  const [showSyntaxHelp, setShowSyntaxHelp] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [exactSequence, setExactSequence] = useState(initialState?.exactSequence ?? true);
  const [caseInsensitive, setCaseInsensitive] = useState(initialState?.caseInsensitive ?? true);
  const [randomizeResults, setRandomizeResults] = useState(initialState?.randomizeResults ?? true);
  
  const [disrptLabelFilter, setDisrptLabelFilter] = useState(initialState?.disrptLabelFilter || 'ALL');
  const [notDisrptLabel, setNotDisrptLabel] = useState(initialState?.notDisrptLabel || false);
  const [origLabelFilter, setOrigLabelFilter] = useState(initialState?.origLabelFilter || 'ALL');
  const [notOrigLabel, setNotOrigLabel] = useState(initialState?.notOrigLabel || false);
  const [directionFilter, setDirectionFilter] = useState(initialState?.directionFilter || 'ALL');
  const [signalType, setSignalType] = useState(initialState?.signalType || 'ALL');
  const [notSignalType, setNotSignalType] = useState(initialState?.notSignalType || false);
  const [signalSubtype, setSignalSubtype] = useState(initialState?.signalSubtype || 'ALL');
  const [notSignalSubtype, setNotSignalSubtype] = useState(initialState?.notSignalSubtype || false);
  
  const [labelDisplayMode, setLabelDisplayMode] = useState(initialState?.labelDisplayMode || 'disrpt'); 
  const [showAllSignals, setShowAllSignals] = useState(initialState?.showAllSignals ?? false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [breakdownBy, setBreakdownBy] = useState(initialState?.breakdownBy || 'disrptLabel'); 
  const [crossTabBy, setCrossTabBy] = useState(initialState?.crossTabBy || 'none');
  const [frequencyCutoff, setFrequencyCutoff] = useState(initialState?.frequencyCutoff || 1);
  const [freqSortConfig, setFreqSortConfig] = useState({ key: 'count', direction: 'desc' });
  const [showSignificance, setShowSignificance] = useState(initialState?.showSignificance || false);
  const [logScaleBoxPlots, setLogScaleBoxPlots] = useState(initialState?.logScaleBoxPlots || false);
  const [breakdownTokenLayer, setBreakdownTokenLayer] = useState(initialState?.breakdownTokenLayer || 'w');
  const [crossTabTokenLayer, setCrossTabTokenLayer] = useState(initialState?.crossTabTokenLayer || 'w');

  const [compareMode, setCompareMode] = useState(initialState?.compareMode || 'percentage');
  const [compareBreakdownBy, setCompareBreakdownBy] = useState(initialState?.compareBreakdownBy || 'disrptLabel');
  const [compareBreakdownTokenLayer, setCompareBreakdownTokenLayer] = useState(initialState?.compareBreakdownTokenLayer || 'w');
  const [compareSortConfig, setCompareSortConfig] = useState(initialState?.compareSortConfig || { key: 'meanPct', direction: 'desc' });

  const [copiedLink, setCopiedLink] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const datasetHasSignals = DATASET_CONFIG[dataset]?.hasSignals;

  const datasetHasTokenSignals = useMemo(() => {
    if (!data || !data.relations) return false;
    return data.relations.some(r => r.signals && r.signals.some(s => s[2] && s[2].trim() !== ''));
  }, [data.relations]);

  const datasetHasMultiSignalRelations = useMemo(() => {
    if (!data || !data.relations) return false;
    return data.relations.some(r => (r.signals?.length || 0) > 1);
  }, [data.relations]);

  const compareDatasetHasMultiSignalRelations = useMemo(() => {
    if (!compareData || !compareData.relations) return false;
    return compareData.relations.some(r => (r.signals?.length || 0) > 1);
  }, [compareData.relations]);

  const filtersRef = useRef({ disrptLabelFilter, origLabelFilter, directionFilter, signalType, signalSubtype });
  filtersRef.current = { disrptLabelFilter, origLabelFilter, directionFilter, signalType, signalSubtype };

  useEffect(() => {
    import('./assets/logo.png').then(module => setLogoUrl(module.default || module)).catch(() => setLogoError(true));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); setError(null);
      try {
        const config = DATASET_CONFIG[dataset];
        if (config.restricted && (!isAuthenticated || !authPassword)) {
          setError("AUTH_REQUIRED"); setIsLoading(false); setData({ docs: {}, meta: {}, relations: [] }); return;
        }

        let fetchUrl = config.uri;
        if (!fetchUrl.startsWith('http') && !fetchUrl.startsWith('authenticate.py')) fetchUrl = `data/${config.uri}`;
        
        const isCanvas = typeof window !== 'undefined' && (window.location.protocol === 'blob:' || window.location.hostname.includes('usercontent'));
        if (isCanvas && !config.uri.startsWith('http')) {
          await new Promise(r => setTimeout(r, 400));
          if (config.restricted && authPassword !== 'license123') {
            setIsAuthenticated(false); setAuthPassword(''); setError("AUTH_REQUIRED"); setIsLoading(false); return;
          }
          setData(config.uri.includes('fr.json') || config.uri.includes('fra.') ? MOCK_DATA_FR : MOCK_DATA_EN);
          setIsLoading(false); return;
        }

        const fetchOptions = config.restricted ? { headers: { 'Authorization': `Bearer ${authPassword}` } } : {};
        const response = await fetch(fetchUrl, fetchOptions);
        
        if (response.status === 401 || response.status === 403) {
            setIsAuthenticated(false); setAuthPassword(''); setError("AUTH_REQUIRED"); throw new Error("Server rejected the password.");
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        if (!jsonData.meta) jsonData.meta = {};
        setData(jsonData);
      } catch (err) {
        if (err.message !== "Server rejected the password.") setData(MOCK_DATA_EN);
      } finally { setIsLoading(false); }
    };
    fetchData();
  }, [dataset, isAuthenticated]);

  useEffect(() => {
    if (!compareDataset || compareDataset === 'none') {
      setCompareData({ docs: {}, meta: {}, relations: [] }); setCompareError(null); setIsCompareLoading(false); return;
    }

    const fetchCompareData = async () => {
      setIsCompareLoading(true); setCompareError(null);
      try {
        const config = DATASET_CONFIG[compareDataset];
        if (config.restricted && (!isAuthenticated || !authPassword)) {
          setCompareError("AUTH_REQUIRED"); setIsCompareLoading(false); setCompareData({ docs: {}, meta: {}, relations: [] }); return;
        }

        let fetchUrl = config.uri;
        if (!fetchUrl.startsWith('http') && !fetchUrl.startsWith('authenticate.py')) fetchUrl = `data/${config.uri}`;
        
        const isCanvas = typeof window !== 'undefined' && (window.location.protocol === 'blob:' || window.location.hostname.includes('usercontent'));
        if (isCanvas && !config.uri.startsWith('http')) {
          await new Promise(r => setTimeout(r, 300));
          if (config.restricted && authPassword !== 'license123') {
            setIsAuthenticated(false); setAuthPassword(''); setCompareError("AUTH_REQUIRED"); setIsCompareLoading(false); return;
          }
          setCompareData(config.uri.includes('fr.json') || config.uri.includes('fra.') ? MOCK_DATA_FR : MOCK_DATA_EN);
          setIsCompareLoading(false); return;
        }

        const fetchOptions = config.restricted ? { headers: { 'Authorization': `Bearer ${authPassword}` } } : {};
        const response = await fetch(fetchUrl, fetchOptions);
        
        if (response.status === 401 || response.status === 403) {
            setIsAuthenticated(false); setAuthPassword(''); setCompareError("AUTH_REQUIRED"); throw new Error("Server rejected the password.");
        }
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const jsonData = await response.json();
        if (!jsonData.meta) jsonData.meta = {};
        setCompareData(jsonData);
      } catch (err) {
        if (err.message !== "Server rejected the password.") setCompareData(compareDataset.includes('fra.') ? MOCK_DATA_FR : MOCK_DATA_EN);
      } finally { setIsCompareLoading(false); }
    };
    fetchCompareData();
  }, [compareDataset, isAuthenticated]);

  const prevDataset = useRef(dataset);
  useEffect(() => {
    if (prevDataset.current !== dataset) { prevDataset.current = dataset; setCurrentPage(1); }
  }, [dataset]);

  const prevSignalType = useRef(signalType);
  const prevNotSignalType = useRef(notSignalType);

  useEffect(() => {
    if (data.relations.length === 0) return;
    const dLabels = new Set(), oLabels = new Set(), dirs = new Set(), sigTypes = new Set(), sigSubtypes = new Set();
    const currentType = filtersRef.current.signalType;

    data.relations.forEach(r => {
      dLabels.add(getDisrptLabel(r.label));
      const orig = getOrigLabel(r.label);
      if (orig !== 'Unknown') oLabels.add(orig);
      if (r.direction) dirs.add(r.direction);
      if (r.signals) r.signals.forEach(s => { sigTypes.add(s[0]); if (s[0] === currentType && s[1]) sigSubtypes.add(s[1]); });
    });

    const currentFilters = filtersRef.current;
    if (currentFilters.disrptLabelFilter !== 'ALL' && !dLabels.has(currentFilters.disrptLabelFilter)) { setDisrptLabelFilter('ALL'); setNotDisrptLabel(false); }
    if (currentFilters.origLabelFilter !== 'ALL' && !oLabels.has(currentFilters.origLabelFilter)) { setOrigLabelFilter('ALL'); setNotOrigLabel(false); }
    if (currentFilters.directionFilter !== 'ALL' && !dirs.has(currentFilters.directionFilter)) setDirectionFilter('ALL');
    if (currentFilters.signalType !== 'ALL' && !sigTypes.has(currentFilters.signalType)) {
      setSignalType('ALL'); setNotSignalType(false); setSignalSubtype('ALL'); setNotSignalSubtype(false);
    } else if (currentFilters.signalSubtype !== 'ALL' && !sigSubtypes.has(currentFilters.signalSubtype)) {
      setSignalSubtype('ALL'); setNotSignalSubtype(false);
    }
  }, [data]);

  const { dynamicDisrptLabels, dynamicOrigLabels, dynamicDirections, dynamicSignalTypes, dynamicSignalSubtypes } = useMemo(() => {
    const dLabels = new Set(), oLabels = new Set(), dirs = new Set(), sigTypes = new Set(), sigSubtypes = new Set();
    data.relations.forEach(r => {
      dLabels.add(getDisrptLabel(r.label));
      const orig = getOrigLabel(r.label);
      if (orig !== 'Unknown') oLabels.add(orig);
      if (r.direction) dirs.add(r.direction);
      if (r.signals) r.signals.forEach(s => { sigTypes.add(s[0]); if (s[0] === signalType && s[1]) sigSubtypes.add(s[1]); });
    });
    return {
      dynamicDisrptLabels: Array.from(dLabels).sort(), dynamicOrigLabels: Array.from(oLabels).sort(), dynamicDirections: Array.from(dirs).sort(),
      dynamicSignalTypes: Array.from(sigTypes).sort((a, b) => getSignalDisplayName(a).localeCompare(getSignalDisplayName(b))),
      dynamicSignalSubtypes: Array.from(sigSubtypes).sort((a, b) => getSignalDisplayName(a).localeCompare(getSignalDisplayName(b)))
    };
  }, [data.relations, signalType]);

  const availableMetaKeys = useMemo(() => {
    if (!data || !data.meta) return [];
    const keys = new Set();
    Object.values(data.meta).forEach(metaObj => { if (metaObj) Object.keys(metaObj).forEach(k => keys.add(k)); });
    return Array.from(keys).sort();
  }, [data]);

  const parsedQueryState = useMemo(() => {
    let rawSearch = deferredSearchTerm;
    const metaQueries = {};
    rawSearch = rawSearch.replace(/meta::([a-zA-Z0-9_-]+)="([^"]+)"/g, (m, key, val) => { metaQueries[key] = val; return ''; });
    rawSearch = rawSearch.replace(/meta::([a-zA-Z0-9_-]+)=([^\s]+)/g, (m, key, val) => { if (!metaQueries[key]) metaQueries[key] = val; return ''; });
    rawSearch = rawSearch.trim();

    let searchMode = 'anywhere', query1Str = '', query2Str = '';
    if (rawSearch.includes('-||>')) { searchMode = 'sourceTarget'; [query1Str, query2Str] = rawSearch.split('-||>'); } 
    else if (rawSearch.includes('<||-')) { searchMode = 'targetSource'; [query1Str, query2Str] = rawSearch.split('<||-'); } 
    else if (rawSearch.includes('||')) { searchMode = 'textOrder'; [query1Str, query2Str] = rawSearch.split('||'); }

    const hasPositionalSearch = searchMode !== 'anywhere';
    return { 
      searchMode, hasPositionalSearch, 
      parsedQuery1: hasPositionalSearch ? parseQuery(query1Str) : [], 
      parsedQuery2: hasPositionalSearch ? parseQuery(query2Str) : [], 
      parsedQueryEither: !hasPositionalSearch ? parseQuery(rawSearch) : [], 
      metaQueries 
    };
  }, [deferredSearchTerm]);

  const NUMERIC_FACETS = useMemo(() => [
    { value: 'num_arg1_len', label: 'Arg1 Length (tokens)' },
    { value: 'num_arg2_len', label: 'Arg2 Length (tokens)' },
    { value: 'num_src_len', label: 'Source Length (tokens)' },
    { value: 'num_tgt_len', label: 'Target Length (tokens)' },
    { value: 'num_arg1_pos', label: 'Arg1 Position (%)' },
    { value: 'num_arg2_pos', label: 'Arg2 Position (%)' },
    { value: 'num_src_pos', label: 'Source Position (%)' },
    { value: 'num_tgt_pos', label: 'Target Position (%)' },
    { value: 'num_distance', label: 'Arg Distance (tokens)' },
  ], []);

  const breakdownOptions = useMemo(() => {
    const opts = [{ value: 'disrptLabel', label: 'DISRPT Label', group: 'Relation' }];
    if (disrptLabelFilter !== 'ALL') opts.push({ value: 'disrptLabelYesNo', label: `DISRPT Label: ${disrptLabelFilter} (yes/no)`, group: 'Relation' });
    opts.push({ value: 'origLabel', label: 'Original Label', group: 'Relation' });
    if (origLabelFilter !== 'ALL') opts.push({ value: 'origLabelYesNo', label: `Original Label: ${origLabelFilter} (yes/no)`, group: 'Relation' });
    opts.push({ value: 'direction', label: 'Direction', group: 'Relation' });
    
    if (datasetHasSignals) {
      opts.push({ value: 'signalType', label: 'Signal Type', group: 'Signals' });
      if (signalType !== 'ALL') {
        opts.push({ value: 'signalTypeYesNo', label: `Signal Type: ${getSignalDisplayName(signalType)} (yes/no)`, group: 'Signals' });
        opts.push({ value: 'signalSubtype', label: `Signal Subtype (${getSignalDisplayName(signalType)})`, group: 'Signals' });
      }
      if (signalSubtype !== 'ALL') opts.push({ value: 'signalSubtypeYesNo', label: `Signal Subtype: ${getSignalDisplayName(signalSubtype)} (yes/no)`, group: 'Signals' });
    }

    if (datasetHasMultiSignalRelations) {
      opts.push({ value: 'num_signal_count', label: 'Signals per Relation', group: 'Numeric Variables' });
    }

    availableMetaKeys.forEach(key => opts.push({ value: `meta_${key}`, label: `Meta: ${key}`, group: 'Document Metadata' }));

    NUMERIC_FACETS.forEach(nf => opts.push({ ...nf, group: 'Numeric Variables' }));

    const { hasPositionalSearch, parsedQuery1, parsedQuery2, parsedQueryEither } = parsedQueryState;
    if (hasPositionalSearch) {
      parsedQuery1.forEach((_, i) => opts.push({ value: `token_left_${i}`, label: `Left query tok ${i + 1}`, group: 'Query Tokens' }));
      parsedQuery2.forEach((_, i) => opts.push({ value: `token_right_${i}`, label: `Right query tok ${i + 1}`, group: 'Query Tokens' }));
    } else {
      parsedQueryEither.forEach((_, i) => opts.push({ value: `token_any_${i}`, label: `Query tok ${i + 1}`, group: 'Query Tokens' }));
    }

    return opts;
  }, [disrptLabelFilter, origLabelFilter, directionFilter, signalType, signalSubtype, datasetHasSignals, datasetHasMultiSignalRelations, parsedQueryState, availableMetaKeys, NUMERIC_FACETS]);


  const compareAvailableMetaKeys = useMemo(() => {
    if (!compareData || !compareData.meta) return [];
    const keys = new Set();
    Object.values(compareData.meta).forEach(metaObj => { if (metaObj) Object.keys(metaObj).forEach(k => keys.add(k)); });
    return Array.from(keys).sort();
  }, [compareData]);

  const sharedBreakdownOptions = useMemo(() => {
    if (!compareDataset || compareDataset === 'none') return [];
    const bothHaveSignals = DATASET_CONFIG[dataset]?.hasSignals && DATASET_CONFIG[compareDataset]?.hasSignals;
    const bothHaveMultiSignalRelations = datasetHasMultiSignalRelations && compareDatasetHasMultiSignalRelations;

    const opts = [
      { value: 'disrptLabel', label: 'DISRPT Label', group: 'Relation' },
      { value: 'origLabel', label: 'Original Label', group: 'Relation' },
      { value: 'direction', label: 'Direction', group: 'Relation' }
    ];

    if (disrptLabelFilter !== 'ALL') opts.push({ value: 'disrptLabelYesNo', label: `DISRPT Label: ${disrptLabelFilter} (yes/no)`, group: 'Relation' });
    if (origLabelFilter !== 'ALL') opts.push({ value: 'origLabelYesNo', label: `Original Label: ${origLabelFilter} (yes/no)`, group: 'Relation' });

    if (bothHaveSignals) {
      opts.push({ value: 'signalType', label: 'Signal Type', group: 'Signals' });
      if (signalType !== 'ALL') {
        opts.push({ value: 'signalTypeYesNo', label: `Signal Type: ${getSignalDisplayName(signalType)} (yes/no)`, group: 'Signals' });
        opts.push({ value: 'signalSubtype', label: `Signal Subtype (${getSignalDisplayName(signalType)})`, group: 'Signals' });
      }
      if (signalSubtype !== 'ALL') opts.push({ value: 'signalSubtypeYesNo', label: `Signal Subtype: ${getSignalDisplayName(signalSubtype)} (yes/no)`, group: 'Signals' });
    }

    if (bothHaveMultiSignalRelations) {
      opts.push({ value: 'num_signal_count', label: 'Signals per Relation', group: 'Numeric Variables' });
    }

    const sharedMeta = availableMetaKeys.filter(k => compareAvailableMetaKeys.includes(k));
    sharedMeta.forEach(key => opts.push({ value: `meta_${key}`, label: `Meta: ${key}`, group: 'Document Metadata' }));

    NUMERIC_FACETS.forEach(nf => opts.push({ ...nf, group: 'Numeric Variables' }));

    const { hasPositionalSearch, parsedQuery1, parsedQuery2, parsedQueryEither } = parsedQueryState;
    if (hasPositionalSearch) {
      parsedQuery1.forEach((_, i) => opts.push({ value: `token_left_${i}`, label: `Left query tok ${i + 1}`, group: 'Query Tokens' }));
      parsedQuery2.forEach((_, i) => opts.push({ value: `token_right_${i}`, label: `Right query tok ${i + 1}`, group: 'Query Tokens' }));
    } else {
      parsedQueryEither.forEach((_, i) => opts.push({ value: `token_any_${i}`, label: `Query tok ${i + 1}`, group: 'Query Tokens' }));
    }

    return opts;
  }, [dataset, compareDataset, disrptLabelFilter, origLabelFilter, signalType, signalSubtype, availableMetaKeys, compareAvailableMetaKeys, parsedQueryState, NUMERIC_FACETS, datasetHasMultiSignalRelations, compareDatasetHasMultiSignalRelations]);


  useEffect(() => {
    if (breakdownBy === crossTabBy && breakdownBy !== 'none') setCrossTabBy('none');
    
    // Dynamic resets
    const validOptions = breakdownOptions.map(o => o.value);
    if (!validOptions.includes(breakdownBy)) setBreakdownBy('disrptLabel');
    if (crossTabBy !== 'none' && !validOptions.includes(crossTabBy)) setCrossTabBy('none');

  }, [datasetHasSignals, signalType, signalSubtype, disrptLabelFilter, origLabelFilter, breakdownBy, crossTabBy, breakdownOptions]);

  useEffect(() => {
    if (compareDataset && compareDataset !== 'none' && sharedBreakdownOptions.length > 0) {
        if (!sharedBreakdownOptions.map(o => o.value).includes(compareBreakdownBy)) setCompareBreakdownBy('disrptLabel');
    }
  }, [sharedBreakdownOptions, compareDataset, compareBreakdownBy]);

  useEffect(() => {
    if (prevSignalType.current !== signalType || prevNotSignalType.current !== notSignalType) {
      setSignalSubtype('ALL');
      if (notSignalType) setNotSignalSubtype(false);
      prevSignalType.current = signalType;
      prevNotSignalType.current = notSignalType;
    }
  }, [signalType, notSignalType]);

  // Core Search Loop (Primary)
  const textMatchedData = useMemo(() => {
    const _t0 = ENABLE_QUERY_TIMING ? performance.now() : 0;
    const { searchMode, hasPositionalSearch, parsedQuery1, parsedQuery2, parsedQueryEither, metaQueries } = parsedQueryState;

    const _result = data.relations.reduce((acc, item) => {
      const docMeta = data.meta ? data.meta[item.docname] : null;
      let metaMatches = true;
      for (const [mKey, mVal] of Object.entries(metaQueries)) {
        const actualVal = docMeta && docMeta[mKey] !== undefined ? String(docMeta[mKey]) : "none";
        if (caseInsensitive ? actualVal.toLowerCase() !== mVal.toLowerCase() : actualVal !== mVal) { metaMatches = false; break; }
      }
      if (!metaMatches) return acc;

      const docData = data.docs[item.docname];
      if (!docData) return acc; 
      
      const pre_tokens = hydrateTokens(docData, item.preContext);
      const arg1_tokens = hydrateTokens(docData, item.arg1);
      const inter_tokens = hydrateTokens(docData, item.interContext);
      const arg2_tokens = hydrateTokens(docData, item.arg2);
      const post_tokens = hydrateTokens(docData, item.postContext);

      let arg1Matches = new Set(), arg2Matches = new Set();
      let arg1MatchPositions = [], arg2MatchPositions = [], leftTokens = [], rightTokens = [], leftMatchPositions = [], rightMatchPositions = [];
      let matchesSearch = true;

      if (hasPositionalSearch) {
        let isLeftArg1 = true;
        if (searchMode === 'textOrder') { leftTokens = arg1_tokens; rightTokens = arg2_tokens; } 
        else {
          const isOneToTwo = item.direction === '1>2';
          leftTokens = searchMode === 'sourceTarget' ? (isOneToTwo ? arg1_tokens : arg2_tokens) : (isOneToTwo ? arg2_tokens : arg1_tokens);
          rightTokens = searchMode === 'sourceTarget' ? (isOneToTwo ? arg2_tokens : arg1_tokens) : (isOneToTwo ? arg1_tokens : arg2_tokens);
          isLeftArg1 = searchMode === 'sourceTarget' ? isOneToTwo : !isOneToTwo;
        }

        let leftMatches = { matched: new Set(), matchedPositions: [] }, rightMatches = { matched: new Set(), matchedPositions: [] };

        if (parsedQuery1.length > 0) {
          leftMatches = exactSequence ? getMatchIndices(leftTokens, parsedQuery1, caseInsensitive) : getAnywhereMatchIndices(leftTokens, parsedQuery1, caseInsensitive);
          if (leftMatches.matched.size === 0) matchesSearch = false;
        }
        if (matchesSearch && parsedQuery2.length > 0) {
          rightMatches = exactSequence ? getMatchIndices(rightTokens, parsedQuery2, caseInsensitive) : getAnywhereMatchIndices(rightTokens, parsedQuery2, caseInsensitive);
          if (rightMatches.matched.size === 0) matchesSearch = false;
        }

        if (matchesSearch) {
          arg1Matches = isLeftArg1 ? leftMatches.matched : rightMatches.matched;
          arg2Matches = isLeftArg1 ? rightMatches.matched : leftMatches.matched;
          leftMatchPositions = leftMatches.matchedPositions;
          rightMatchPositions = rightMatches.matchedPositions;
        }
      } else if (parsedQueryEither.length > 0) {
        arg1MatchPositions = parsedQueryEither.map(() => new Set());
        arg2MatchPositions = parsedQueryEither.map(() => new Set());

        if (exactSequence) {
          const r1 = getMatchIndices(arg1_tokens, parsedQueryEither, caseInsensitive);
          const r2 = getMatchIndices(arg2_tokens, parsedQueryEither, caseInsensitive);
          arg1Matches = r1.matched; arg2Matches = r2.matched;
          arg1MatchPositions = r1.matchedPositions; arg2MatchPositions = r2.matchedPositions;
          matchesSearch = arg1Matches.size > 0 || arg2Matches.size > 0;
        } else {
          for (let j = 0; j < parsedQueryEither.length; j++) {
            const q = parsedQueryEither[j];
            const r1 = getAnywhereMatchIndices(arg1_tokens, [q], caseInsensitive);
            const r2 = getAnywhereMatchIndices(arg2_tokens, [q], caseInsensitive);
            if (r1.matched.size === 0 && r2.matched.size === 0) { matchesSearch = false; break; }
            r1.matchedPositions[0].forEach(idx => { arg1Matches.add(idx); arg1MatchPositions[j].add(idx); });
            r2.matchedPositions[0].forEach(idx => { arg2Matches.add(idx); arg2MatchPositions[j].add(idx); });
          }
          if (!matchesSearch) { arg1Matches.clear(); arg2Matches.clear(); }
        }
      }

      if (matchesSearch) {
        acc.push({ 
          ...item, pre_tokens, arg1_tokens, inter_tokens, arg2_tokens, post_tokens, 
          arg1Matches, arg2Matches, arg1MatchPositions, arg2MatchPositions,
          leftTokens, rightTokens, leftMatchPositions, rightMatchPositions
        });
      }
      return acc;
    }, []);
    if (ENABLE_QUERY_TIMING) console.log(`[Query Timing] textMatchedData: ${(performance.now() - _t0).toFixed(2)}ms (${_result.length} matches)`);
    return _result;
  }, [data, parsedQueryState, exactSequence, caseInsensitive]);

  // Core Search Loop (Compare)
  const compareTextMatchedData = useMemo(() => {
    if (!compareDataset || compareDataset === 'none' || compareData.relations.length === 0) return [];
    const { searchMode, hasPositionalSearch, parsedQuery1, parsedQuery2, parsedQueryEither, metaQueries } = parsedQueryState;

    return compareData.relations.reduce((acc, item) => {
      const docMeta = compareData.meta ? compareData.meta[item.docname] : null;
      let metaMatches = true;
      for (const [mKey, mVal] of Object.entries(metaQueries)) {
        const actualVal = docMeta && docMeta[mKey] !== undefined ? String(docMeta[mKey]) : "none";
        if (caseInsensitive ? actualVal.toLowerCase() !== mVal.toLowerCase() : actualVal !== mVal) { metaMatches = false; break; }
      }
      if (!metaMatches) return acc;

      const docData = compareData.docs[item.docname];
      if (!docData) return acc; 
      
      const pre_tokens = hydrateTokens(docData, item.preContext);
      const arg1_tokens = hydrateTokens(docData, item.arg1);
      const inter_tokens = hydrateTokens(docData, item.interContext);
      const arg2_tokens = hydrateTokens(docData, item.arg2);
      const post_tokens = hydrateTokens(docData, item.postContext);

      let arg1Matches = new Set(), arg2Matches = new Set();
      let arg1MatchPositions = [], arg2MatchPositions = [], leftTokens = [], rightTokens = [], leftMatchPositions = [], rightMatchPositions = [];
      let matchesSearch = true;

      if (hasPositionalSearch) {
        let isLeftArg1 = true;
        if (searchMode === 'textOrder') { leftTokens = arg1_tokens; rightTokens = arg2_tokens; } 
        else {
          const isOneToTwo = item.direction === '1>2';
          leftTokens = searchMode === 'sourceTarget' ? (isOneToTwo ? arg1_tokens : arg2_tokens) : (isOneToTwo ? arg2_tokens : arg1_tokens);
          rightTokens = searchMode === 'sourceTarget' ? (isOneToTwo ? arg2_tokens : arg1_tokens) : (isOneToTwo ? arg1_tokens : arg2_tokens);
          isLeftArg1 = searchMode === 'sourceTarget' ? isOneToTwo : !isOneToTwo;
        }

        let leftMatches = { matched: new Set(), matchedPositions: [] }, rightMatches = { matched: new Set(), matchedPositions: [] };

        if (parsedQuery1.length > 0) {
          leftMatches = exactSequence ? getMatchIndices(leftTokens, parsedQuery1, caseInsensitive) : getAnywhereMatchIndices(leftTokens, parsedQuery1, caseInsensitive);
          if (leftMatches.matched.size === 0) matchesSearch = false;
        }
        if (matchesSearch && parsedQuery2.length > 0) {
          rightMatches = exactSequence ? getMatchIndices(rightTokens, parsedQuery2, caseInsensitive) : getAnywhereMatchIndices(rightTokens, parsedQuery2, caseInsensitive);
          if (rightMatches.matched.size === 0) matchesSearch = false;
        }

        if (matchesSearch) {
          arg1Matches = isLeftArg1 ? leftMatches.matched : rightMatches.matched;
          arg2Matches = isLeftArg1 ? rightMatches.matched : leftMatches.matched;
          leftMatchPositions = leftMatches.matchedPositions;
          rightMatchPositions = rightMatches.matchedPositions;
        }
      } else if (parsedQueryEither.length > 0) {
        arg1MatchPositions = parsedQueryEither.map(() => new Set());
        arg2MatchPositions = parsedQueryEither.map(() => new Set());

        if (exactSequence) {
          const r1 = getMatchIndices(arg1_tokens, parsedQueryEither, caseInsensitive);
          const r2 = getMatchIndices(arg2_tokens, parsedQueryEither, caseInsensitive);
          arg1Matches = r1.matched; arg2Matches = r2.matched;
          arg1MatchPositions = r1.matchedPositions; arg2MatchPositions = r2.matchedPositions;
          matchesSearch = arg1Matches.size > 0 || arg2Matches.size > 0;
        } else {
          for (let j = 0; j < parsedQueryEither.length; j++) {
            const q = parsedQueryEither[j];
            const r1 = getAnywhereMatchIndices(arg1_tokens, [q], caseInsensitive);
            const r2 = getAnywhereMatchIndices(arg2_tokens, [q], caseInsensitive);
            if (r1.matched.size === 0 && r2.matched.size === 0) { matchesSearch = false; break; }
            r1.matchedPositions[0].forEach(idx => { arg1Matches.add(idx); arg1MatchPositions[j].add(idx); });
            r2.matchedPositions[0].forEach(idx => { arg2Matches.add(idx); arg2MatchPositions[j].add(idx); });
          }
          if (!matchesSearch) { arg1Matches.clear(); arg2Matches.clear(); }
        }
      }

      if (matchesSearch) {
        acc.push({ 
          ...item, pre_tokens, arg1_tokens, inter_tokens, arg2_tokens, post_tokens, 
          arg1Matches, arg2Matches, arg1MatchPositions, arg2MatchPositions,
          leftTokens, rightTokens, leftMatchPositions, rightMatchPositions
        });
      }
      return acc;
    }, []);
  }, [compareData, parsedQueryState, exactSequence, caseInsensitive]);

  const evalFilters = (item, ignoreSet = []) => {
    if (disrptLabelFilter !== 'ALL' && !ignoreSet.includes('disrptLabel') && (getDisrptLabel(item.label) === disrptLabelFilter) === notDisrptLabel) return false;
    if (origLabelFilter !== 'ALL' && !ignoreSet.includes('origLabel') && (getOrigLabel(item.label) === origLabelFilter) === notOrigLabel) return false;
    if (directionFilter !== 'ALL' && item.direction !== directionFilter) return false;
    if (signalType === 'ALL' && notSignalType && !ignoreSet.includes('signalType')) {
      if (item.signals && item.signals.length > 0) return false;
    }
    if (signalType !== 'ALL' && !ignoreSet.includes('signalType')) {
      const hasType = !!(item.signals && item.signals.some(s => s[0] === signalType));
      if (hasType === notSignalType) return false;
      if (!notSignalType && signalSubtype !== 'ALL' && !ignoreSet.includes('signalSubtype')) {
        const hasSubtype = !!(item.signals && item.signals.some(s => s[0] === signalType && s[1] === signalSubtype));
        if (hasSubtype === notSignalSubtype) return false;
      }
    }
    return true;
  };

  const filteredData = useMemo(() => {
    const _t0 = ENABLE_QUERY_TIMING ? performance.now() : 0;
    const _result = textMatchedData.reduce((acc, item) => {
      if (!evalFilters(item)) return acc;
      let matchingSignalIndices = new Set();
      if ((signalType !== 'ALL' || notSignalType || signalSubtype !== 'ALL') && item.signals) {
        item.signals.forEach(s => {
          const typeMatches = signalType === 'ALL' || (notSignalType ? s[0] !== signalType : s[0] === signalType);
          const subMatches = signalSubtype === 'ALL' || (notSignalSubtype ? s[1] !== signalSubtype : s[1] === signalSubtype);
          if (typeMatches && subMatches) parseSignalTokens(s[2]).forEach(idx => matchingSignalIndices.add(idx));
        });
      }
      acc.push({ ...item, matchingSignalIndices });
      return acc;
    }, []);
    if (ENABLE_QUERY_TIMING) console.log(`[Query Timing] filteredData: ${(performance.now() - _t0).toFixed(2)}ms (${_result.length} matches)`);
    return _result;
  }, [textMatchedData, disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel, directionFilter, signalType, notSignalType, signalSubtype, notSignalSubtype]);

  const sortedData = useMemo(() => {
    if (!randomizeResults) return filteredData;
    const seedStr = `${dataset}-${deferredSearchTerm}-${exactSequence}-${caseInsensitive}-${disrptLabelFilter}-${notDisrptLabel}-${origLabelFilter}-${notOrigLabel}-${directionFilter}-${signalType}-${notSignalType}-${signalSubtype}-${notSignalSubtype}`;
    return deterministicShuffle(filteredData, seedStr);
  }, [filteredData, randomizeResults, dataset, deferredSearchTerm, exactSequence, caseInsensitive, disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel, directionFilter, signalType, notSignalType, signalSubtype, notSignalSubtype]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  useEffect(() => { setCurrentPage(1); }, [
    deferredSearchTerm, exactSequence, caseInsensitive, randomizeResults,
    disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel,
    directionFilter, signalType, notSignalType, signalSubtype, notSignalSubtype, itemsPerPage
  ]);

  const getNumericVal = (numKey, item, docData) => {
    if (!docData || !docData[0]) return null;
    const docLen = docData[0].length;
    const getLen = (spans) => { let l=0; for(let i=0;i<spans.length;i+=2) l+=(spans[i+1]-spans[i]); return l; };
    const getMin = (spans) => Math.min(...spans.filter((_,i)=>i%2===0));
    const getMax = (spans) => Math.max(...spans.filter((_,i)=>i%2!==0));

    const is1to2 = item.direction === '1>2';
    const srcSpans = is1to2 ? item.arg1 : item.arg2;
    const tgtSpans = is1to2 ? item.arg2 : item.arg1;

    switch(numKey) {
      case 'num_arg1_len': return getLen(item.arg1);
      case 'num_arg2_len': return getLen(item.arg2);
      case 'num_src_len': return getLen(srcSpans);
      case 'num_tgt_len': return getLen(tgtSpans);
      case 'num_signal_count': return item.signals ? item.signals.length : 0;
      case 'num_arg1_pos': return (getMin(item.arg1) / docLen) * 100;
      case 'num_arg2_pos': return (getMin(item.arg2) / docLen) * 100;
      case 'num_src_pos': return (getMin(srcSpans) / docLen) * 100;
      case 'num_tgt_pos': return (getMin(tgtSpans) / docLen) * 100;
      case 'num_distance':
        const min1 = getMin(item.arg1), max1 = getMax(item.arg1);
        const min2 = getMin(item.arg2), max2 = getMax(item.arg2);
        if (min1 <= max2 && min2 <= max1) return 0;
        return Math.max(0, Math.max(min2 - max1, min1 - max2));
      default: return null;
    }
  };

  const getCats = (bBy, item, metaRef, layerState) => {
    if (bBy === 'disrptLabel') return [getDisrptLabel(item.label)];
    if (bBy === 'origLabel') return [getOrigLabel(item.label)];
    if (bBy === 'disrptLabelYesNo') return [(getDisrptLabel(item.label) === disrptLabelFilter) ? `${disrptLabelFilter} (yes)` : `${disrptLabelFilter} (no)`];
    if (bBy === 'origLabelYesNo') return [(getOrigLabel(item.label) === origLabelFilter) ? `${origLabelFilter} (yes)` : `${origLabelFilter} (no)`];
    if (bBy === 'direction') return [item.direction || 'Unknown'];
    if (bBy === 'signalType') return item.signals && item.signals.length > 0 ? Array.from(new Set(item.signals.map(s=>getSignalDisplayName(s[0])))) : ['None'];
    if (bBy === 'signalSubtype') {
      const subs = item.signals && item.signals.length > 0 ? Array.from(new Set(item.signals.filter(s=>s[0]===signalType && s[1]).map(s=>getSignalDisplayName(s[1])))) : [];
      return subs;
    }
    if (bBy === 'signalTypeYesNo') return [(item.signals && item.signals.some(s=>s[0]===signalType)) ? `${getSignalDisplayName(signalType)} (yes)` : `${getSignalDisplayName(signalType)} (no)`];
    if (bBy === 'signalSubtypeYesNo') return [(item.signals && item.signals.some(s=>s[0]===signalType && s[1]===signalSubtype)) ? `${getSignalDisplayName(signalSubtype)} (yes)` : `${getSignalDisplayName(signalSubtype)} (no)`];

    if (bBy.startsWith('meta_')) {
      const metaKey = bBy.replace('meta_', '');
      const docMeta = metaRef ? metaRef[item.docname] : null;
      return [docMeta && docMeta[metaKey] !== undefined ? String(docMeta[metaKey]) : 'none'];
    }

    if (bBy.startsWith('token_')) {
      const parts = bBy.split('_'), side = parts[1], qIndex = parseInt(parts[2], 10);
      const vals = [];
      let searchTokens = [], targetDocIndices = [];

      if (side === 'any') {
        if (item.arg1MatchPositions && item.arg1MatchPositions[qIndex]) { searchTokens.push(...item.arg1_tokens); targetDocIndices.push(...Array.from(item.arg1MatchPositions[qIndex])); }
        if (item.arg2MatchPositions && item.arg2MatchPositions[qIndex]) { searchTokens.push(...item.arg2_tokens); targetDocIndices.push(...Array.from(item.arg2MatchPositions[qIndex])); }
      } else if (side === 'left') {
        if (item.leftMatchPositions && item.leftMatchPositions[qIndex]) { searchTokens = item.leftTokens || []; targetDocIndices = Array.from(item.leftMatchPositions[qIndex]); }
      } else if (side === 'right') {
        if (item.rightMatchPositions && item.rightMatchPositions[qIndex]) { searchTokens = item.rightTokens || []; targetDocIndices = Array.from(item.rightMatchPositions[qIndex]); }
      }

      targetDocIndices.forEach(docIdx => {
          const t = searchTokens.find(tok => tok.docIndex === docIdx);
          if (t && t[layerState]) vals.push(t[layerState]);
      });
      return vals.length > 0 ? Array.from(new Set(vals)) : ['None'];
    }
    return [];
  };

  // --- MAIN FREQUENCY AGGREGATION LOOP ---
  const freqData = useMemo(() => {
    const isNumB = breakdownBy.startsWith('num_');
    const isNumC = crossTabBy.startsWith('num_');

    if (!isNumB && !isNumC) {
      const freqIgnoreSet = [...getIgnoreFlags(breakdownBy), ...getIgnoreFlags(crossTabBy)];
      const counts = {}, crossTab = {}, rawRowTotals = {}, rawColTotals = {};
      let rawGrandTotal = 0;

      textMatchedData.forEach(item => {
        if (!evalFilters(item, freqIgnoreSet)) return;
        const rows = getCats(breakdownBy, item, data.meta, breakdownTokenLayer);
        if (crossTabBy === 'none') {
          rows.forEach(r => counts[r] = (counts[r] || 0) + 1);
        } else {
          const cols = getCats(crossTabBy, item, data.meta, crossTabTokenLayer);
          rows.forEach(r => {
            cols.forEach(c => {
              if (!crossTab[r]) crossTab[r] = {};
              crossTab[r][c] = (crossTab[r][c] || 0) + 1;
              rawRowTotals[r] = (rawRowTotals[r] || 0) + 1;
              rawColTotals[c] = (rawColTotals[c] || 0) + 1;
            });
          });
        }
      });

      let finalGrandTotal = 0, data1D = [];
      if (crossTabBy === 'none') {
        const validKeys = Object.keys(counts).filter(k => counts[k] >= frequencyCutoff);
        validKeys.forEach(k => finalGrandTotal += counts[k]);
        data1D = validKeys.map(k => ({ name: k, count: counts[k], percentage: finalGrandTotal > 0 ? (counts[k] / finalGrandTotal) * 100 : 0 }));
        data1D.sort((a, b) => {
          let valA = a[freqSortConfig.key], valB = b[freqSortConfig.key];
          if (freqSortConfig.key === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
          if (valA < valB) return freqSortConfig.direction === 'asc' ? -1 : 1;
          if (valA > valB) return freqSortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }

      let residuals = {}, maxAbsRes = 0, rowNames = [], colNames = [], finalRowTotals = {}, finalColTotals = {};
      if (crossTabBy !== 'none') {
        const validRows = Object.keys(rawRowTotals).filter(r => rawRowTotals[r] >= frequencyCutoff);
        const validCols = Object.keys(rawColTotals).filter(c => rawColTotals[c] >= frequencyCutoff);
        validRows.forEach(r => validCols.forEach(c => {
            const val = (crossTab[r] && crossTab[r][c]) || 0;
            finalRowTotals[r] = (finalRowTotals[r] || 0) + val;
            finalColTotals[c] = (finalColTotals[c] || 0) + val;
            finalGrandTotal += val;
        }));
        rowNames = validRows.filter(r => finalRowTotals[r] > 0).sort();
        colNames = validCols.filter(c => finalColTotals[c] > 0).sort();
        
        rowNames.forEach(r => {
          residuals[r] = {};
          colNames.forEach(c => {
            const O = (crossTab[r] && crossTab[r][c]) || 0;
            const E = finalGrandTotal > 0 ? (finalRowTotals[r] * finalColTotals[c]) / finalGrandTotal : 0;
            let res = 0;
            if (E > 0) {
              const pi = finalRowTotals[r] / finalGrandTotal, pj = finalColTotals[c] / finalGrandTotal;
              const denominator = Math.sqrt(E * (1 - pi) * (1 - pj));
              res = denominator > 0 ? (O - E) / denominator : 0;
            }
            residuals[r][c] = { obs: O, exp: E, res: res };
            if (Math.abs(res) > maxAbsRes) maxAbsRes = Math.abs(res);
          });
        });
      }
      return { type: 'categorical', data1D, crossTab, residuals, rowTotals: finalRowTotals, colTotals: finalColTotals, rowNames, colNames, maxAbsRes, grandTotal: finalGrandTotal };
    }

    if (isNumB && crossTabBy === 'none') {
      const freqIgnoreSet = [...getIgnoreFlags(breakdownBy), ...getIgnoreFlags(crossTabBy)];
      const values = [];
      textMatchedData.forEach(item => {
          if (!evalFilters(item, freqIgnoreSet)) return;
          const val = getNumericVal(breakdownBy, item, data.docs[item.docname]);
          if (val !== null && !isNaN(val)) values.push(val);
      });
      return { type: 'num1d', stats: calculateStats(values), values };
    }

    if (isNumB && isNumC) {
      const freqIgnoreSet = [...getIgnoreFlags(breakdownBy), ...getIgnoreFlags(crossTabBy)];
      const points = [];
      textMatchedData.forEach(item => {
          if (!evalFilters(item, freqIgnoreSet)) return;
          const xVal = getNumericVal(breakdownBy, item, data.docs[item.docname]);
          const yVal = getNumericVal(crossTabBy, item, data.docs[item.docname]);
          if (xVal !== null && !isNaN(xVal) && yVal !== null && !isNaN(yVal)) {
            points.push({ x: xVal, y: yVal });
          }
      });
      return { type: 'scatter', points };
    }

    const catKey = isNumB ? crossTabBy : breakdownBy;
    const numKey = isNumB ? breakdownBy : crossTabBy;
    const layerState = isNumB ? crossTabTokenLayer : breakdownTokenLayer;
    const freqIgnoreSet = [...getIgnoreFlags(breakdownBy), ...getIgnoreFlags(crossTabBy)];
    const groupsMap = {};

    textMatchedData.forEach(item => {
        if (!evalFilters(item, freqIgnoreSet)) return;
        const cats = getCats(catKey, item, data.meta, layerState);
        const num = getNumericVal(numKey, item, data.docs[item.docname]);
        if (num === null || isNaN(num)) return;
        cats.forEach(c => {
            if (!groupsMap[c]) groupsMap[c] = [];
            groupsMap[c].push(num);
        });
    });

    const groups = Object.entries(groupsMap)
        .filter(([k, vals]) => vals.length >= frequencyCutoff)
        .map(([k, vals]) => ({ name: k, stats: calculateStats(vals) }));
    
    groups.sort((a,b) => a.stats.mean - b.stats.mean);

    return { type: 'num-cat', groups, catKey, numKey };

  }, [textMatchedData, breakdownBy, crossTabBy, freqSortConfig, signalType, signalSubtype, disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel, directionFilter, notSignalType, notSignalSubtype, frequencyCutoff, breakdownTokenLayer, crossTabTokenLayer, data]);

  // --- Compare Tab Data Aggregation ---
  const compareFreqDataPrimary = useMemo(() => {
    if (!compareDataset || compareDataset === 'none' || textMatchedData.length === 0) return { type: 'categorical', data1D: [], grandTotal: 0 };
    
    const compareIgnoreSet = getIgnoreFlags(compareBreakdownBy);
    const isNum = compareBreakdownBy.startsWith('num_');
    if (isNum) {
      const values = [];
      textMatchedData.forEach(item => {
          if (!evalFilters(item, compareIgnoreSet)) return;
          const val = getNumericVal(compareBreakdownBy, item, data.docs[item.docname]);
          if (val !== null && !isNaN(val)) values.push(val);
      });
      return { type: 'num', stats: calculateStats(values), values };
    }

    const counts = {}; let finalGrandTotal = 0;
    textMatchedData.forEach(item => {
      if (!evalFilters(item, compareIgnoreSet)) return;
      const rows = getCats(compareBreakdownBy, item, data.meta, compareBreakdownTokenLayer);
      rows.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
    });
    const validKeys = Object.keys(counts).filter(k => counts[k] >= frequencyCutoff);
    validKeys.forEach(k => finalGrandTotal += counts[k]);
    const data1D = validKeys.map(k => ({ name: k, count: counts[k], percentage: finalGrandTotal > 0 ? (counts[k] / finalGrandTotal) * 100 : 0 }));
    return { type: 'categorical', data1D, grandTotal: finalGrandTotal };
  }, [textMatchedData, compareBreakdownBy, signalType, signalSubtype, disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel, directionFilter, notSignalType, notSignalSubtype, frequencyCutoff, compareBreakdownTokenLayer, data.meta, compareDataset]);

  const compareFreqData = useMemo(() => {
    if (!compareDataset || compareDataset === 'none' || compareTextMatchedData.length === 0) return { type: 'categorical', data1D: [], grandTotal: 0 };
    
    const compareIgnoreSet = getIgnoreFlags(compareBreakdownBy);
    const isNum = compareBreakdownBy.startsWith('num_');
    if (isNum) {
      const values = [];
      compareTextMatchedData.forEach(item => {
          if (!evalFilters(item, compareIgnoreSet)) return;
          const val = getNumericVal(compareBreakdownBy, item, compareData.docs[item.docname]);
          if (val !== null && !isNaN(val)) values.push(val);
      });
      return { type: 'num', stats: calculateStats(values), values };
    }

    const counts = {}; let finalGrandTotal = 0;
    compareTextMatchedData.forEach(item => {
      if (!evalFilters(item, compareIgnoreSet)) return;
      const rows = getCats(compareBreakdownBy, item, compareData.meta, compareBreakdownTokenLayer);
      rows.forEach(r => { counts[r] = (counts[r] || 0) + 1; });
    });
    const validKeys = Object.keys(counts).filter(k => counts[k] >= frequencyCutoff);
    validKeys.forEach(k => finalGrandTotal += counts[k]);
    const data1D = validKeys.map(k => ({ name: k, count: counts[k], percentage: finalGrandTotal > 0 ? (counts[k] / finalGrandTotal) * 100 : 0 }));
    return { type: 'categorical', data1D, grandTotal: finalGrandTotal };
  }, [compareTextMatchedData, compareBreakdownBy, signalType, signalSubtype, disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel, directionFilter, notSignalType, notSignalSubtype, frequencyCutoff, compareBreakdownTokenLayer, compareData.meta, compareDataset]);

  const combinedCompareData = useMemo(() => {
    if (!compareDataset || compareDataset === 'none' || compareFreqDataPrimary.type !== 'categorical') return [];
    
    const ds1 = compareFreqDataPrimary.data1D;
    const ds2 = compareFreqData.data1D;
    const allNames = Array.from(new Set([...ds1.map(d=>d.name), ...ds2.map(d=>d.name)]));

    const combined = allNames.map(name => {
      const item1 = ds1.find(d => d.name === name) || { count: 0, percentage: 0 };
      const item2 = ds2.find(d => d.name === name) || { count: 0, percentage: 0 };
      return { name, ds1Count: item1.count, ds1Pct: item1.percentage, ds2Count: item2.count, ds2Pct: item2.percentage, meanPct: (item1.percentage + item2.percentage) / 2 };
    });

    combined.sort((a, b) => {
        let valA = a[compareSortConfig.key], valB = b[compareSortConfig.key];
        if (compareSortConfig.key === 'name') { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
        if (valA < valB) return compareSortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return compareSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });
    return combined;
  }, [compareFreqDataPrimary, compareFreqData, compareDataset, compareSortConfig]);


  const maxFreqCount = useMemo(() => {
    return (freqData.type === 'categorical' && freqData.data1D.length > 0) ? Math.max(...freqData.data1D.map(d => d.count)) : 1;
  }, [freqData]);

  const handleFreqSort = (key) => {
    if (freqSortConfig.key === key) setFreqSortConfig({ key, direction: freqSortConfig.direction === 'asc' ? 'desc' : 'asc' });
    else setFreqSortConfig({ key, direction: key === 'count' ? 'desc' : 'asc' }); 
  };

  const handleCompareSort = (key) => {
    if (compareSortConfig.key === key) setCompareSortConfig({ key, direction: compareSortConfig.direction === 'asc' ? 'desc' : 'asc' });
    else setCompareSortConfig({ key, direction: key === 'name' ? 'asc' : 'desc' }); 
  };

  const getResidualColor = (res, intensity) => {
    const safeIntensity = Math.min(1, Math.max(0, intensity));
    if (res > 0) {
      const r = Math.round(255 - safeIntensity * (255 - 220)), g = Math.round(255 - safeIntensity * (255 - 38)), b = Math.round(255 - safeIntensity * (255 - 38));
      return `rgb(${r},${g},${b})`;
    } else if (res < 0) {
      const r = Math.round(255 - safeIntensity * (255 - 37)), g = Math.round(255 - safeIntensity * (255 - 99)), b = Math.round(255 - safeIntensity * (255 - 235));
      return `rgb(${r},${g},${b})`;
    }
    return 'rgb(255,255,255)';
  };

  const getSignificanceAsterisks = (res) => {
    const absRes = Math.abs(res);
    if (absRes >= 3.291) return '***';
    if (absRes >= 2.576) return '**';
    if (absRes >= 1.960) return '*';
    return '';
  };

  const getAsteriskColor = (intensity) => intensity < 0.5 ? '#475569' : '#ffffff';

  const getLabelStyle = (label) => {
    if (!label) return {};
    let hash = 0;
    for (let i = 0; i < label.length; i++) hash = label.charCodeAt(i) + ((hash << 5) - hash);
    const hue = Math.abs(hash) % 360;
    return { backgroundColor: `hsl(${hue}, 85%, 90%)`, color: `hsl(${hue}, 85%, 25%)`, borderColor: `hsl(${hue}, 85%, 80%)` };
  };

  const hexToRgba = (hex, alpha) => {
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getSignalColor = (type) => SIGNAL_COLORS[type] ? hexToRgba(SIGNAL_COLORS[type], 0.3) : 'rgba(203, 213, 225, 0.4)';
  const getSignalBorderColor = (type) => SIGNAL_COLORS[type] || '#cbd5e1';

  const renderSpan = (tokens, matchIndices, filterSignalIndices, allSignalMap, showAllSignals, isContext) => {
    if (!tokens || tokens.length === 0) return null;
    return tokens.map((t, i) => {
      if (t.isGap) return <span key={`gap-${i}`} className="mx-1 text-slate-400 font-bold">[...]</span>;
      
      const isMatch = matchIndices && matchIndices.has(t.docIndex);
      const isFilterSignal = filterSignalIndices && filterSignalIndices.has(t.docIndex);
      const signalData = allSignalMap.get(t.docIndex);
      
      let style = {};
      let classes = ["group/word", "relative", "inline-block", "rounded", "transition-colors", "py-0.5"];
      
      if (isContext) classes.push("italic");
      else classes.push("cursor-default");
      
      if (showAllSignals && signalData) {
        style.backgroundColor = getSignalColor(signalData.type);
        style.border = `1px solid ${getSignalBorderColor(signalData.type)}`;
        classes.push("text-slate-900");
      } else if (isFilterSignal) {
        classes.push("bg-emerald-200", "text-emerald-900", "font-medium", "shadow-sm", "z-10");
        style.border = "1px solid #10b981";
      } else if (!isContext) {
        classes.push("hover:bg-blue-100", "text-slate-900");
        style.border = "1px solid transparent";
      } else {
        classes.push("text-slate-400");
        style.border = "1px solid transparent";
      }
      
      if (isMatch) {
        style.borderBottom = "3px solid #eab308";
        style.fontWeight = "700";
        if (!showAllSignals && !isFilterSignal) {
          style.backgroundColor = "rgba(254, 240, 138, 0.4)";
          classes.push("text-slate-900");
        }
      }

      return (
        <React.Fragment key={i}>
          <span className={classes.join(' ')} style={style}>
            {t.w}
            {!isContext && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/word:flex flex-col items-center bg-slate-800 text-white font-normal text-[10px] px-2 py-1.5 rounded whitespace-nowrap z-20 font-mono shadow-md leading-snug">
                <span>{t.l}|{t.p}|{t.d}</span>
                {showAllSignals && signalData && signalData.allSignals && signalData.allSignals.length > 0 && (
                  <span className="text-slate-300">
                    (sigs: {signalData.allSignals.map(sig => {
                      const tName = getSignalDisplayName(sig.type);
                      const stName = sig.subtype ? getSignalDisplayName(sig.subtype) : '';
                      return stName ? `${tName}/${stName}` : tName;
                    }).join(', ')})
                  </span>
                )}
              </span>
            )}
          </span>
          {t.s !== 0 && " "}
        </React.Fragment>
      );
    });
  };

  const handleExportTSV = () => {
    let tsv = "";
    if (freqData.type === 'categorical') {
      if (crossTabBy === 'none') {
        tsv += "Name\tCount\tPercentage\n";
        freqData.data1D.forEach(row => tsv += `${row.name}\t${row.count}\t${row.percentage.toFixed(2)}%\n`);
        tsv += `Total\t${freqData.grandTotal}\t100%\n`;
      } else {
        tsv += `Name\t${freqData.colNames.join('\t')}\tTotal\n`;
        freqData.rowNames.forEach(r => {
          const rowData = freqData.colNames.map(c => freqData.residuals[r][c]?.obs || 0);
          tsv += `${r}\t${rowData.join('\t')}\t${freqData.rowTotals[r] || 0}\n`;
        });
        const totalRow = freqData.colNames.map(c => freqData.colTotals[c] || 0);
        tsv += `Total\t${totalRow.join('\t')}\t${freqData.grandTotal}\n`;
      }
    } else if (freqData.type === 'num1d') {
      tsv += "Variable\tCount\tMean\tMin\tQ1\tMedian\tQ3\tMax\n";
      const s = freqData.stats;
      tsv += `${breakdownOptions.find(o=>o.value===breakdownBy)?.label}\t${s.count}\t${s.mean.toFixed(2)}\t${s.trueMin.toFixed(2)}\t${s.q1.toFixed(2)}\t${s.median.toFixed(2)}\t${s.q3.toFixed(2)}\t${s.trueMax.toFixed(2)}\n`;
    } else if (freqData.type === 'num-cat') {
      tsv += "Category\tCount\tMean\tMin\tQ1\tMedian\tQ3\tMax\n";
      freqData.groups.forEach(g => {
        const s = g.stats;
        tsv += `${g.name}\t${s.count}\t${s.mean.toFixed(2)}\t${s.trueMin.toFixed(2)}\t${s.q1.toFixed(2)}\t${s.median.toFixed(2)}\t${s.q3.toFixed(2)}\t${s.trueMax.toFixed(2)}\n`;
      });
    } else if (freqData.type === 'scatter') {
      tsv += "X\tY\n";
      freqData.points.forEach(p => tsv += `${p.x.toFixed(4)}\t${p.y.toFixed(4)}\n`);
    }
    
    const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', 'frequencies.tsv');
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleExportCompareTSV = () => {
    let tsv = "";
    if (compareFreqDataPrimary.type === 'categorical') {
      tsv = `Name\t${dataset} Count\t${dataset} %\t${compareDataset} Count\t${compareDataset} %\n`;
      combinedCompareData.forEach(row => {
        tsv += `${row.name}\t${row.ds1Count}\t${row.ds1Pct.toFixed(2)}%\t${row.ds2Count}\t${row.ds2Pct.toFixed(2)}%\n`;
      });
      tsv += `Total\t${compareFreqDataPrimary.grandTotal}\t100%\t${compareFreqData.grandTotal}\t100%\n`;
    } else if (compareFreqDataPrimary.type === 'num') {
      tsv = `Dataset\tCount\tMean\tMin\tQ1\tMedian\tQ3\tMax\n`;
      const s1 = compareFreqDataPrimary.stats, s2 = compareFreqData.stats;
      tsv += `${dataset}\t${s1.count}\t${s1.mean.toFixed(2)}\t${s1.trueMin.toFixed(2)}\t${s1.q1.toFixed(2)}\t${s1.median.toFixed(2)}\t${s1.q3.toFixed(2)}\t${s1.trueMax.toFixed(2)}\n`;
      tsv += `${compareDataset}\t${s2.count}\t${s2.mean.toFixed(2)}\t${s2.trueMin.toFixed(2)}\t${s2.q1.toFixed(2)}\t${s2.median.toFixed(2)}\t${s2.q3.toFixed(2)}\t${s2.trueMax.toFixed(2)}\n`;
    }
    
    const blob = new Blob([tsv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.setAttribute('href', url); link.setAttribute('download', `comparison_${dataset}_vs_${compareDataset}.tsv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const handleShare = () => {
    const stateToSave = {
      dataset, searchTerm, exactSequence, caseInsensitive, randomizeResults,
      disrptLabelFilter, notDisrptLabel, origLabelFilter, notOrigLabel,
      directionFilter, signalType, notSignalType, signalSubtype, notSignalSubtype,
      activeTab, labelDisplayMode, showAllSignals, breakdownBy, crossTabBy, showSignificance, frequencyCutoff,
      logScaleBoxPlots,
      breakdownTokenLayer, crossTabTokenLayer, compareDataset, compareMode, compareBreakdownBy, compareBreakdownTokenLayer, compareSortConfig
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(stateToSave)));
    setShareUrl(`${window.location.origin}${window.location.pathname}?q=${encoded}`);
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    const textArea = document.createElement("textarea"); textArea.value = shareUrl;
    textArea.style.position = "fixed"; textArea.style.opacity = "0"; document.body.appendChild(textArea);
    textArea.focus(); textArea.select();
    try { document.execCommand('copy'); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); } catch (err) {}
    document.body.removeChild(textArea);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    if (authPassword.trim() !== '') { 
      setIsAuthenticated(true);
      setIsAuthModalOpen(false);
      setAuthErrorMsg('');
    } else {
      setAuthErrorMsg('Please enter a password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };


  // --- RENDER FREQUENCIES 1D CATEGORICAL ---
  const renderFrequencies1D = () => {
    if (freqData.type !== 'categorical' || crossTabBy !== 'none') return null;
    if (freqData.data1D.length === 0) return <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">No data meets the cutoff</div>;

    const TOP_N = 20;
    const isTokenBreakdown = breakdownBy.startsWith('token_');
    const limit = isTokenBreakdown ? TOP_N : freqData.data1D.length;
    const uiData1D = freqData.data1D.slice(0, limit);
    const hasMore = freqData.data1D.length > limit;
    const uiMaxFreqCount = uiData1D.length > 0 ? Math.max(...uiData1D.map(d => d.count)) : 1;

    return (
      <div className="space-y-4">
        {hasMore && (
           <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm text-center">
             Showing the <b>top {TOP_N}</b> of {freqData.data1D.length} values with a total unfiltered frequency of {freqData.grandTotal.toLocaleString()} to prevent browser lag. <br className="sm:hidden"/>Use the <b>Download</b> button above to get the full dataset.
           </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 flex flex-col self-start">
            <div className="space-y-4">
              {uiData1D.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-1/3 text-right text-sm font-medium text-slate-700 truncate" title={item.name}>{item.name}</div>
                  <div className="w-2/3 flex items-center gap-3">
                    <div className="flex-1 h-6 bg-slate-200 rounded overflow-hidden">
                      <div className="h-full bg-blue-500 rounded transition-all duration-500" style={{ width: `${(item.count / uiMaxFreqCount) * 100}%`, minWidth: item.count > 0 ? '4px' : '0' }}></div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 w-12 text-right">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden self-start">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-semibold select-none">
                  <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleFreqSort('name')}>
                    <div className="flex items-center justify-between">Name <span className="text-slate-400 group-hover:text-slate-700">{freqSortConfig.key === 'name' ? (freqSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div>
                  </th>
                  <th className="p-4 cursor-pointer group hover:bg-slate-100 transition-colors border-l border-slate-200 w-32" onClick={() => handleFreqSort('count')}>
                    <div className="flex items-center justify-between">Count <span className="text-slate-400 group-hover:text-slate-700">{freqSortConfig.key === 'count' ? (freqSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div>
                  </th>
                  <th className="p-4 border-l border-slate-200 w-32">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {uiData1D.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900">{item.name}</td>
                    <td className="p-4 font-mono text-slate-600 border-l border-slate-100">{item.count.toLocaleString()}</td>
                    <td className="p-4 text-slate-500 border-l border-slate-100">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-700 text-sm">
                <tr>
                  <td className="p-4">{hasMore ? "Unfiltered Total" : "Total"}</td>
                  <td className="p-4 border-l border-slate-200 font-mono">{freqData.grandTotal.toLocaleString()}</td>
                  <td className="p-4 border-l border-slate-200">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER FREQUENCIES 2D CATEGORICAL ---
  const renderFrequencies2D = () => {
    if (freqData.type !== 'categorical' || crossTabBy === 'none') return null;
    if (freqData.rowNames.length === 0) return <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">No data meets the cutoff</div>;

    const TOP_N = 20;
    const isRowToken = breakdownBy.startsWith('token_'), isColToken = crossTabBy.startsWith('token_');
    let uiRowNames = freqData.rowNames;
    if (isRowToken && uiRowNames.length > TOP_N) uiRowNames = [...uiRowNames].sort((a,b)=>freqData.rowTotals[b]-freqData.rowTotals[a]).slice(0, TOP_N).sort();
    let uiColNames = freqData.colNames;
    if (isColToken && uiColNames.length > TOP_N) uiColNames = [...uiColNames].sort((a,b)=>freqData.colTotals[b]-freqData.colTotals[a]).slice(0, TOP_N).sort();

    const hasMore = freqData.rowNames.length > uiRowNames.length || freqData.colNames.length > uiColNames.length;

    return (
      <div className="space-y-4">
        {hasMore && (
           <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm text-center">
             Showing a truncated <b>{uiRowNames.length}x{uiColNames.length}</b> matrix from {freqData.rowNames.length}x{freqData.colNames.length} values with a total unfiltered frequency of {freqData.grandTotal.toLocaleString()}. <br className="sm:hidden"/>Use <b>Download</b> above for the full matrix.
           </div>
        )}
        <div className="border border-slate-200 rounded-xl bg-white overflow-x-auto shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-center sm:text-left">Contingency Table & Chi-Squared Residuals</h3>
              <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-600"></div> Positive Residual</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600"></div> Negative Residual</div>
                 {showSignificance && (
                   <>
                     <div className="hidden sm:block border-l border-slate-200 h-4"></div>
                     <div className="flex items-center gap-1.5"><span className="font-bold text-slate-700">***</span> p&lt;0.001</div>
                     <div className="flex items-center gap-1.5"><span className="font-bold text-slate-700">**</span> p&lt;0.01</div>
                     <div className="flex items-center gap-1.5"><span className="font-bold text-slate-700">*</span> p&lt;0.05</div>
                   </>
                 )}
              </div>
            </div>
            <div className="flex items-center gap-2">
               <input type="checkbox" id="showSignificance" checked={showSignificance} onChange={(e) => setShowSignificance(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
               <label htmlFor="showSignificance" className="text-sm font-medium text-slate-700 cursor-pointer select-none">Significance overlay</label>
            </div>
          </div>
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-sm font-semibold text-slate-600 border-r border-slate-200 bg-slate-50/80 sticky left-0 z-10"></th>
                {uiColNames.map(c => <th key={c} className="p-3 text-sm font-semibold text-slate-700 whitespace-nowrap min-w-[80px]">{c}</th>)}
                <th className="p-3 text-sm font-bold text-slate-800 border-l border-slate-200 bg-slate-50">{hasMore ? "Unfiltered Total" : "Total"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {uiRowNames.map(r => (
                <tr key={r} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 font-semibold text-slate-700 text-right border-r border-slate-200 bg-white whitespace-nowrap sticky left-0 z-10">{r}</td>
                  {uiColNames.map(c => {
                    const cell = freqData.residuals[r][c] || { obs: 0, exp: 0, res: 0 };
                    const scaleMax = Math.max(4, freqData.maxAbsRes);
                    const sizePct = (Math.abs(cell.res) / scaleMax) * 100;
                    const colorStr = getResidualColor(cell.res, Math.abs(cell.res) / scaleMax);
                    const astColor = getAsteriskColor(Math.abs(cell.res) / scaleMax);
                    return (
                      <td key={c} className="p-3 align-middle group relative">
                        <div className="relative flex items-center justify-center h-10 w-10 mx-auto">
                          {sizePct > 0 && (
                            <div className="rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-sm transition-all" style={{ width: `${sizePct}%`, height: `${sizePct}%`, backgroundColor: colorStr }} title={`Observed: ${cell.obs}\nExpected: ${cell.exp.toFixed(1)}\nResidual: ${cell.res.toFixed(2)}`}></div>
                          )}
                          {sizePct === 0 && cell.obs > 0 && <div className="text-slate-300 text-xs" title={`Observed: ${cell.obs}`}>-</div>}
                          {showSignificance && getSignificanceAsterisks(cell.res) && (
                            <span className="absolute z-10 pointer-events-none font-bold" style={{ color: astColor, fontSize: '14px', lineHeight: 1, textShadow: astColor === '#ffffff' ? '0 1px 2px rgba(0,0,0,0.4)' : 'none' }}>{getSignificanceAsterisks(cell.res)}</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-3 font-mono font-bold text-slate-800 border-l border-slate-200 bg-slate-50/30">{(freqData.rowTotals[r] || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-sm">
              <tr>
                <td className="p-3 text-slate-800 text-right border-r border-slate-200 sticky left-0 z-10">{hasMore ? "Unfiltered Total" : "Total"}</td>
                {uiColNames.map(c => <td key={c} className="p-3 font-mono text-slate-800">{(freqData.colTotals[c] || 0).toLocaleString()}</td>)}
                <td className="p-3 font-mono font-bold text-slate-900 border-l border-slate-200 bg-slate-100/50">{freqData.grandTotal.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // --- NUMERIC CHARTS ---
  const renderNumeric1D = () => {
    if (freqData.type !== 'num1d') return null;
    const s = freqData.stats;
    const canUseLogScale = isCountScaleFacet(breakdownBy);
    const useLogScale = canUseLogScale && logScaleBoxPlots;
    if (s.count === 0) return <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">No numeric data available.</div>;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[300px]">
           <h3 className="font-bold text-slate-800 mb-6 text-center w-full">Distribution: {breakdownOptions.find(o=>o.value===breakdownBy)?.label}</h3>
           {canUseLogScale && (
             <label className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
               <input type="checkbox" checked={logScaleBoxPlots} onChange={(e) => setLogScaleBoxPlots(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
               Log-scale y-axis (log1p)
             </label>
           )}
           <div className="flex justify-center items-start gap-4 pb-4 min-w-max px-8">
             <div className="relative pt-[10px] pb-[10px]">
               <div className="flex flex-col justify-between items-end pr-2 border-r border-slate-300 text-xs font-mono text-slate-500" style={{ height: '230px' }}>
                 <span className="leading-none transform translate-y-[-50%]">{formatNumericAxis(s.trueMax, breakdownBy)}</span>
                 <span className="leading-none transform translate-y-[50%]">{formatNumericAxis(s.trueMin, breakdownBy)}</span>
               </div>
             </div>
             <div className="flex flex-col items-center w-20">
                <BoxPlotSVG stats={s} globalMin={s.trueMin} globalMax={s.trueMax} color="#3b82f6" valueKey={breakdownBy} width={80} height={250} logScale={useLogScale} />
             </div>
           </div>
        </div>
        <div className="border border-slate-200 rounded-xl overflow-hidden self-start">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-semibold select-none">
                  <th className="p-4 w-1/2">Statistic</th>
                  <th className="p-4 border-l border-slate-200 w-1/2 text-right">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-mono text-slate-700">
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">Total Count</td><td className="p-4 border-l border-slate-100 text-right font-bold text-blue-600">{s.count.toLocaleString()}</td></tr>
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">Mean</td><td className="p-4 border-l border-slate-100 text-right">{s.mean.toFixed(2)}</td></tr>
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">Minimum</td><td className="p-4 border-l border-slate-100 text-right text-slate-500">{formatNumericAxis(s.trueMin, breakdownBy)}</td></tr>
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">25th Percentile (Q1)</td><td className="p-4 border-l border-slate-100 text-right">{formatNumericAxis(s.q1, breakdownBy)}</td></tr>
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">Median (Q2)</td><td className="p-4 border-l border-slate-100 text-right font-bold">{formatNumericAxis(s.median, breakdownBy)}</td></tr>
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">75th Percentile (Q3)</td><td className="p-4 border-l border-slate-100 text-right">{formatNumericAxis(s.q3, breakdownBy)}</td></tr>
                <tr className="hover:bg-slate-50/50"><td className="p-4 font-sans font-medium text-slate-900">Maximum</td><td className="p-4 border-l border-slate-100 text-right text-slate-500">{formatNumericAxis(s.trueMax, breakdownBy)}</td></tr>
              </tbody>
            </table>
        </div>
      </div>
    );
  };

  const renderNumCat = () => {
    if (freqData.type !== 'num-cat') return null;
    if (freqData.groups.length === 0) return <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">No data meets the cutoff</div>;
    const canUseLogScale = isCountScaleFacet(freqData.numKey);
    const useLogScale = canUseLogScale && logScaleBoxPlots;

    const TOP_N = 20;
    const isTokenBreakdown = freqData.catKey.startsWith('token_');
    let uiGroups = freqData.groups;
    if (isTokenBreakdown && uiGroups.length > TOP_N) {
      uiGroups = [...uiGroups].sort((a,b) => b.stats.count - a.stats.count).slice(0, TOP_N).sort((a,b) => a.stats.mean - b.stats.mean);
    }
    const hasMore = freqData.groups.length > uiGroups.length;

    const globalMin = Math.min(...uiGroups.map(g => g.stats.trueMin));
    const globalMax = Math.max(...uiGroups.map(g => g.stats.trueMax));
    const catLabel = breakdownOptions.find(o=>o.value===freqData.catKey)?.label || 'Category';
    const numLabel = breakdownOptions.find(o=>o.value===freqData.numKey)?.label || 'Value';

    return (
      <div className="space-y-6">
        {hasMore && (
           <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm text-center">
             Showing the <b>top {TOP_N}</b> categories by frequency out of {freqData.groups.length}. <br className="sm:hidden"/>Use the <b>Download</b> button to export all stats.
           </div>
        )}
        <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 overflow-x-auto shadow-sm">
           <h3 className="font-bold text-slate-800 mb-6 text-center w-full">{numLabel} by {catLabel}</h3>
           {canUseLogScale && (
             <label className="mb-4 flex items-center justify-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
               <input type="checkbox" checked={logScaleBoxPlots} onChange={(e) => setLogScaleBoxPlots(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
               Log-scale y-axis (log1p)
             </label>
           )}
           <div className="flex justify-center items-start gap-2 pb-4 min-w-max px-8">
             <div className="relative pt-[10px] pb-[10px] mr-2">
               <div className="flex flex-col justify-between items-end pr-2 border-r border-slate-300 text-xs font-mono text-slate-500" style={{ height: '180px' }}>
                 <span className="leading-none transform translate-y-[-50%]">{formatNumericAxis(globalMax, freqData.numKey)}</span>
                 <span className="leading-none transform translate-y-[50%]">{formatNumericAxis(globalMin, freqData.numKey)}</span>
               </div>
             </div>
             {uiGroups.map((g, i) => (
                <div key={i} className="flex flex-col items-center w-16">
                  <BoxPlotSVG stats={g.stats} globalMin={globalMin} globalMax={globalMax} color="#3b82f6" valueKey={freqData.numKey} width={40} height={200} logScale={useLogScale} />
                  <div className="flex flex-col items-center mt-2 h-10 justify-start">
                    <span className="text-[10px] font-semibold text-slate-700 text-center truncate w-full" title={g.name}>{g.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono" title="Count">n={g.stats.count}</span>
                  </div>
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  };

  const renderScatter = () => {
    if (freqData.type !== 'scatter') return null;
    if (freqData.points.length === 0) return <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">No numerical pairs found.</div>;
    const xLabel = breakdownOptions.find(o=>o.value===breakdownBy)?.label || 'X';
    const yLabel = breakdownOptions.find(o=>o.value===crossTabBy)?.label || 'Y';
    return (
      <div className="flex flex-col items-center justify-center p-6 border border-slate-100 rounded-xl bg-slate-50/50 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 text-center w-full">{yLabel} vs {xLabel}</h3>
        <ScatterPlotSVG data={freqData.points} xLabel={xLabel} yLabel={yLabel} xKey={breakdownBy} yKey={crossTabBy} />
        <p className="text-xs text-slate-500 mt-4">Showing {freqData.points.length.toLocaleString()} individual relations.</p>
      </div>
    );
  };


  const renderCompareTab = () => {
    const isNumericCompare = compareFreqDataPrimary.type === 'num' && compareFreqData.type === 'num';
    const hasCategoricalCompareData = combinedCompareData.length > 0;
    const hasNumericCompareData = isNumericCompare && (((compareFreqDataPrimary.stats && compareFreqDataPrimary.stats.count) || 0) > 0 || ((compareFreqData.stats && compareFreqData.stats.count) || 0) > 0);
    const hasCompareData = hasCategoricalCompareData || hasNumericCompareData;

    const controls = (
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-800 truncate">Compare Datasets</h2>
          <p className="text-sm text-slate-500 truncate">Compare distributions across two datasets</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <button 
            onClick={handleExportCompareTSV}
            disabled={!compareDataset || compareDataset === 'none' || !hasCompareData}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          
          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0 bg-orange-50 p-1.5 rounded-xl border border-orange-200 shadow-sm">
            <label className="text-sm font-semibold text-orange-800 whitespace-nowrap shrink-0 pl-1.5">Compare with:</label>
            <div className="relative flex-1 min-w-0">
              <select
                value={compareDataset}
                onChange={e => setCompareDataset(e.target.value)}
                className="bg-white border border-orange-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 block py-1.5 px-3 outline-none cursor-pointer w-full"
              >
                <option value="none">Select a dataset...</option>
                {Object.keys(DATASET_CONFIG).map(name => {
                  if (name === dataset) return null;
                  const isRestricted = DATASET_CONFIG[name].restricted;
                  let langCode = name.split('.')[0];
                  if (name.split('.')[2] == "cstn") langCode = "bra";
                  const flag = LANG_FLAGS[langCode] ? `${LANG_FLAGS[langCode]} ` : '';
                  return <option key={`compare-${name}`} value={name}>{flag}{name} {DATASET_CONFIG[name].hasSignals ? '⚡' : ''} {isRestricted && !isAuthenticated ? '🔒' : ''}</option>;
                })}
              </select>
              {compareDataset && compareDataset !== 'none' && (
                <div className="absolute top-full left-0 mt-2.5 z-10">
                  <a href={`https://github.com/disrpt/latest/tree/main/data/${compareDataset}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium transition-colors whitespace-nowrap">
                    <ExternalLink className="w-3 h-3" /> Documentation
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto min-w-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
            <label className="text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 pl-1.5">Breakdown by:</label>
            <select
              value={compareBreakdownBy}
              onChange={e => {
                // Ensure we don't clobber the primary breakdown tab, tie this safely to compareBreakdownBy
                setCompareBreakdownBy(e.target.value);
              }}
              disabled={!compareDataset || compareDataset === 'none'}
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-3 outline-none cursor-pointer flex-1 min-w-0 disabled:bg-slate-100 disabled:text-slate-400"
            >
              {Array.from(new Set(sharedBreakdownOptions.map(o => o.group))).map(groupName => (
                <optgroup key={`comp-grp-${groupName}`} label={groupName}>
                  {sharedBreakdownOptions.filter(o => o.group === groupName).map(opt => (
                    <option key={`comp-breakdown-${opt.value}`} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {compareBreakdownBy.startsWith('token_') && (
              <select
                value={compareBreakdownTokenLayer}
                onChange={e => setCompareBreakdownTokenLayer(e.target.value)}
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-3 outline-none cursor-pointer w-24"
              >
                <option value="w">Word</option><option value="l">Lemma</option><option value="p">POS</option><option value="d">Deprel</option>
              </select>
            )}
          </div>
        </div>
      </div>
    );

    if (!compareDataset || compareDataset === 'none') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {controls}
          <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center gap-3">
             <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center"><GitCompare className="w-6 h-6" /></div>
             <p className="text-lg font-medium text-slate-700">Ready to Compare</p>
             <p>Select a second dataset from the dropdown above to begin comparison.</p>
          </div>
        </div>
      );
    }

    if (isCompareLoading) return <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">{controls}<div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50 flex flex-col items-center gap-3"><Loader2 className="w-8 h-8 animate-spin text-orange-500" /><p>Loading {compareDataset}...</p></div></div>;
    
    if (compareError === 'AUTH_REQUIRED') {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {controls}
          <div className="flex flex-col items-center justify-center gap-3 p-12 text-center max-w-md mx-auto border border-slate-100 rounded-xl bg-slate-50/50">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2"><Lock className="w-8 h-8 text-slate-400" /></div>
            <p className="text-xl font-bold text-slate-800">Restricted Dataset</p>
            <p className="text-slate-500 mb-2">This dataset requires a license. Please authenticate to view comparisons.</p>
            <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm transition-colors"><Key className="w-4 h-4" /> Enter Password</button>
          </div>
        </div>
      );
    }

    if (isNumericCompare) {
      if (!hasNumericCompareData) {
        return (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            {controls}
            <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">
              <p className="text-lg font-medium text-slate-700">No matching data found in either dataset.</p>
              <p className="mt-1">Try adjusting your search or filters.</p>
            </div>
          </div>
        );
      }

      const s1 = compareFreqDataPrimary.stats;
      const s2 = compareFreqData.stats;
      const canUseLogScale = isCountScaleFacet(compareBreakdownBy);
      const useLogScale = canUseLogScale && logScaleBoxPlots;
      const globalMin = Math.min(s1.trueMin, s2.trueMin);
      const globalMax = Math.max(s1.trueMax, s2.trueMax);
      const metricRows = [
        { name: 'Count', ds1: s1.count.toLocaleString(), ds2: s2.count.toLocaleString() },
        { name: 'Mean', ds1: s1.mean.toFixed(2), ds2: s2.mean.toFixed(2) },
        { name: 'Min', ds1: s1.trueMin.toFixed(2), ds2: s2.trueMin.toFixed(2) },
        { name: 'Q1', ds1: s1.q1.toFixed(2), ds2: s2.q1.toFixed(2) },
        { name: 'Median', ds1: s1.median.toFixed(2), ds2: s2.median.toFixed(2) },
        { name: 'Q3', ds1: s1.q3.toFixed(2), ds2: s2.q3.toFixed(2) },
        { name: 'Max', ds1: s1.trueMax.toFixed(2), ds2: s2.trueMax.toFixed(2) },
      ];
      const numericLabel = breakdownOptions.find(o => o.value === compareBreakdownBy)?.label || 'Numeric variable';

      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          {controls}

          <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 text-sm text-slate-600">
            Side-by-side distribution for <span className="font-semibold text-slate-800">{numericLabel}</span> across the filtered relations in both datasets.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[320px]">
              <h3 className="font-bold text-slate-800 mb-6 text-center w-full">Box Plot Comparison</h3>
              {canUseLogScale && (
                <label className="mb-4 flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
                  <input type="checkbox" checked={logScaleBoxPlots} onChange={(e) => setLogScaleBoxPlots(e.target.checked)} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  Log-scale y-axis (log1p)
                </label>
              )}
              <div className="flex justify-center items-start gap-6 pb-4 min-w-max px-8">
                <div className="relative pt-[10px] pb-[10px]">
                  <div className="flex flex-col justify-between items-end pr-2 border-r border-slate-300 text-xs font-mono text-slate-500" style={{ height: '230px' }}>
                    <span className="leading-none transform translate-y-[-50%]">{formatNumericAxis(globalMax, compareBreakdownBy)}</span>
                    <span className="leading-none transform translate-y-[50%]">{formatNumericAxis(globalMin, compareBreakdownBy)}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center w-24">
                  <BoxPlotSVG stats={s1} globalMin={globalMin} globalMax={globalMax} color="#3b82f6" valueKey={compareBreakdownBy} width={80} height={250} logScale={useLogScale} />
                  <span className="mt-2 text-xs font-semibold text-blue-700 text-center truncate w-full" title={dataset}>{dataset}</span>
                  <span className="text-[10px] text-slate-500 font-mono">n={s1.count}</span>
                </div>

                <div className="flex flex-col items-center w-24">
                  <BoxPlotSVG stats={s2} globalMin={globalMin} globalMax={globalMax} color="#fb923c" valueKey={compareBreakdownBy} width={80} height={250} logScale={useLogScale} />
                  <span className="mt-2 text-xs font-semibold text-orange-700 text-center truncate w-full" title={compareDataset}>{compareDataset}</span>
                  <span className="text-[10px] text-slate-500 font-mono">n={s2.count}</span>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto self-start shadow-sm">
              <table className="w-full text-left border-collapse min-w-[480px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold select-none">
                    <th className="p-3">Metric</th>
                    <th className="p-3 border-l border-slate-200 text-right text-blue-700 bg-blue-50/50 normal-case text-sm">{dataset}</th>
                    <th className="p-3 border-l border-slate-200 text-right text-orange-700 bg-orange-50/50 normal-case text-sm">{compareDataset}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {metricRows.map((row) => (
                    <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-medium text-slate-900">{row.name}</td>
                      <td className="p-3 text-right font-mono text-slate-700 border-l border-slate-100">{row.ds1}</td>
                      <td className="p-3 text-right font-mono text-slate-700 border-l border-slate-100 bg-orange-50/30">{row.ds2}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (combinedCompareData.length === 0) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          {controls}
          <div className="p-12 text-center text-slate-500 border border-slate-100 rounded-xl bg-slate-50/50">
            <p className="text-lg font-medium text-slate-700">No matching data found in either dataset.</p>
            <p className="mt-1">Try adjusting your search or filters.</p>
          </div>
        </div>
      );
    }

    // Process Truncation for Compare Tab
    const TOP_N = 20;
    const isTokenBreakdown = compareBreakdownBy.startsWith('token_');
    const limit = isTokenBreakdown ? TOP_N : combinedCompareData.length;
    
    const uiData = combinedCompareData.slice(0, limit);
    const hasMore = combinedCompareData.length > limit;

    const maxPlotValue = uiData.length > 0 ? Math.max(...uiData.map(d => compareMode === 'percentage' ? Math.max(d.ds1Pct, d.ds2Pct) : Math.max(d.ds1Count, d.ds2Count))) : 1;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        {controls}

        {hasMore && (
           <div className="px-4 py-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-sm text-center">
             Showing the <b>top {TOP_N}</b> of {combinedCompareData.length} aligned values. <br className="sm:hidden"/>Use the <b>Download</b> button above to export the full comparison dataset.
           </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="border border-slate-100 rounded-xl p-6 bg-slate-50/50 flex flex-col self-start shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-500 rounded"></div> {dataset}</div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-400 rounded"></div> {compareDataset}</div>
              </div>
              <div className="flex bg-slate-200 p-1 rounded-lg">
                <button onClick={() => setCompareMode('percentage')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${compareMode === 'percentage' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>percentage</button>
                <button onClick={() => setCompareMode('count')} className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${compareMode === 'count' ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-700'}`}>counts</button>
              </div>
            </div>

            <div className="space-y-4">
              {uiData.map((item, idx) => {
                const val1 = compareMode === 'percentage' ? item.ds1Pct : item.ds1Count;
                const val2 = compareMode === 'percentage' ? item.ds2Pct : item.ds2Count;
                const label1 = compareMode === 'percentage' ? `${val1.toFixed(1)}%` : val1.toLocaleString();
                const label2 = compareMode === 'percentage' ? `${val2.toFixed(1)}%` : val2.toLocaleString();

                return (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-1/3 text-right text-sm font-medium text-slate-700 truncate" title={item.name}>{item.name}</div>
                    <div className="w-2/3 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-200 rounded overflow-hidden">
                          <div className="h-full bg-blue-500 rounded transition-all duration-500" style={{ width: `${(val1 / maxPlotValue) * 100}%`, minWidth: val1 > 0 ? '4px' : '0' }}></div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 w-10 text-right">{label1}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-200 rounded overflow-hidden">
                          <div className="h-full bg-orange-400 rounded transition-all duration-500" style={{ width: `${(val2 / maxPlotValue) * 100}%`, minWidth: val2 > 0 ? '4px' : '0' }}></div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 w-10 text-right">{label2}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-x-auto self-start shadow-sm">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold select-none">
                  <th className="p-3 cursor-pointer group hover:bg-slate-100 transition-colors" onClick={() => handleCompareSort('name')} rowSpan={2}>
                    <div className="flex items-center justify-between">Name <span className="text-slate-400 group-hover:text-slate-700">{compareSortConfig.key === 'name' ? (compareSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span></div>
                  </th>
                  <th className="p-3 border-l border-slate-200 text-center text-blue-700 bg-blue-50/50 normal-case text-sm" colSpan={2}>{dataset}</th>
                  <th className="p-3 border-l border-slate-200 text-center text-orange-700 bg-orange-50/50 normal-case text-sm" colSpan={2}>{compareDataset}</th>
                </tr>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs tracking-wider text-slate-500 font-semibold select-none">
                  <th className="p-3 cursor-pointer group hover:bg-slate-100 transition-colors border-l border-slate-200" onClick={() => handleCompareSort('ds1Count')}>
                     <div className="flex items-center justify-center gap-1">Count {compareSortConfig.key === 'ds1Count' ? (compareSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</div>
                  </th>
                  <th className="p-3 cursor-pointer group hover:bg-slate-100 transition-colors border-l border-slate-200" onClick={() => handleCompareSort('ds1Pct')}>
                     <div className="flex items-center justify-center gap-1">% {compareSortConfig.key === 'ds1Pct' ? (compareSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</div>
                  </th>
                  <th className="p-3 cursor-pointer group hover:bg-slate-100 transition-colors border-l border-slate-200" onClick={() => handleCompareSort('ds2Count')}>
                     <div className="flex items-center justify-center gap-1">Count {compareSortConfig.key === 'ds2Count' ? (compareSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</div>
                  </th>
                  <th className="p-3 cursor-pointer group hover:bg-slate-100 transition-colors border-l border-slate-200" onClick={() => handleCompareSort('ds2Pct')}>
                     <div className="flex items-center justify-center gap-1">% {compareSortConfig.key === 'ds2Pct' ? (compareSortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {uiData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-medium text-slate-900">{item.name}</td>
                    <td className="p-3 font-mono text-slate-600 border-l border-slate-100 text-right">{item.ds1Count.toLocaleString()}</td>
                    <td className="p-3 text-slate-500 border-l border-slate-100 text-right">{item.ds1Pct.toFixed(1)}%</td>
                    <td className="p-3 font-mono text-slate-600 border-l border-slate-100 text-right bg-orange-50/30">{item.ds2Count.toLocaleString()}</td>
                    <td className="p-3 text-slate-500 border-l border-slate-100 text-right bg-orange-50/30">{item.ds2Pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-semibold text-slate-700 text-sm">
                <tr>
                  <td className="p-3 text-right">Filtered Total</td>
                  <td className="p-3 border-l border-slate-200 font-mono text-right text-blue-700 bg-blue-50/50">{compareFreqDataPrimary.grandTotal.toLocaleString()}</td>
                  <td className="p-3 border-l border-slate-200 text-right text-blue-700 bg-blue-50/50">100%</td>
                  <td className="p-3 border-l border-slate-200 font-mono text-right text-orange-700 bg-orange-50/50">{compareFreqData.grandTotal.toLocaleString()}</td>
                  <td className="p-3 border-l border-slate-200 text-right text-orange-700 bg-orange-50/50">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-8">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');`}
      </style>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {!logoError && logoUrl ? (
                <img src={logoUrl} alt="DiscoExplorer logo" className="w-14 h-14" onError={() => setLogoError(true)} />
              ) : (
                <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                  <Database className="w-8 h-8" />
                </div>
              )}
              <div className="flex flex-col leading-none">
                <span className="text-blue-400">Disco</span>
                <span className="text-orange-400">Explorer</span>
              </div>
            </h1>
            <p className="text-slate-500 mt-1">Search engine for discourse relations, powered by <a href="https://github.com/disrpt/" className="text-blue-500 hover:underline">DISRPT</a></p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => isAuthenticated ? handleLogout() : setIsAuthModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 border text-sm font-medium rounded-lg transition-colors shadow-sm ${isAuthenticated ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}
            >
              {isAuthenticated ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              {isAuthenticated ? 'Authenticated' : 'Login'}
            </button>            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Share2 className="w-4 h-4 text-blue-600" />
              Share Query
            </button>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <div className="flex items-center gap-2">
                <label htmlFor="dataset-select" className="text-sm font-semibold text-slate-600 flex items-center gap-1.5">
                  Dataset:
                </label>
                <div className="relative">
                  <select 
                    id="dataset-select"
                    value={dataset}
                    onChange={(e) => setDataset(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block py-1.5 px-3 outline-none shadow-sm cursor-pointer"
                  >
                    {Object.keys(DATASET_CONFIG).map(name => {
                      const isRestricted = DATASET_CONFIG[name].restricted;
                      const corpName = name.split('.')[2];
                      let langCode = name.split('.')[0];
                      if (corpName == "cstn"){langCode = "bra";}
                      const flag = LANG_FLAGS[langCode] ? `${LANG_FLAGS[langCode]} ` : '';
                      return (
                        <option key={name} value={name}>
                          {flag}{name} {DATASET_CONFIG[name].hasSignals ? '⚡' : ''} {isRestricted && !isAuthenticated ? '🔒' : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute top-full left-0 mt-1 z-10">
                    <a href={`https://github.com/disrpt/latest/tree/main/data/${dataset}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium transition-colors whitespace-nowrap">
                      <ExternalLink className="w-3 h-3" /> Documentation
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm font-medium bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 hidden sm:flex flex-col items-center justify-center leading-tight">
              {isLoading ? (
                <span>Loading...</span>
              ) : error === 'AUTH_REQUIRED' ? (
                <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> Restricted</span>
              ) : error ? (
                <span>Error</span>
              ) : (
                <>
                  <span>{filteredData.length.toLocaleString()} relations found</span>
                  {data.relations.length > 0 && (
                    <span className="text-[11px] font-normal opacity-75 mt-0.5">
                      ({Number(((filteredData.length / data.relations.length) * 100).toFixed(1))}% of {data.relations.length.toLocaleString()} total)
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search and Filters Card */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search e.g., 'although ||', 'if -||> then', or '|| if|advcl'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className="mt-2 text-xs text-slate-500 ml-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-500" />
                <span>Advanced syntax: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">word|lemma|POS|deprel</code>. Use <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">||</code> to target <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">arg1 || arg2</code>. Use <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">-||&gt;</code> for <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">source -||&gt; target</code>.</span>
                <button
                  onClick={() => setShowSyntaxHelp(!showSyntaxHelp)}
                  className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-0.5 transition-colors ml-1 focus:outline-none"
                >
                  {showSyntaxHelp ? "Hide Examples" : "View Examples"}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSyntaxHelp ? "rotate-180" : ""}`} />
                </button>
              </div>
              
              {showSyntaxHelp && (
                <div className="mt-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl text-slate-700 space-y-3 w-full shadow-sm text-sm">
                  <p className="font-semibold text-slate-800">Example Queries:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">although ||</code> Matches relations where "although" is in Argument 1 in text order.</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">|| if |advcl</code> Matches relations where the word "if" is followed by a token with dependency relation "advcl" in Argument 2 in text order.</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">if -||&gt; then</code> Matches relations where "if" is in the source argument and "then" is in the target argument.</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">&lt;||- |that|SCONJ</code> Matches the lemma "that" with POS tag "SCONJ" in the source argument of the relation.</li>
                    <li><code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">meta::genre="news"</code> Filters relations to documents where the metadata "genre" is "news" (if available)</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-3 ml-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="exactSequence"
                checked={exactSequence}
                onChange={(e) => setExactSequence(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="exactSequence" className="text-sm font-medium text-slate-700 cursor-pointer select-none mr-4">
                Exact sequence
              </label>

              <input
                type="checkbox"
                id="caseInsensitive"
                checked={caseInsensitive}
                onChange={(e) => setCaseInsensitive(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="caseInsensitive" className="text-sm font-medium text-slate-700 cursor-pointer select-none mr-4">
                Ignore case
              </label>

              <input
                type="checkbox"
                id="randomizeResults"
                checked={randomizeResults}
                onChange={(e) => setRandomizeResults(e.target.checked)}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
              <label htmlFor="randomizeResults" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                Random order
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4" /> DISRPT Label
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="notDisrptLabel"
                    checked={notDisrptLabel}
                    onChange={(e) => setNotDisrptLabel(e.target.checked)}
                    disabled={disrptLabelFilter === 'ALL'}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="notDisrptLabel" className={`text-xs font-medium cursor-pointer select-none ${disrptLabelFilter === 'ALL' ? 'text-slate-400' : 'text-slate-600'}`}>Not</label>
                </div>
              </div>
              <select
                value={disrptLabelFilter}
                onChange={(e) => setDisrptLabelFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Labels</option>
                {dynamicDisrptLabels.map(label => (
                  <option key={`disrpt-${label}`} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <Filter className="w-4 h-4" /> Original Label
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="notOrigLabel"
                    checked={notOrigLabel}
                    onChange={(e) => setNotOrigLabel(e.target.checked)}
                    disabled={origLabelFilter === 'ALL'}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="notOrigLabel" className={`text-xs font-medium cursor-pointer select-none ${origLabelFilter === 'ALL' ? 'text-slate-400' : 'text-slate-600'}`}>Not</label>
                </div>
              </div>
              <select
                value={origLabelFilter}
                onChange={(e) => setOrigLabelFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Labels</option>
                {dynamicOrigLabels.map(label => (
                  <option key={`orig-${label}`} value={label}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>⇄</span> Direction
                </label>
              </div>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Directions</option>
                {dynamicDirections.map(dir => (
                  <option key={dir} value={dir}>{dir}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>⚡</span> Signal Type
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="notSignalType"
                    checked={notSignalType}
                    onChange={(e) => setNotSignalType(e.target.checked)}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer"
                  />
                  <label htmlFor="notSignalType" className="text-xs font-medium cursor-pointer select-none text-slate-600">Not</label>
                </div>
              </div>
              <select
                value={signalType}
                onChange={(e) => setSignalType(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                {dynamicSignalTypes.map(st => (
                  <option key={st} value={st}>{getSignalDisplayName(st)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>⚡</span> Signal Subtype
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    id="notSignalSubtype"
                    checked={notSignalSubtype}
                    onChange={(e) => setNotSignalSubtype(e.target.checked)}
                    disabled={signalSubtype === 'ALL' || notSignalType}
                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="notSignalSubtype" className={`text-xs font-medium cursor-pointer select-none ${signalSubtype === 'ALL' || notSignalType ? 'text-slate-400' : 'text-slate-600'}`}>Not</label>
                </div>
              </div>
              <select
                value={signalSubtype}
                onChange={(e) => setSignalSubtype(e.target.value)}
                disabled={signalType === 'ALL' || notSignalType}
                className={`w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${signalType === 'ALL' || notSignalType ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-50 cursor-pointer'}`}
              >
                <option value="ALL">{signalType === 'ALL' ? 'Select a Type first' : notSignalType ? 'Disabled (Type Negated)' : 'All Subtypes'}</option>
                {dynamicSignalSubtypes.map(sub => (
                  <option key={sub} value={sub}>{getSignalDisplayName(sub)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('results')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'results' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <List className="w-4 h-4" /> Results
          </button>
          <button
            onClick={() => setActiveTab('frequencies')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'frequencies' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <BarChart2 className="w-4 h-4" /> Frequencies
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'compare' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}
          >
            <GitCompare className="w-4 h-4" /> Compare
          </button>
        </div>

        {/* View Areas */}
        {activeTab === 'results' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-wrap items-center gap-6 bg-slate-50">
              <span className="text-sm font-semibold text-slate-700">Show Label:</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" name="labelMode" value="disrpt" checked={labelDisplayMode === 'disrpt'} onChange={() => setLabelDisplayMode('disrpt')} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  DISRPT
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" name="labelMode" value="orig" checked={labelDisplayMode === 'orig'} onChange={() => setLabelDisplayMode('orig')} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  Original
                </label>
                <label className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" name="labelMode" value="both" checked={labelDisplayMode === 'both'} onChange={() => setLabelDisplayMode('both')} className="w-4 h-4 accent-blue-600 cursor-pointer" />
                  Both
                </label>
              </div>

              {datasetHasTokenSignals && (
                <div className="flex items-center gap-4 border-l border-slate-300 pl-6 ml-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={showAllSignals} 
                      onChange={(e) => setShowAllSignals(e.target.checked)} 
                      className="w-4 h-4 accent-blue-600 cursor-pointer" 
                    />
                    Show all signals
                  </label>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1000px] whitespace-normal">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-4 w-[4%] text-center hidden md:table-cell">#</th>
                    <th className="p-4 w-[8%] hidden md:table-cell">Doc ID</th>
                    <th className="p-4 w-[10%]">Pre-Context</th>
                    <th className="p-4 w-[20%] text-slate-800">Argument 1</th>
                    <th className="p-4 w-[10%]">Inter-Context</th>
                    <th className="p-4 w-[20%] text-slate-800">Argument 2</th>
                    <th className="p-4 w-[10%]">Post-Context</th>
                    <th className="p-4 w-[10%]">Label(s)</th>
                    <th className="p-4 w-[8%] text-center">Dir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <p>Loading {dataset} dataset...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error === 'AUTH_REQUIRED' ? (
                    <tr>
                      <td colSpan="9" className="p-12">
                        <div className="flex flex-col items-center justify-center gap-3 text-center max-w-md mx-auto">
                          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                            <Lock className="w-8 h-8 text-slate-400" />
                          </div>
                          <p className="text-xl font-bold text-slate-800">Restricted Dataset</p>
                          <p className="text-slate-500 mb-2">This dataset requires a license to access. Please authenticate to view its contents.</p>
                          <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm transition-colors">
                            <Key className="w-4 h-4" /> Enter Password
                          </button>
                        </div>
                      </td>
                    </tr>                    
                  ) : error ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center text-red-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <AlertCircle className="w-8 h-8 text-red-500" />
                          <p className="text-lg font-medium">Error loading dataset</p>
                          <p className="mt-1 text-sm text-red-400">{error}</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="p-12 text-center text-slate-500">
                        <p className="text-lg font-medium text-slate-700">No results found</p>
                        <p className="mt-1">Try adjusting your search or filters.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedData.map((row, index) => {
                      const dLabel = getDisrptLabel(row.label);
                      const oLabel = getOrigLabel(row.label);
                      const allSignalMap = buildSignalMap(row.signals);

                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="p-4 text-slate-400 font-mono text-xs text-center hidden md:table-cell">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="p-4 text-slate-500 font-mono text-xs hidden md:table-cell">
                            <div className="max-w-[150px] truncate" title={row.docname}>
                              {row.docname}
                            </div>
                          </td>
                          <td className="p-4 text-slate-400 italic leading-relaxed">
                            {renderSpan(row.pre_tokens, null, row.matchingSignalIndices, allSignalMap, showAllSignals, true)}
                          </td>
                          <td className="p-4 text-slate-900 font-medium leading-relaxed">
                            {renderSpan(row.arg1_tokens, row.arg1Matches, row.matchingSignalIndices, allSignalMap, showAllSignals, false)}
                          </td>
                          <td className="p-4 text-slate-400 italic leading-relaxed">
                            {renderSpan(row.inter_tokens, null, row.matchingSignalIndices, allSignalMap, showAllSignals, true)}
                          </td>
                          <td className="p-4 text-slate-900 font-medium leading-relaxed">
                            {renderSpan(row.arg2_tokens, row.arg2Matches, row.matchingSignalIndices, allSignalMap, showAllSignals, false)}
                          </td>
                          <td className="p-4 text-slate-400 italic leading-relaxed">
                            {renderSpan(row.post_tokens, null, row.matchingSignalIndices, allSignalMap, showAllSignals, true)}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1.5 items-start">
                              {(labelDisplayMode === 'disrpt' || labelDisplayMode === 'both') && (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md border" style={getLabelStyle(dLabel)}>
                                  {dLabel}
                                </span>
                              )}
                              {(labelDisplayMode === 'orig' || labelDisplayMode === 'both') && oLabel !== 'Unknown' && (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-md border border-slate-300" style={getLabelStyle(`orig_${oLabel}`)}>
                                  {oLabel}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-mono text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              {row.direction}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isLoading && !error && sortedData.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage + 1).toLocaleString()}</span> to <span className="font-medium text-slate-900">{(Math.min(currentPage * itemsPerPage, filteredData.length)).toLocaleString()}</span> of <span className="font-medium text-slate-900">{filteredData.length.toLocaleString()}</span> results
                </span>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-slate-500 hidden sm:block">Per page:</label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none shadow-sm cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'frequencies' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            {error === 'AUTH_REQUIRED' ? (
              <div className="flex flex-col items-center justify-center gap-3 p-12 text-center max-w-md mx-auto">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xl font-bold text-slate-800">Restricted Dataset</p>
                <p className="text-slate-500 mb-2">This dataset requires a license. Please authenticate to view frequency distributions.</p>
                <button onClick={() => setIsAuthModalOpen(true)} className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 shadow-sm transition-colors">
                  <Key className="w-4 h-4" /> Enter Password
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-bold text-slate-800 truncate">Frequencies</h2>
                    <p className="text-sm text-slate-500 truncate">Statistics for query matches</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <button 
                      onClick={handleExportTSV}
                      className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto min-w-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 pl-1.5">Breakdown by:</label>
                      <select
                        value={breakdownBy}
                        onChange={e => setBreakdownBy(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer flex-1 min-w-0"
                      >
                        {Array.from(new Set(breakdownOptions.map(o => o.group))).map(groupName => (
                           <optgroup key={`grp-${groupName}`} label={groupName}>
                             {breakdownOptions.filter(o => o.group === groupName).map(opt => (
                               <option key={`breakdown-${opt.value}`} value={opt.value}>{opt.label}</option>
                             ))}
                           </optgroup>
                        ))}
                      </select>
                      {breakdownBy.startsWith('token_') && (
                        <select
                          value={breakdownTokenLayer}
                          onChange={e => setBreakdownTokenLayer(e.target.value)}
                          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer w-24"
                        >
                          <option value="w">Word</option><option value="l">Lemma</option><option value="p">POS</option><option value="d">Deprel</option>
                        </select>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto min-w-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 pl-1.5">Cross-tab:</label>
                      <select
                        value={crossTabBy}
                        onChange={e => setCrossTabBy(e.target.value)}
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer flex-1 min-w-0"
                      >
                        <option value="none">None (1D)</option>
                        {Array.from(new Set(breakdownOptions.map(o => o.group))).map(groupName => (
                           <optgroup key={`crosstab-grp-${groupName}`} label={groupName}>
                             {breakdownOptions.filter(o => o.group === groupName).map(opt => (
                               <option key={`crosstab-${opt.value}`} value={opt.value} disabled={opt.value === breakdownBy}>{opt.label}</option>
                             ))}
                           </optgroup>
                        ))}
                      </select>
                      {crossTabBy.startsWith('token_') && (
                        <select
                          value={crossTabTokenLayer}
                          onChange={e => setCrossTabTokenLayer(e.target.value)}
                          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer w-24"
                        >
                          <option value="w">Word</option><option value="l">Lemma</option><option value="p">POS</option><option value="d">Deprel</option>
                        </select>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto min-w-0 bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-sm font-semibold text-slate-700 whitespace-nowrap shrink-0 pl-1.5" title="Minimum count threshold">Min freq:</label>
                      <input
                        type="number"
                        min="1"
                        value={frequencyCutoff}
                        onChange={(e) => setFrequencyCutoff(Math.max(1, parseInt(e.target.value) || 1))}
                        className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer w-20 text-center"
                      />
                    </div>
                  </div>
                </div>

                {renderFrequencies1D()}
                {renderFrequencies2D()}
                {renderNumeric1D()}
                {renderNumCat()}
                {renderScatter()}
              </>
            )}
          </div>
        )}

        {/* Compare Tab View Area */}
        {activeTab === 'compare' && renderCompareTab()}

      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Share Query</h3>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600">Copy the link below to share this exact search and filter configuration.</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={(e) => e.target.select()}
                />
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col transform transition-all">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-600" /> Unlock Datasets
              </h3>
              <button onClick={() => { setIsAuthModalOpen(false); setAuthErrorMsg(''); setAuthPassword(''); }} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Master Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter password..."
                  autoFocus
                />
                {authErrorMsg && <p className="text-xs text-red-500 mt-2 font-medium">{authErrorMsg}</p>}
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}