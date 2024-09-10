// qrcode
var isGenerate = false;
var clipboardForContent = new ClipboardJS('.btn', {
    text: function () {
        return contentTextarea = document.getElementById("content").value;
    }
});

clipboardForContent.on('success', function (e) {
    showNotification("content copied");
    e.clearSelection();
});

var clipboard = new ClipboardJS('.copyBtn', {
    text: function () {
        return getUrl();
    }
});

clipboard.on('success', function (e) {
    console.log('link copied');
    showNotification("link copied");
    e.clearSelection();
});

clipboard.on('error', function (e) {
    console.error('link copied failed');
    showNotification("link copied failed");
});

document.getElementById('showQRCode').addEventListener('click', function (e) {
    e.preventDefault();
});

document.addEventListener('click', function (e) {
    if (!e.target.closest('#qrcodePopup') && !e.target.closest('#showQRCode')) {
        document.getElementById('qrcodePopup').style.display = 'none';
    }
});

Mousetrap.bind('esc', function () {
    document.getElementById('qrcodePopup').style.display = 'none';
    // return false to prevent default browser behavior
    return true;
});

function showNotification(message) {
    var notify = document.createElement("div");
    notify.className = "notify";
    notify.textContent = message;
    document.body.appendChild(notify);

    setTimeout(function () {
        document.body.removeChild(notify);
    }, 1000);
}

function getUrl(url) {
    var url = window.location.href;
    if (document.getElementById("markdown-content").style.display !== "none") {
        if (!url.includes('?marked')) {
            url = url + '?marked';
        }
    }
    return url;
}

Mousetrap.bind('mod+e', function () {
    renderMarkdown();
    // return false to prevent default browser behavior
    return false;
});

Mousetrap.bind('mod+l', function () {
    document.getElementById("showQRCode").click();
    // return false to prevent default browser behavior
    return false;
});
