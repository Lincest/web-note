// format.js — High-performance JSON / XML / ION formatter + collapsible tree viewer
// • Paste auto-format: paste JSON / ION / XML → instantly pretty-printed
// • Preview (Cmd+E):   JSON / XML / ION → collapsible tree instead of markdown
// • Manual shortcut:   Mod+Shift+F (format current content)
// • Bottom-bar button: "{ } format"

(function () {

    // ─── Helpers ────────────────────────────────────────────────────────────

    function escHTML(s) {
        return String(s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }


    // ─── JSON formatter ─────────────────────────────────────────────────────

    function formatJSON(text) {
        return JSON.stringify(JSON.parse(text), null, 2);
    }


    // ─── XML formatter ──────────────────────────────────────────────────────

    function formatXML(raw) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(raw.trim(), 'application/xml');
        const err = doc.querySelector('parsererror');
        if (err) throw new Error(err.textContent.split('\n')[0].trim() || 'XML parse error');
        return serializeXML(doc);
    }

    function escAttr(s) {
        return escHTML(s).replace(/'/g, '&#39;');
    }

    function serializeXML(doc) {
        const lines = [];
        const stack = [];
        Array.from(doc.childNodes).reverse().forEach(c => stack.push({ node: c, indent: 0 }));
        while (stack.length) {
            const entry = stack.pop();
            const { node, indent } = entry;
            const pad = '  '.repeat(indent);
            if (entry.close) { lines.push(pad + '</' + entry.tag + '>'); continue; }
            if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
                lines.push(pad + '<?' + node.target + ' ' + node.data + '?>'); continue;
            }
            if (node.nodeType === Node.COMMENT_NODE) {
                lines.push(pad + '<!--' + node.textContent + '-->'); continue;
            }
            if (node.nodeType === Node.CDATA_SECTION_NODE) {
                lines.push(pad + '<![CDATA[' + node.data + ']]>'); continue;
            }
            if (node.nodeType === Node.TEXT_NODE) {
                const t = node.textContent.trim();
                if (t) lines.push(pad + escHTML(t));
                continue;
            }
            if (node.nodeType !== Node.ELEMENT_NODE) continue;
            let attrs = '';
            for (const a of node.attributes) attrs += ' ' + a.name + '="' + escAttr(a.value) + '"';
            const children = Array.from(node.childNodes);
            const hasEl = children.some(c => c.nodeType === Node.ELEMENT_NODE
                || c.nodeType === Node.CDATA_SECTION_NODE
                || c.nodeType === Node.COMMENT_NODE);
            const rawText = children.filter(c => c.nodeType === Node.TEXT_NODE)
                .map(c => c.textContent.trim()).filter(Boolean).join('');
            if (!children.length) {
                lines.push(pad + '<' + node.tagName + attrs + '/>');
            } else if (!hasEl && rawText) {
                lines.push(pad + '<' + node.tagName + attrs + '>' + escHTML(rawText) + '</' + node.tagName + '>');
            } else {
                lines.push(pad + '<' + node.tagName + attrs + '>');
                stack.push({ close: true, tag: node.tagName, indent });
                children.slice().reverse().forEach(c => stack.push({ node: c, indent: indent + 1 }));
            }
        }
        return lines.join('\n');
    }


    // ─── ION formatter ──────────────────────────────────────────────────────

    function formatION(raw) {
        try { return formatJSON(raw); } catch (_) {}
        return ionIndent(raw);
    }

    function ionIndent(src) {
        const INDENT = '  ', n = src.length;
        let i = 0, level = 0, tok = '';
        const out = [];
        function flush() { const s = tok.trim(); if (s) out.push(INDENT.repeat(level) + s); tok = ''; }
        function peek(d) { return i + d < n ? src[i + d] : ''; }
        while (i < n) {
            const c = src[i];
            if (c === '/' && peek(1) === '/') {
                let cm = ''; while (i < n && src[i] !== '\n') cm += src[i++];
                tok += (tok.trim() ? ' ' : '') + cm.trim(); flush(); continue;
            }
            if (c === '/' && peek(1) === '*') {
                i += 2; let cm = '/*';
                while (i < n && !(src[i] === '*' && src[i+1] === '/')) cm += src[i++];
                cm += '*/'; i += 2; tok += cm; continue;
            }
            if ((c === '"' || c === "'") && peek(1) === c && peek(2) === c) {
                const q3 = c+c+c; let s = q3; i += 3;
                while (i < n) {
                    if (src[i]===c&&src[i+1]===c&&src[i+2]===c){s+=q3;i+=3;break;}
                    if (src[i]==='\\'){s+=src[i]+(src[i+1]||'');i+=2;continue;}
                    s+=src[i++];
                }
                tok += s; continue;
            }
            if (c === '"' || c === "'") {
                let s = c; i++;
                while (i < n) {
                    const ch = src[i]; s += ch;
                    if (ch==='\\'){s+=src[++i]||'';i++;continue;}
                    if (ch===c){i++;break;}
                    i++;
                }
                tok += s; continue;
            }
            if (c==='{' && peek(1)==='{') {
                let s='{{'; i+=2;
                while (i<n&&!(src[i]==='}'&&src[i+1]==='}')) s+=src[i++];
                s+='}}'; i+=2; tok+=s; continue;
            }
            if (c==='{' || c==='[' || c==='(') { tok+=c; flush(); level++; i++; continue; }
            if (c==='}' || c===']' || c===')') { flush(); level=Math.max(0,level-1); tok=c; flush(); i++; continue; }
            if (c===',') { tok+=','; flush(); i++; continue; }
            if (c===' '||c==='\t'||c==='\r'||c==='\n') {
                if (tok.length && tok[tok.length-1]!==' ') tok+=' ';
                i++; continue;
            }
            tok += c; i++;
        }
        flush();
        return out.join('\n');
    }


    // ─── Core detect+format ─────────────────────────────────────────────────

    function tryFormat(text) {
        const t = text.trim();
        if (!t) return null;
        const first = t[0];
        if (first!=='{' && first!=='[' && first!=='(' && first!=='<') return null;
        try {
            if (first === '<')  return { formatted: formatXML(t),  type: 'XML' };
            if (first === '(')  return { formatted: formatION(t),  type: 'ION' };
            try { return { formatted: formatJSON(t), type: 'JSON' }; }
            catch (_) { return { formatted: formatION(t), type: 'ION' }; }
        } catch (_) { return null; }
    }


    // ════════════════════════════════════════════════════════════════════════
    // ─── Collapsible tree renderer ──────────────────────────────────────────
    // ════════════════════════════════════════════════════════════════════════

    // Called by renderMarkdown() in markdown.js.
    // Returns an HTML string if content is recognised as JSON/XML/ION, else null.

    function toolbar(type) {
        return '<div class="sv-toolbar">'
            + '<span class="sv-type">' + type + '</span>'
            + '<button class="sv-btn" onclick="window._svExpandAll()">展开全部</button>'
            + '<button class="sv-btn" onclick="window._svCollapseAll()">折叠全部</button>'
            + '</div>';
    }

    function renderStructured(text) {
        const t = text.trim();
        if (!t) return null;
        const first = t[0];

        // JSON (or Ion that is valid JSON)
        if (first === '{' || first === '[') {
            try {
                const parsed = JSON.parse(t);
                return toolbar('JSON') + '<div class="sv sv-json">' + buildJSONNode(parsed, 0) + '</div>';
            } catch (_) {}
            try {
                const fmt = formatION(t);
                return toolbar('ION') + '<div class="sv sv-ion"><pre class="sv-code">' + escHTML(fmt) + '</pre></div>';
            } catch (_) {}
        }

        // XML
        if (first === '<') {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(t, 'application/xml');
                if (!doc.querySelector('parsererror')) {
                    return toolbar('XML') + '<div class="sv sv-xml">' + buildXMLDoc(doc) + '</div>';
                }
            } catch (_) {}
        }

        // Ion s-expression
        if (first === '(') {
            const fmt = ionIndent(t);
            return toolbar('ION') + '<div class="sv sv-ion"><pre class="sv-code">' + escHTML(fmt) + '</pre></div>';
        }

        return null;
    }

    // Expand / collapse all <details> in the viewer
    window._svExpandAll   = function () {
        document.querySelectorAll('#markdown-content details').forEach(function (d) { d.open = true; });
    };
    window._svCollapseAll = function () {
        document.querySelectorAll('#markdown-content details').forEach(function (d) { d.open = false; });
    };

    // ── JSON tree ────────────────────────────────────────────────────────────

    const MAX_ITEMS = 500; // cap per array/object to avoid DOM explosion

    function buildJSONNode(val, depth) {
        if (val === null) return '<span class="jv-null">null</span>';
        const tp = typeof val;
        if (tp === 'boolean') return '<span class="jv-bool">' + val + '</span>';
        if (tp === 'number')  return '<span class="jv-num">'  + val + '</span>';
        if (tp === 'string') {
            const s = escHTML(val);
            // Long strings: show truncated in collapsed state via title
            const full = s.length > 200
                ? '<span class="jv-str" title="' + s.slice(0, 500) + '">"' + s.slice(0, 200) + '<span class="jv-ellipsis">…</span>"</span>'
                : '<span class="jv-str">"' + s + '"</span>';
            return full;
        }

        const isArr = Array.isArray(val);
        const keys  = isArr ? null : Object.keys(val);
        const len   = isArr ? val.length : keys.length;
        const ob = isArr ? '[' : '{';
        const cb = isArr ? ']' : '}';

        if (len === 0) return '<span class="jv-empty">' + ob + cb + '</span>';

        const hint  = len + (isArr ? ' item' : ' key') + (len !== 1 ? 's' : '');
        const openA = depth < 2 ? ' open' : '';
        const capped = len > MAX_ITEMS;
        const items  = isArr ? val : keys;
        const count  = Math.min(len, MAX_ITEMS);

        let rows = '';
        for (let i = 0; i < count; i++) {
            const k = isArr ? i : items[i];
            const v = isArr ? val[i] : val[k];
            const comma = i < len - 1 ? '<span class="jv-comma">,</span>' : '';
            const keyHtml = isArr
                ? ''
                : '<span class="jv-key">' + escHTML(k) + '</span><span class="jv-colon">: </span>';
            rows += '<div class="jv-row">' + keyHtml + buildJSONNode(v, depth + 1) + comma + '</div>';
        }
        if (capped) {
            rows += '<div class="jv-row jv-more">… ' + (len - MAX_ITEMS) + ' more</div>';
        }

        return '<details' + openA + ' class="jv-node">'
            + '<summary class="jv-summary">'
            +   '<span class="jv-brace">' + ob + '</span>'
            +   '<span class="jv-hint"> ' + hint + ' </span>'
            +   '<span class="jv-brace">' + cb + '</span>'
            + '</summary>'
            + '<div class="jv-block">' + rows + '</div>'
            + '</details>';
    }

    // ── XML tree ─────────────────────────────────────────────────────────────

    function buildXMLDoc(doc) {
        let html = '';
        for (const child of doc.childNodes) {
            html += buildXMLNode(child, 0);
        }
        return html;
    }

    function buildXMLNode(node, depth) {
        if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
            return '<div class="xv-row xv-pi">'
                + '<span class="xv-punct">&lt;?</span>'
                + '<span class="xv-tag">' + escHTML(node.target) + '</span>'
                + (node.data ? ' <span class="xv-text">' + escHTML(node.data) + '</span>' : '')
                + '<span class="xv-punct">?&gt;</span>'
                + '</div>';
        }
        if (node.nodeType === Node.COMMENT_NODE) {
            return '<div class="xv-row xv-comment">'
                + '<span class="xv-punct">&lt;!--</span>'
                + '<span class="xv-cmt-text">' + escHTML(node.textContent) + '</span>'
                + '<span class="xv-punct">--&gt;</span>'
                + '</div>';
        }
        if (node.nodeType === Node.CDATA_SECTION_NODE) {
            return '<div class="xv-row">'
                + '<span class="xv-punct">&lt;![CDATA[</span>'
                + '<span class="xv-text">' + escHTML(node.data) + '</span>'
                + '<span class="xv-punct">]]&gt;</span>'
                + '</div>';
        }
        if (node.nodeType === Node.TEXT_NODE) {
            const t = node.textContent.trim();
            return t ? '<span class="xv-text">' + escHTML(t) + '</span>' : '';
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        // Build attribute string
        let attrHtml = '';
        for (const a of node.attributes) {
            attrHtml += ' <span class="xv-aname">' + escHTML(a.name) + '</span>'
                + '<span class="xv-punct">=</span>'
                + '<span class="xv-aval">"' + escHTML(a.value) + '"</span>';
        }

        const tagHtml = '<span class="xv-tag">' + escHTML(node.tagName) + '</span>';

        // Classify children
        const children = Array.from(node.childNodes);
        const sigChildren = children.filter(c =>
            c.nodeType === Node.ELEMENT_NODE ||
            c.nodeType === Node.COMMENT_NODE  ||
            c.nodeType === Node.CDATA_SECTION_NODE);
        const textParts = children
            .filter(c => c.nodeType === Node.TEXT_NODE)
            .map(c => c.textContent.trim()).filter(Boolean);
        const rawText = textParts.join('');

        // Self-closing
        if (!children.length || (!sigChildren.length && !rawText)) {
            return '<div class="xv-row">'
                + '<span class="xv-punct">&lt;</span>' + tagHtml + attrHtml
                + '<span class="xv-punct"> /&gt;</span>'
                + '</div>';
        }

        // Inline text-only
        if (!sigChildren.length && rawText) {
            return '<div class="xv-row">'
                + '<span class="xv-punct">&lt;</span>' + tagHtml + attrHtml + '<span class="xv-punct">&gt;</span>'
                + '<span class="xv-text">' + escHTML(rawText) + '</span>'
                + '<span class="xv-punct">&lt;/</span>' + tagHtml + '<span class="xv-punct">&gt;</span>'
                + '</div>';
        }

        // Block with children
        const openA = depth < 2 ? ' open' : '';
        const childCount = sigChildren.length + (rawText ? 1 : 0);
        const childHint  = childCount + ' child' + (childCount !== 1 ? 'ren' : '');

        let childrenHtml = '';
        if (rawText) {
            childrenHtml += '<div class="xv-row"><span class="xv-text">' + escHTML(rawText) + '</span></div>';
        }
        for (const c of children) {
            childrenHtml += buildXMLNode(c, depth + 1);
        }

        return '<details' + openA + ' class="xv-node">'
            + '<summary class="xv-summary">'
            +   '<span class="xv-punct">&lt;</span>' + tagHtml + attrHtml + '<span class="xv-punct">&gt;</span>'
            +   '<span class="xv-hint"> ' + childHint + '</span>'
            + '</summary>'
            + '<div class="xv-block">' + childrenHtml + '</div>'
            + '<div class="xv-close">'
            +   '<span class="xv-punct">&lt;/</span>' + tagHtml + '<span class="xv-punct">&gt;</span>'
            + '</div>'
            + '</details>';
    }


    // ─── Paste handler ──────────────────────────────────────────────────────

    function setupPasteFormat() {
        const textarea = document.getElementById('content');
        if (!textarea) return;
        textarea.addEventListener('paste', function (e) {
            const items = e.clipboardData && e.clipboardData.items;
            if (items) {
                for (let k = 0; k < items.length; k++) {
                    if (items[k].type.indexOf('image') !== -1) return;
                }
            }
            const text = e.clipboardData.getData('text/plain');
            if (!text) return;
            const result = tryFormat(text);
            if (!result) return;
            e.preventDefault();
            const start  = textarea.selectionStart;
            const end    = textarea.selectionEnd;
            textarea.value = textarea.value.substring(0, start) + result.formatted + textarea.value.substring(end);
            textarea.selectionStart = textarea.selectionEnd = start + result.formatted.length;
            textarea.focus();
            showNotification('✓ Auto-formatted as ' + result.type);
        });
    }


    // ─── Manual format (Mod+Shift+F / button) ──────────────────────────────

    function autoFormat() {
        const textarea = document.getElementById('content');
        const raw = textarea.value;
        if (!raw.trim()) { showNotification('Nothing to format'); return; }
        const result = tryFormat(raw) || (function () {
            try { return { formatted: formatXML(raw), type: 'XML' }; } catch (_) {}
            return null;
        })();
        if (!result) { showNotification('Cannot detect format (JSON / XML / ION)'); return; }
        textarea.value = result.formatted;
        textarea.dispatchEvent(new Event('input'));
        showNotification('✓ Formatted as ' + result.type);
    }

    Mousetrap.bind('mod+shift+f', function () { autoFormat(); return false; });


    // ─── Bottom-bar button ──────────────────────────────────────────────────

    function addFormatButton() {
        const link = document.querySelector('.link');
        if (!link) return;
        const btn = document.createElement('a');
        btn.href = '#';
        btn.id = 'formatBtn';
        btn.title = 'Auto-format JSON / XML / ION  (Cmd/Ctrl+Shift+F)';
        btn.textContent = '{ } format';
        btn.addEventListener('click', function (e) { e.preventDefault(); autoFormat(); });
        link.appendChild(document.createTextNode('\u00a0|\u00a0'));
        link.appendChild(btn);
    }


    // ─── Init ───────────────────────────────────────────────────────────────

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            setupPasteFormat();
            addFormatButton();
        });
    } else {
        setupPasteFormat();
        addFormatButton();
    }

    // Expose for markdown.js hook
    window._fmtRender = renderStructured;
    window._fmt = { autoFormat, tryFormat, formatJSON, formatXML, formatION };

})();
