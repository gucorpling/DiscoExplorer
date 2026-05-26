import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'   // ← add this import
import { viteSingleFile } from 'vite-plugin-singlefile';
import fs from 'fs';
import path from 'path';

const FETCH_SHIM = `<script>
(function () {
  var _cache  = (window.__localJsonCache = window.__localJsonCache || {});
  var _pending = {};
  var _orig   = window.fetch.bind(window);

  function _isJson(url) {
    var clean = url.indexOf('?') !== -1 ? url.slice(0, url.indexOf('?')) : url;
    clean = clean.indexOf('#') !== -1 ? clean.slice(0, clean.indexOf('#')) : clean;
    return clean.length >= 5 && clean.slice(-5) === '.json';
  }

  function _toKey(url) {
    var s = url.indexOf('?') !== -1 ? url.slice(0, url.indexOf('?')) : url;
    s = s.indexOf('#') !== -1 ? s.slice(0, s.indexOf('#')) : s;
    // Strip protocol + host  (e.g. https://example.com/data/x.json → data/x.json)
    var d = s.indexOf('//');
    if (d !== -1) {
      var rest = s.indexOf('/', d + 2);
      s = rest !== -1 ? s.slice(rest) : '/';
    }
    // Strip leading slashes
    while (s.length > 0 && s[0] === '/') s = s.slice(1);
    // Strip leading ./
    if (s.length > 2 && s[0] === '.' && s[1] === '/') s = s.slice(2);
    return s;
  }

  function _toJsUrl(key) {
    // key: "data/foo.json"  →  "./data/foo.js"
    return './' + key.slice(0, key.length - 5) + '.js';
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string'          ? input
            : input && typeof input.url === 'string' ? input.url
            : String(input);

    if (!_isJson(url)) return _orig(input, init);

    var key = _toKey(url);

    if (Object.prototype.hasOwnProperty.call(_cache, key)) {
      return Promise.resolve(new Response(JSON.stringify(_cache[key]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }

    var jsUrl = _toJsUrl(key);
    if (!_pending[jsUrl]) {
      _pending[jsUrl] = new Promise(function (resolve, reject) {
        var el = document.createElement('script');
        el.src = jsUrl;
        el.onload = resolve;
        el.onerror = function () { reject(new Error('[local-fetch] failed: ' + jsUrl)); };
        document.head.appendChild(el);
      });
    }

    return _pending[jsUrl].then(function () {
      if (!Object.prototype.hasOwnProperty.call(_cache, key)) {
        console.error('[local-fetch] key not found after load:', key, '- check json-to-js conversion');
        return new Response('null', { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify(_cache[key]), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    });
  };
})();
</script>`;

// ─── Plugin 1: inject shim as the very first child of <head> ─────────────────
// Uses index arithmetic, not regex replacement, to avoid $1/$2 substitution bugs.
// enforce:'pre' + order:'pre' ensures this runs before viteSingleFile touches the HTML.
function injectFetchShimPlugin() {
  return {
    name: 'inject-fetch-shim',
    enforce: 'pre',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const open = html.search(/<head(\s[^>]*)?\s*>/i);
        if (open === -1) return html;                       // no <head>? bail
        const tagClose = html.indexOf('>', open) + 1;      // end of <head ...>
        return html.slice(0, tagClose) + '\n' + FETCH_SHIM + html.slice(tagClose);
      }
    }
  };
}

// ─── Plugin 2: post-build JSON → self-registering JS ─────────────────────────
// This packages data/*.json files into locally importable js scripts to bypass CORS issues
function jsonToJsPlugin({ sourceDir, destSubDir, outDir }) {
  // sourceDir:  where .json files live e.g. 'data'
  // destSubDir: folder name inside dist_local/ e.g. 'data'
  // outDir:     build output root, e.g. 'dist_local'
  return {
    name: 'json-to-self-registering-js',
    apply: 'build',
    closeBundle() {
      if (!fs.existsSync(sourceDir)) {
        console.warn('[json-to-js] sourceDir not found:', sourceDir);
        return;
      }

      function walk(srcDir, relDir) {
        for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
          const srcFull = path.join(srcDir, entry.name);
          const relPath = relDir ? relDir + '/' + entry.name : entry.name;

          if (entry.isDirectory()) {
            walk(srcFull, relPath);
          } else if (entry.name.endsWith('.json')) {
            // Cache key must match what _toKey() produces from the fetch URL.
            // If the app does fetch('/data/foo.json'), the key is 'data/foo.json'.
            const key      = destSubDir + '/' + relPath;   // e.g. "data/subdir/foo.json"
            const destPath = path.join(outDir, destSubDir, relPath);

            fs.mkdirSync(path.dirname(destPath), { recursive: true });

            const raw = fs.readFileSync(srcFull, 'utf-8');
            const js  = '(window.__localJsonCache=window.__localJsonCache||{})'
                      + '[' + JSON.stringify(key) + ']=' + raw + ';\n';

            fs.writeFileSync(destPath.replace(/\.json$/, '.js'), js, 'utf-8');
            console.log('[json-to-js] wrote', key.replace(/\.json$/, '.js'));
          }
        }
      }

      walk(sourceDir, '');
    }
  };
}

function fixInlineStyleTagsPlugin(outDir) {
  return {
    name: 'fix-inline-style-tags',
    apply: 'build',
    closeBundle() {
      const htmlPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(htmlPath)) return;

      let html = fs.readFileSync(htmlPath, 'utf-8');

      // vite-plugin-singlefile copies <link> attributes onto <style> tags,
      // including `crossorigin` and `rel="stylesheet"`, which are invalid on
      // <style> and cause browsers to silently refuse the styles on file://.
      // Strip them, preserving any legitimate attributes like media="...".
      html = html.replace(/<style\b([^>]*)>/g, (match, attrs) => {
        const cleaned = attrs
          .replace(/\s*\bcrossorigin\b/g, '')
          .replace(/\s*rel="[^"]*"/g, '')
          .trim();
        return cleaned ? `<style ${cleaned}>` : '<style>';
      });

      fs.writeFileSync(htmlPath, html, 'utf-8');
      console.log('[fix-style-tags] stripped crossorigin/rel from <style> tags');
    }
  };
}

const OUT_DIR = 'dist_local';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    injectFetchShimPlugin(),
    viteSingleFile({ removeViteModuleLoader: true }),
    jsonToJsPlugin({
      sourceDir:  'data',   // actual JSON folder
      destSubDir: 'data',          // path used in fetch() calls
      outDir:     OUT_DIR,
    }),
    fixInlineStyleTagsPlugin(OUT_DIR),
  ],
  build: {
    outDir: OUT_DIR,
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    rollupOptions: {
      output: { inlineDynamicImports: true }
    }
  },
  base: '',
});