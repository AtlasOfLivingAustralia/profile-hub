When changing source of custom plugins like `insertimage.js`, you have to build ckeditor. This process will inject a 
translation code which supports localisation. However, a `const` variable causes issue with asset pipleline since it 
expects code to be in ES5. Replacing `const` with `var` will solve this issue.