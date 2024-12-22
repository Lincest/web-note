function uploadContent() {

    // If textarea value changes.
    if (content !== textarea.value) {
        var temp = textarea.value;
        var request = new XMLHttpRequest();

        request.open('POST', window.location.href, true);
        request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        request.onload = function() {
            if (request.readyState === 4) {

                // Request has ended, check again after 1 second.
                content = temp;
                setTimeout(uploadContent, 1000);
            }
        }
        request.onerror = function() {

            // Try again after 1 second.
            setTimeout(uploadContent, 1000);
        }
        request.send('text=' + encodeURIComponent(temp));

        // Make the content available to print.
        printable.removeChild(printable.firstChild);
        printable.appendChild(document.createTextNode(temp));
    }
    else {

        // Content has not changed, check again after 1 second.
        setTimeout(uploadContent, 1000);
    }
}

var textarea = document.getElementById('content');
var printable = document.getElementById('printable');
var content = textarea.value;

// Make the content available to print.
printable.appendChild(document.createTextNode(content));

textarea.focus();
uploadContent();

// save 
Mousetrap.bind('mod+s', function () {
    uploadContent();
    showNotification("content saved");
    return false;
});

// show history
document.addEventListener('DOMContentLoaded', function() {
    const note = window.location.pathname.split('/').pop();
    addToHistory(note);
    
    const toggleButton = document.getElementById('showHistory');
    toggleButton.onclick = toggleSidebar;

    const container = document.querySelector('.container');
    const sidebar = document.getElementById('sidebar');

    // Add paste event listener
    textarea.addEventListener('paste', handlePaste);
});

// toggle history sidebar
Mousetrap.bind('mod+k', function () {
    toggleSidebar();
    return false;
});

function handlePaste(e) {
    const items = e.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
            e.preventDefault();
            const blob = items[i].getAsFile();
            setTimeout(() => {
                showNotification("正在上传...");
                uploadImage(blob);
            }, 500);
            break;
        }
    }
}

function uploadImage(blob) {
    const formData = new FormData();
    formData.append('image', blob, 'clipboard_image.png');

    fetch('https://imgdd.com/api/v1/upload', {
        method: 'POST',
        body: formData,
        headers: {
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.url) {
            const imageUrl = data.url;
            insertImageUrl(imageUrl);
            showNotification("图片上传成功");
        } else {
            console.error('Upload failed:', data);
            showNotification("图片上传失败");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification("图片上传出错");
    });
}

function insertImageUrl(url) {
    const textarea = document.getElementById('content');
    const cursorPos = textarea.selectionStart;
    const textBefore = textarea.value.substring(0, cursorPos);
    const textAfter = textarea.value.substring(cursorPos);
    
    textarea.value = textBefore + `![](${url})` + textAfter;
    textarea.selectionStart = textarea.selectionEnd = cursorPos + url.length + 4;
    textarea.focus();
}
