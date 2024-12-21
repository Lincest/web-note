function autoMark() {
    const currentURL = window.location.href;
    const regex = /[?&]marked(?:=([^&#]*)|&|#|$)/i;
    const match = regex.exec(currentURL);
    if (match !== null) {
        renderMarkdown();
    }
}

function renderMarkdown() {
    var markdownContent = document.getElementById("markdown-content");
    var contentTextarea = document.getElementById("content");
    var renderStatusIcon = document.getElementById("renderStatus");
    var button = document.getElementById("clippy");
    var currentUrl = window.location.href;

    if (markdownContent.style.display === "none") {
        // Show rendered markdown
        if (!currentUrl.includes('?marked')) {
            markedUrl = currentUrl + '?marked';
            history.pushState(null, null, markedUrl);
        }
        var markdownText = contentTextarea.value;
        const renderer = new marked.Renderer();

        renderer.image = function(href, title, text) {
            let size = '100%';
            console.log("text", text);
            if (text && text.endsWith('%')) {
                size = text;
                text = title || '';
            }
            return `<img src="${href}" title="${title || ''}" alt="${text}" style="width: ${size};">`;
        };
        var renderedContent = marked.parse(markdownText, { renderer: renderer });
        markdownContent.innerHTML = renderedContent;
        
        // 选择所有的 pre 和 code 元素
        const copyableElements = markdownContent.querySelectorAll('pre, code');
        copyableElements.forEach(element => {
            element.style.cursor = 'pointer';
            
            element.addEventListener('click', async function(e) {
                // 防止冒泡，避免嵌套元素重复触发
                e.stopPropagation();
                
                // 获取要复制的文本
                let textToCopy = this.textContent;
                if (this.tagName.toLowerCase() === 'pre') {
                    // 如果是 pre 元素，去除其中 code 元素的重复内容
                    const codeElement = this.querySelector('code');
                    textToCopy = codeElement ? codeElement.textContent : this.textContent;
                }
                textToCopy = textToCopy.trim();
                
                try {
                    // 优先使用现代 Clipboard API
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(textToCopy);
                    } else {
                        // 回退方案
                        const textArea = document.createElement('textarea');
                        textArea.value = textToCopy;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-9999px';
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) {
                            console.error('Copy Failed:', err);
                        }
                        document.body.removeChild(textArea);
                    }

                    // 显示复制成功的临时提示
                    showNotification("Copied!");
                    
                } catch (err) {
                    console.error('Copy Failed:', err);
                }
            });
        });

        markdownContent.style.display = "block";
        contentTextarea.style.display = "none";
        button.style.display = "block";
        renderStatusIcon.innerHTML = "🔒"

    } else {
        // Show original text
        if (currentUrl.includes('?marked')) {
            markedUrl = currentUrl.replace('?marked', '');
            history.pushState(null, null, markedUrl);
        }
        markdownContent.style.display = "none";
        contentTextarea.style.display = "block";
        button.style.display = "none";
        renderStatusIcon.innerHTML = "🔓"
    }
}

document.getElementById("renderMarkdown").addEventListener("click", function (event) {
    event.preventDefault();
    renderMarkdown();
});

// map multiple combinations to the same callback
// detect system windows(ctrl + e), macos(command + e)
Mousetrap.bind('mod+e', function () {
    renderMarkdown();
    // return false to prevent default browser behavior
    return false;
});

// 添加 tab 键控制缩进的功能
document.getElementById("content").addEventListener("keydown", function(e) {
    if (e.key === 'Tab') {
        e.preventDefault(); // 阻止默认的 tab 键行为
        
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        
        if (e.shiftKey) {
            // 处理 shift + tab (减少缩进)
            if (start === end) {
                // 单行减少缩进
                const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                if (value.substring(lineStart, lineStart + 4) === '    ') {
                    this.value = value.substring(0, lineStart) + value.substring(lineStart + 4);
                    this.selectionStart = this.selectionEnd = start - 4;
                }
            } else {
                // 多行减少缩进
                const lines = value.substring(start, end).split('\n');
                const newText = lines.map(line => line.startsWith('    ') ? line.substring(4) : line).join('\n');
                this.value = value.substring(0, start) + newText + value.substring(end);
                this.selectionStart = start;
                this.selectionEnd = start + newText.length;
            }
        } else {
            // 处理 tab (增加缩进)
            if (start === end) {
                // 单行增加缩进
                const indent = '    ';
                this.value = value.substring(0, start) + indent + value.substring(end);
                this.selectionStart = this.selectionEnd = start + indent.length;
            } else {
                // 多行增加缩进
                const lines = value.substring(start, end).split('\n');
                const newText = lines.map(line => '    ' + line).join('\n');
                this.value = value.substring(0, start) + newText + value.substring(end);
                this.selectionStart = start;
                this.selectionEnd = start + newText.length;
            }
        }
    }
});

autoMark();