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
        return window.location.href; // 返回当前页面的URL
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
    document.getElementById('qrcodePopup').style.display = 'block';
    var url = window.location.href;
    if (!isGenerate) {
        var qrcode = new QRCode(document.getElementById('qrcode'), {
            text: url,
            width: 200,
            height: 200
        });
        isGenerate = true;
    }
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