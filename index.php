<?php

// Base URL of the website, without trailing slash.
$base_url = '';

// Path to the directory to save the notes in, without trailing slash.
// Should be outside of the document root, if possible.
$save_path = '_tmp';

$file_limit = getenv('FILE_LIMIT') ?: 100000; // the number of files limit
$single_file_size_limit = getenv('SINGLE_FILE_SIZE_LIMIT') ?: 102400; // the size of single file limit

$files = scandir($save_path);
$fileCount = count($files) - 2;

// Disable caching.
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// If no name is provided or it contains invalid characters or it is too long.
if (!isset($_GET['note']) || !preg_match('/^[a-zA-Z0-9_-]+$/', $_GET['note']) || strlen($_GET['note']) > 64) {

    // Generate a name with 5 random unambiguous characters. Redirect to it.
    header("Location: $base_url/" . substr(str_shuffle('234579abcdefghjkmnpqrstwxyz'), -5));
    die;
}

$path = $save_path . '/' . $_GET['note'];

if (isset($_POST['text'])) {

    // file count limit
    if ($fileCount >= $file_limit) {
        error_log("File limit reached $file_limit");
        header('HTTP/1.0 403 Forbidden');
        die;
    }
    
    // single file size limit
    if (strlen($_POST['text']) > $single_file_size_limit) {
        error_log("File size limit reached $single_file_size_limit");
        header('HTTP/1.0 403 Forbidden');
        die;
    }

    // Update file.
    file_put_contents($path, $_POST['text']);

    // If provided input is empty, delete file.
    if (!strlen($_POST['text'])) {
        unlink($path);
    }
    die;
}

// Print raw file if the client is curl, wget, or when explicitly requested.
if (isset($_GET['raw']) || strpos($_SERVER['HTTP_USER_AGENT'], 'curl') === 0 || strpos($_SERVER['HTTP_USER_AGENT'], 'Wget') === 0) {
    if (is_file($path)) {
        header('Content-type: text/plain');
        print file_get_contents($path);
    } else {
        header('HTTP/1.0 404 Not Found');
    }
    die;
}

function generateExcerptByPath($p) {
  if (is_file($p)) {
    return _generateExcerpt(file_get_contents($p));
  }
  return '';
}

function _generateExcerpt($text, $length = 150) {
    $excerpt = substr($text, 0, $length);
    if (strlen($text) > $length) {
        $excerpt .= "...";
    }
    return $excerpt;
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>web-note · <?php print $_GET['note']; ?></title>
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="stylesheet" href="<?php print $base_url; ?>/styles.css">
    <meta name="description" content="📔 <?php print generateExcerptByPath($path); ?>">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.11/clipboard.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mousetrap/1.6.5/mousetrap.min.js"></script>
</head>
<body>
    <div class="container">
        <div id="qrcodePopup">
            <div id="qrcode"></div>
        </div>
        <textarea class="mousetrap" id="content" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off"><?php
            if (is_file($path)) {
                print htmlspecialchars(file_get_contents($path), ENT_QUOTES, 'UTF-8');
            }
        ?></textarea>
        <button id="clippy" class="btn">
            <img src="/clippy.svg" alt="Copy to clipboard" style="width: 12px; height: 16px;">
        </button>
        <div id="markdown-content" style="display: none"></div>
        <div class="link">
            <a href="<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>">
            <!-- <?php echo 'web-note' . $_SERVER['REQUEST_URI']; ?> -->
            💡 new &nbsp;|&nbsp;
            </a>
            <a href="#" id="renderMarkdown">note/<?php echo $_GET['note']; ?>&nbsp;<label id="renderStatus" style="cursor: pointer">🔓</label></a>
            <a href="#" id="showQRCode" class="copyBtn">&nbsp; | &nbsp;🔗 share</a>
        </div>
    </div>
    <pre id="printable"></pre>
    <div id="qrcode"></div>
    <!-- markdown render -->
    <script src="<?php print $base_url; ?>/markdown.js"></script>
    <!-- copy -->
    <script src="<?php print $base_url; ?>/copy.js"></script>
    <!-- upload   -->
    <script src="<?php print $base_url; ?>/script.js"></script>
</body>
</html>
