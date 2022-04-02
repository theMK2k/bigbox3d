<?php
$document = new DOMDocument();
$document->loadHTMLFile("bigbox3d.html");

try {
    $opts = new StdClass();

    $opts->name = ($_GET["name"] != "" ? $_GET["name"] : "template-");
    // $opts->path = ($_GET["path"] != "" ? $_GET["path"] : "/");
    $opts->path = $_GET["path"];
    $opts->ext = ($_GET["jpg"] != "" ? $_GET["jpg"] : "jpg");
    $opts->bg = ($_GET["bg"] != "" ? $_GET["bg"] : "000000");

    $previewPath = $opts->path . $opts->name . "preview." . $opts->ext;
    
    $title = str_replace("_", " ", $opts->name);
    $lastChar = substr($title, -1);
    if ($lastChar == " " || $lastChar == "-") {
        $title = substr($title, 0, -1);
    }

    // echo '<pre>opts:

    // ', json_encode($opts, JSON_PRETTY_PRINT), '

    // ', '$previewPath: ', $previewPath;
    // die;

    $xpath = new DOMXpath($document);
    $ogImages = $xpath->query('//meta[@property="og:image"]');
    if ($ogImages->count() == 0) {
        echo '<pre>no meta og:image elements found!';
        die;
    }

    $ogImages->item(0)->setAttribute('content', $previewPath);

    $ogTitles = $xpath->query('//meta[@property="og:title"]');
    $ogTitles->item(0)->setAttribute('content', 'Click here to view ' . $title . ' in interactive 3D');

    echo $document->saveHTML();
} catch (Error $e) {
    // echo '<html>ERROR!</html>';
    echo '<pre>', $e->getMessage();
}
