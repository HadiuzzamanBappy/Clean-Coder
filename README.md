# CleanCoder Website

A modern, responsive website offering a suite of free developer tools, including formatters, minifiers, and code converters.

## 🌐 Live Demo & Screenshot

**[➡️ View Live Site Here](https://clean-coder.vercel.app/)**

<br>

![Project Screenshot](/res/image/image.png)

---

## Features

🚀 **Multi-Format Support** - Handles JSON, CSS, HTML, JavaScript, SQL, and more.
✨ **Code Formatting** - Beautify and prettify messy code with a single click.
📦 **Minification Engine** - Reduce file size for JS and CSS for faster load times.
🔄 **Code Conversion** - Convert between formats like JSON to YAML.
🔎 **Automatic Detection** - Intelligently detects the input code format.
🌓 **Dark/Light Theme** - Comfortable viewing in any lighting condition.
💾 **State Persistence** - Remembers your last session and theme using local storage.

---

## Folder Structure

```
CleanCoder/
├── assets/
│ ├── css/
│ │ ├── style.css
│ │ └── vendor.css
│ ├── js/
│ │ ├── app.js
│ │ └── libraries.js // (Terser, Prettier, etc.)
│ └── images/
│ └── logo.svg
├── index.html
└── README.md
```

---

## How to Use

### Input Code:
- Paste your code directly into the input field.
- Alternatively, click **"Upload File"** or drag and drop a file into the editor.
- The format will be auto-detected, or you can select it manually.

### Process and View:
- Use the **"Format"**, **"Minify"**, or **"Convert"** buttons to process the code.
- The output will appear in the results panel.

### Copy/Download:
- Click the **"Copy"** button to copy the result to your clipboard.
- Click **"Download"** to save the output as a file.

---

## Technical Details

### Dependencies

All processing is done client-side. The core tools are loaded via CDN or included locally:
- [Prettier](https://prettier.io/) - For code formatting.

### Browser Support

Works in all modern evergreen browsers:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
- Safari (latest)

---

## Limitations

- Purely client-side operation; no data is sent to a server.
- Performance depends on the user's browser and machine for very large inputs.
- Does not support project-level configurations (e.g., `.prettierrc`).

---

## Deployment

This is a static website. No backend is required:
- Deploy the entire project folder to any static hosting provider (Vercel, Netlify, GitHub Pages, etc.).
- Ensure all asset paths are correctly referenced.

---

## License

This project is open source and available under the **MIT License**.

---

## Credits

- [Prettier](https://prettier.io/) - The opinionated code formatter.
