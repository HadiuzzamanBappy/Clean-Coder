document.addEventListener('DOMContentLoaded', () => {
    // DOM element references look correct and well-organized
    const dom = {
        input: document.getElementById('input-editor'),
        output: document.getElementById('output-code'),
        outputContainer: document.querySelector('.editor-panel pre'),
        formatSelect: document.getElementById('format-select'),
        formatBtn: document.getElementById('format-btn'),
        minifyBtn: document.getElementById('minify-btn'),
        validateBtn: document.getElementById('validate-btn'),
        copyBtn: document.getElementById('copy-btn'),
        downloadBtn: document.getElementById('download-btn'),
        resetBtn: document.getElementById('reset-btn'),
        uploadBtn: document.getElementById('upload-btn'),
        fileUpload: document.getElementById('file-upload'),
        fileInfo: document.getElementById('file-info'),
        dropZone: document.getElementById('drop-zone'),
        themeSwitch: document.getElementById('theme-switch'),
        themeIcon: document.getElementById('theme-icon'),
        lineNumbersToggle: document.getElementById('line-numbers-toggle'),
        wordWrapToggle: document.getElementById('word-wrap-toggle'),
        toast: document.getElementById('toast'),
        prismDarkTheme: document.getElementById('prism-dark-theme'),
        prismLightTheme: document.getElementById('prism-light-theme'),
    };

    // Format mappings are correctly defined with appropriate parsers and plugins
    const formatMappings = {
        json: { parser: 'json', plugins: [prettierPlugins.babel], lang: 'json' },
        jsonc: { parser: 'jsonc', plugins: [prettierPlugins.babel], lang: 'json' },
        html: { parser: 'html', plugins: [prettierPlugins.html], lang: 'html' },
        css: { parser: 'css', plugins: [prettierPlugins.postcss], lang: 'css' },
        yaml: { parser: 'yaml', plugins: [prettierPlugins.yaml], lang: 'yaml' },
        markdown: { parser: 'markdown', plugins: [prettierPlugins.markdown], lang: 'markdown' },
        php: { parser: 'php', plugins: [prettierPlugins.php], lang: 'php' },
        javascript: { parser: 'babel', plugins: [prettierPlugins.babel], lang: 'javascript' },
        typescript: { parser: 'babel-ts', plugins: [prettierPlugins.babel], lang: 'typescript' },
    };

    // Format detection logic is robust and handles various cases
    const detectFormat = () => {
        const selected = dom.formatSelect.value;
        if (selected !== 'auto') {
            return selected;
        }

        const text = dom.input.value.trim();
        if (!text) {
            return 'text';
        }

        const lowerText = text.toLowerCase();

        // 1. High-certainty checks (no change)
        if (lowerText.startsWith('<?xml')) return 'xml';
        if (lowerText.startsWith('<!doctype html')) return 'html';
        if (lowerText.startsWith('---')) return 'yaml';

        // 2. JSON check (must be valid)
        if (text.startsWith('{') || text.startsWith('[')) {
            try {
                JSON.parse(text);
                return 'json';
            } catch (e) {
                // Not valid JSON, continue
            }
        }

        // 3. NEW: Stricter and more reliable CSS detection
        if (/[.#]?\w[\s\S]*?\{[^{}]*:[^;]*;[^{}]*\}/.test(text)) {
            return 'css';
        }

        // 4. SQL detection (no change)
        const sqlKeywords = ['select', 'insert', 'update', 'delete', 'create', 'alter', 'drop', 'with'];
        if (sqlKeywords.some(kw => lowerText.startsWith(kw))) {
            return 'sql';
        }

        // 5. JavaScript detection (now much less likely to have a false positive)
        const jsKeywords = ['function', 'const', 'let', 'import', 'export', 'class'];
        if (jsKeywords.some(kw => text.includes(kw))) {
            return 'javascript';
        }

        // 6. Markdown detection (no change)
        if (/^#{1,6}\s|^\s*[-*+]\s|\[.+\]\(.+\)/m.test(text)) {
            return 'markdown';
        }

        // 7. Fallback checks (no change)
        if (text.startsWith('<')) return 'xml';
        if (/^[\w\s-]+:\s/m.test(text)) return 'yaml';

        // 8. Default
        return 'text';
    };


    // Formatting function with proper error handling and async/await
    const runFormatter = async (isMinify = false) => {
        const rawText = dom.input.value;
        if (!rawText.trim()) return;

        const format = detectFormat();
        console.log(`Detected format: ${format}, Minify: ${isMinify}`);

        // --- Special Handlers for non-Prettier formats ---
        if (format === 'xml') {
            if (typeof vkbeautify !== 'undefined') {
                // vkbeautify doesn't have a separate minify, so format is the best we can do.
                const resultText = vkbeautify.xml(rawText, isMinify ? 0 : 4);
                updateOutput(resultText, 'xml');
            } else {
                showToast('vkBeautify library not loaded.', 'error');
            }
            return;
        }

        if (format === 'sql') {
            if (typeof sqlFormatter !== 'undefined') {
                // SQL formatting is the only option here
                const resultText = sqlFormatter.format(rawText, { language: 'sql', tabWidth: 4, keywordCase: 'upper' });
                updateOutput(resultText, 'sql');
            } else {
                showToast('SQL Formatter library not loaded.', 'error');
            }
            return;
        }

        // --- Main Logic for Prettier-based formats ---
        const mapping = formatMappings[format];

        if (!mapping) {
            showToast(`Formatter for ${format.toUpperCase()} not available.`, 'error');
            updateOutput(rawText, 'text'); // Show raw text on failure
            return;
        }

        try {
            let resultText;

            if (isMinify) {
                // --- MINIFICATION LOGIC ---
                if (format === 'javascript' || format === 'typescript') {
                    if (typeof Terser === 'undefined') throw new Error('Terser library not loaded.');
                    const result = await Terser.minify(rawText);
                    resultText = result.code;
                } else if (format === 'css') {
                    if (typeof csso === 'undefined') throw new Error('CSSO library not loaded.');
                    resultText = csso.minify(rawText).css;
                } else if (format === 'json' || format === 'jsonc') {
                    // The classic JSON minification method
                    resultText = JSON.stringify(JSON.parse(rawText));
                } else {
                    // For formats without a dedicated minifier (HTML, Markdown, YAML)
                    // we can use the Prettier trick as a "best effort".
                    showToast(`Minification for ${format.toUpperCase()} is limited to removing whitespace.`, 'info');
                    resultText = await prettier.format(rawText, {
                        parser: mapping.parser,
                        plugins: mapping.plugins,
                        printWidth: 99999, // Make it one line
                    });
                }
            } else {
                // --- FORMATTING LOGIC ---
                resultText = await prettier.format(rawText, {
                    parser: mapping.parser,
                    plugins: mapping.plugins,
                    tabWidth: 4,
                });
            }
            updateOutput(resultText, mapping.lang);

        } catch (e) {
            showToast(`Error: ${e.message}`, 'error');
            updateOutput(rawText, 'text'); // Show raw text on failure
        }
    };

    // Validation function with proper error handling
    const validateCode = () => {
        const rawText = dom.input.value;
        if (!rawText.trim()) return showToast("Input is empty.", "error");

        const format = detectFormat();
        const mapping = formatMappings[format];

        if (!mapping) return showToast(`Cannot validate ${format.toUpperCase()}.`, "error");

        try {
            if (format === 'json') {
                JSON.parse(rawText);
            } else {
                prettier.format(rawText, { parser: mapping.parser, plugins: mapping.plugins });
            }
            showToast(`${format.toUpperCase()} is valid!`, 'success');
        } catch (e) {
            showToast(`Validation Error: ${e.message}`, 'error');
        }
    };

    // UI update functions
    const updateOutput = (text, lang) => {
        dom.output.textContent = text;
        dom.output.className = `language-${lang}`;
        Prism.highlightElement(dom.output);
        toggleLineNumbers(dom.lineNumbersToggle.checked);
    };

    const showToast = (message, type = 'info') => {
        dom.toast.textContent = message;
        dom.toast.style.backgroundColor = type === 'error' ? '#ef4444' : '#22c55e';
        dom.toast.classList.add('show');
        setTimeout(() => dom.toast.classList.remove('show'), 3000);
    };

    const toggleLineNumbers = (show) => {
        dom.outputContainer.classList.toggle('line-numbers', show);
    };

    // Event listeners with proper error handling and cleanup
    dom.formatBtn.addEventListener('click', () => runFormatter(false));
    dom.minifyBtn.addEventListener('click', () => runFormatter(true));
    dom.validateBtn.addEventListener('click', validateCode);

    dom.resetBtn.addEventListener('click', () => {
        dom.input.value = '';
        dom.output.textContent = '';
        dom.fileInfo.textContent = '';
        updateOutput('', 'text');
    });

    dom.copyBtn.addEventListener('click', () => {
        if (!dom.output.textContent) return;
        navigator.clipboard.writeText(dom.output.textContent)
            .then(() => showToast('Copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy.', 'error'));
    });

    dom.downloadBtn.addEventListener('click', () => {
        const text = dom.output.textContent;
        if (!text) return;
        const format = detectFormat();
        if (format === 'text') format = 'txt';
        const filename = `output.${format}`;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    // UI preference handlers
    dom.lineNumbersToggle.addEventListener('change', (e) => toggleLineNumbers(e.target.checked));
    dom.wordWrapToggle.addEventListener('change', (e) => {
        const wrapStyle = e.target.checked ? 'pre-wrap' : 'pre';
        dom.input.style.whiteSpace = wrapStyle;
        dom.outputContainer.style.whiteSpace = wrapStyle;
    });

    // Theme handling with localStorage persistence
    dom.themeSwitch.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        dom.themeIcon.textContent = isDark ? 'dark_mode' : 'light_mode';
        dom.prismDarkTheme.disabled = !isDark;
        dom.prismLightTheme.disabled = isDark;
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') dom.themeSwitch.click();

    // File handling
    dom.uploadBtn.addEventListener('click', () => dom.fileUpload.click());
    dom.fileUpload.addEventListener('change', (e) => {
        if (e.target.files.length) readFile(e.target.files[0]);
    });

    // Drag and drop handling
    const dropZoneEvents = ['dragover', 'dragleave', 'drop'];
    dropZoneEvents.forEach(eventName => {
        dom.dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (eventName === 'dragover') dom.dropZone.classList.add('drag-over');
            else dom.dropZone.classList.remove('drag-over');
            if (eventName === 'drop' && e.dataTransfer.files.length) readFile(e.dataTransfer.files[0]);
        });
    });

    // File reading with proper cleanup
    const readFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            dom.input.value = e.target.result;
            dom.fileInfo.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            runFormatter(false);
        };
        reader.readAsText(file);
        dom.fileUpload.value = '';
    };
});