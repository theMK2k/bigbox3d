<?php
/**
 * bigbox3d.php
 * 
 * While using bigbox3d.html on its own is perfectly fine,
 * bigbox3d.php enhances the experience by providing proper
 * og:image and og:title meta tags which provide a better
 * experience when sharing the link on social media.
 */

$document = new DOMDocument();
$document->loadHTMLFile("bigbox3d.html");

try {
    $configContent = file_get_contents("bigbox3d.config.json");
    $config = json_decode($configContent, true);

    $opts = new StdClass();

    $opts->name = ($_GET["name"] != "" ? $_GET["name"] : "template-");
    // $opts->path = ($_GET["path"] != "" ? $_GET["path"] : "/");
    $opts->path = ($_GET["path"] != "" ? $_GET["path"] : $config["path"]);
    $opts->ext = ($_GET["ext"] != "" ? $_GET["ext"] : ($config["ext"] != "" ? $config["ext"] : "jpg"));
    $opts->bg = ($_GET["bg"] != "" ? $_GET["bg"] : ($config["bg"] != "" ? $config["bg"] : "000000"));

    // provide a global config Object for the bigbox3d.js to pick up
    $src    = "const config = " . $configContent;
    $script = $document->createElement('script', $src);
    $dynamicContent = $document->getElementById("dynamic-data");
    $oldScript = $document->getElementById("config");
    $dynamicContent->removeChild($oldScript);
    $dynamicContent->appendChild($script);

    $previewPath = $config["host"] . $opts->path . $opts->name . "preview." . $opts->ext;
    
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
        echo '<pre>no meta og:image element found!';
        die;
    }
    $ogImages->item(0)->setAttribute('content', $previewPath);

    $ogTitles = $xpath->query('//meta[@property="og:title"]');
    $ogTitles->item(0)->setAttribute('content', 'Click here to view ' . $title . ' in interactive 3D');

    $twitterImages = $xpath->query('//meta[@name="twitter:image"]');
    if ($twitterImages->count() == 0) {
        echo '<pre>no meta twitter:image element found!';
        die;
    }
    $twitterImages->item(0)->setAttribute('content', $previewPath);

    echo $document->saveHTML();
} catch (Error $e) {
    // echo '<html>ERROR!</html>';
    echo '<pre>', $e->getMessage();
}
