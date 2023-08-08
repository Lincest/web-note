function renderMarkdown() {
    var markdownContent = document.getElementById("markdown-content");
    var contentTextarea = document.getElementById("content");

    if (markdownContent.style.display === "none") {
        // Show rendered markdown
        var markdownText = contentTextarea.value;
        var renderedContent = marked.parse(markdownText);
        markdownContent.innerHTML = renderedContent;
        markdownContent.style.display = "block";
        contentTextarea.style.display = "none";
    } else {
        // Show original text
        markdownContent.style.display = "none";
        contentTextarea.style.display = "block";
    }
}

document.getElementById("renderMarkdown").addEventListener("click", function (event) {
    event.preventDefault();
    renderMarkdown();
});