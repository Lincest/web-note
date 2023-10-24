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
        var renderedContent = marked.parse(markdownText);
        markdownContent.innerHTML = renderedContent;
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

autoMark();