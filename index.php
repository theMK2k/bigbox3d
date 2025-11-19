<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BigBox3D Gallery</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: Arial, sans-serif;
      background-color: #1a1a1a;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      color: #fff;
      text-align: center;
      margin-bottom: 40px;
      font-size: 2.5rem;
    }

    .gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 30px;
      padding: 20px;
    }

    .card {
      background-color: #2a2a2a;
      border-radius: 10px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 12px rgba(0, 0, 0, 0.5);
    }

    .card-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
      display: block;
    }

    .card-title {
      padding: 15px;
      color: #fff;
      font-size: 1.1rem;
      text-align: center;
      background-color: #333;
    }

    .no-items {
      color: #999;
      text-align: center;
      font-size: 1.2rem;
      padding: 40px;
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>BigBox3D Gallery</h1>
    <div class="gallery">
      <?php
      // Scan the img directory for preview images
      $imgDir = __DIR__ . '/img';
      $previewSuffix = '-preview.jpg';
      $items = [];

      if (is_dir($imgDir)) {
        $files = scandir($imgDir);

        foreach ($files as $file) {
          // Check if file ends with "-preview.jpg"
          if (substr($file, -strlen($previewSuffix)) === $previewSuffix) {
            // Extract the name by removing "-preview.jpg"
            $name = substr($file, 0, -strlen($previewSuffix));
            $items[] = [
              'name' => $name,
              'preview' => 'img/' . $file
            ];
          }
        }
      }

      // Sort items alphabetically by name
      usort($items, function ($a, $b) {
        return strcmp($a['name'], $b['name']);
      });

      // Display cards
      if (count($items) > 0) {
        foreach ($items as $item) {
          $name = htmlspecialchars($item['name']);
          $displayName = str_replace('_', ' ', $name);
          $preview = htmlspecialchars($item['preview']);
          $url = 'bigbox3d.php?name=' . urlencode($name) . '-';

          echo '<div class="card" onclick="window.open(\'' . $url . '\', \'_blank\')">';
          echo '    <img src="' . $preview . '" alt="' . $displayName . '" class="card-image">';
          echo '    <div class="card-title">' . $displayName . '</div>';
          echo '</div>';
        }
      } else {
        echo '<div class="no-items">No preview images found in the img directory.</div>';
      }
      ?>
    </div>
  </div>
</body>

</html>