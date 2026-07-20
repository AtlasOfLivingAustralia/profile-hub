%{--
  Loads the Angular multi-root bundle. Include once per page that hosts
  app-page-*-root custom elements. Built by: ./gradlew copyAngularAssets
--}%
<link rel="stylesheet" href="${asset.assetPath(src: 'profiles-angular/styles.css')}"/>
<script type="module" src="${asset.assetPath(src: 'profiles-angular/main.js')}"></script>
