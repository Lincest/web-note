function renderMarkdown() {
    var markdownContent = document.getElementById("markdown-content");
    var contentTextarea = document.getElementById("content");
    var renderStatusIcon = document.getElementById("renderStatus");

    if (markdownContent.style.display === "none") {
        // Show rendered markdown
        var markdownText = contentTextarea.value;
        var renderedContent = marked.parse(markdownText);
        markdownContent.innerHTML = renderedContent;
        markdownContent.style.display = "block";
        contentTextarea.style.display = "none";
        renderStatusIcon.innerHTML = "🔒"
    } else {
        // Show original text
        markdownContent.style.display = "none";
        contentTextarea.style.display = "block";
        renderStatusIcon.innerHTML = "🔓"
    }
}

document.getElementById("renderMarkdown").addEventListener("click", function (event) {
    event.preventDefault();
    renderMarkdown();
});