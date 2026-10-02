import JSZip from 'jszip';

export interface ProjectFile {
  name: string;
  content: string;
  language?: string;
  size?: string;
}

export interface ExtractedProject {
  projectName: string;
  files: ProjectFile[];
  readmeText: string;
}

/**
 * Extracts multiple source files from a task deliverable's markdown text.
 * Intelligently identifies filenames from code fences, comments, or language headers.
 */
export function extractFilesFromDeliverable(content: string, defaultName: string = 'project'): ExtractedProject {
  const files: ProjectFile[] = [];
  const sanitizedProjectName = defaultName
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 35) || 'muhammad-ai-task';

  // Pattern 1: Code blocks with optional filename brackets or headers: ```lang [filename.ext]
  // e.g. ```html [index.html] or ```python [main.py] or ```typescript [server.ts]
  const fenceRegex = /```([a-zA-Z0-9_-]+)?(?:\s*(?:\[|\()([a-zA-Z0-9_.\-\/]+)(?:\]|\)))?\s*\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  let fileIndex = 1;
  const usedNames = new Set<string>();

  while ((match = fenceRegex.exec(content)) !== null) {
    const rawLang = (match[1] || 'txt').toLowerCase().trim();
    let explicitFilename = match[2]?.trim();
    const codeBody = match[3] || '';

    // If no explicit filename in fence header, check the first line of code for comments like:
    // // filename: app.js or <!-- index.html --> or # main.py
    if (!explicitFilename) {
      const firstLine = codeBody.trim().split('\n')[0] || '';
      const commentMatch = /(?:\/\/|#|<!--|\/\*)\s*(?:file(?:name)?:?\s*)?([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)/i.exec(firstLine);
      if (commentMatch && commentMatch[1]) {
        explicitFilename = commentMatch[1].trim();
      }
    }

    // Determine filename if still none
    let filename = explicitFilename;
    if (!filename) {
      if (rawLang === 'html') {
        filename = !usedNames.has('index.html') ? 'index.html' : `page_${fileIndex}.html`;
      } else if (rawLang === 'css') {
        filename = !usedNames.has('style.css') ? 'style.css' : `style_${fileIndex}.css`;
      } else if (rawLang === 'javascript' || rawLang === 'js') {
        filename = !usedNames.has('script.js') ? 'script.js' : `app_${fileIndex}.js`;
      } else if (rawLang === 'typescript' || rawLang === 'ts') {
        filename = !usedNames.has('index.ts') ? 'index.ts' : `module_${fileIndex}.ts`;
      } else if (rawLang === 'python' || rawLang === 'py') {
        filename = !usedNames.has('main.py') ? 'main.py' : `script_${fileIndex}.py`;
      } else if (rawLang === 'json') {
        if (codeBody.includes('"dependencies"') || codeBody.includes('"devDependencies"')) {
          filename = 'package.json';
        } else {
          filename = !usedNames.has('config.json') ? 'config.json' : `data_${fileIndex}.json`;
        }
      } else if (rawLang === 'sql') {
        filename = !usedNames.has('schema.sql') ? 'schema.sql' : `query_${fileIndex}.sql`;
      } else if (rawLang === 'bash' || rawLang === 'sh') {
        filename = !usedNames.has('run.sh') ? 'run.sh' : `setup_${fileIndex}.sh`;
      } else if (rawLang === 'markdown' || rawLang === 'md') {
        filename = `notes_${fileIndex}.md`;
      } else {
        filename = `file_${fileIndex}.txt`;
      }
    }

    // Ensure unique filename
    let finalName = filename;
    let counter = 1;
    while (usedNames.has(finalName)) {
      const parts = filename.split('.');
      if (parts.length > 1) {
        const ext = parts.pop();
        finalName = `${parts.join('.')}_${counter}.${ext}`;
      } else {
        finalName = `${filename}_${counter}`;
      }
      counter++;
    }

    usedNames.add(finalName);
    fileIndex++;

    const bytes = new Blob([codeBody]).size;
    const sizeStr = bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;

    files.push({
      name: finalName,
      content: codeBody,
      language: rawLang,
      size: sizeStr,
    });
  }

  // If no code blocks were found at all, package the full task deliverable as a complete markdown solution file
  if (files.length === 0) {
    const bytes = new Blob([content]).size;
    files.push({
      name: `${sanitizedProjectName}-deliverable.md`,
      content: content,
      language: 'markdown',
      size: bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`,
    });
  }

  // Generate automated README.md if not explicitly generated
  const hasReadme = files.some((f) => f.name.toLowerCase() === 'readme.md');
  const readmeContent = `# ${defaultName.toUpperCase()}
Generated 100% autonomously by **Muhammad 2000 AI Agents Complete Project Engine**.

## 🚀 Project Overview
This project contains the complete, ready-to-run deliverable created by Muhammad 2000 AI Agents.
All source files are fully implemented with zero manual coding or prompt assembly required.

## 📁 Packaged Files (${files.length} Total)
${files.map((f) => `- \`${f.name}\` (${f.size || 'Code file'}, ${f.language || 'text'})`).join('\n')}

## ⚡ How to Run / Open
${
  files.some((f) => f.name.endsWith('.html'))
    ? '1. **Web Project**: Simply double-click `index.html` to launch directly in any web browser (Chrome, Edge, Safari, Firefox).'
    : ''
}
${
  files.some((f) => f.name.endsWith('.py'))
    ? '1. **Python Script**: Run with `python main.py` or `python3 main.py`.'
    : ''
}
${
  files.some((f) => f.name === 'package.json')
    ? '1. **Node.js / TypeScript**: Run `npm install` and then `npm start`.'
    : ''
}
- All logic is self-contained and verified by Muhammad 2000 AI Agents.

---
*Created with Muhammad 2000 AI Studio - Powered by 2,000 Connected Autonomous Reasoning Nodes.*
`;

  if (!hasReadme) {
    files.unshift({
      name: 'README.md',
      content: readmeContent,
      language: 'markdown',
      size: `${(new Blob([readmeContent]).size / 1024).toFixed(1)} KB`,
    });
  }

  return {
    projectName: sanitizedProjectName,
    files,
    readmeText: readmeContent,
  };
}

/**
 * Creates a downloadable binary .ZIP file from project files and triggers client-side download.
 */
export async function downloadProjectAsZip(
  filesOrProject: ProjectFile[] | ExtractedProject,
  projectName: string = 'muhammad-ai-project'
): Promise<{ filename: string; fileCount: number; blob: Blob }> {
  let files: ProjectFile[];
  let name = projectName;
  if (filesOrProject && 'files' in filesOrProject && Array.isArray(filesOrProject.files)) {
    files = filesOrProject.files;
    name = filesOrProject.projectName || projectName;
  } else {
    files = (filesOrProject as ProjectFile[]) || [];
  }

  const zip = new JSZip();

  // Add each file to the zip
  files.forEach((file) => {
    zip.file(file.name, file.content);
  });

  // Generate ZIP blob
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30) || 'project';

  const finalFilename = `muhammad-2000-ai-${cleanName}-${Date.now()}.zip`;

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = finalFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 3000);

  return {
    filename: finalFilename,
    fileCount: files.length,
    blob: zipBlob,
  };
}

/**
 * Builds a unified, standalone, runnable HTML document from the project files.
 * Inlines CSS and JS files if separate so it can run immediately in any browser sandbox or new tab.
 */
export function buildRunnableHtml(files: ProjectFile[]): string | null {
  const htmlFile = files.find((f) => f.name.toLowerCase().endsWith('.html'));
  const cssFiles = files.filter((f) => f.name.toLowerCase().endsWith('.css'));
  const jsFiles = files.filter((f) => f.name.toLowerCase().endsWith('.js'));

  if (htmlFile) {
    let raw = htmlFile.content;

    // Inject all CSS files if external and not yet embedded
    if (cssFiles.length > 0) {
      const combinedCss = cssFiles
        .filter((cf) => !raw.includes(cf.content))
        .map((cf) => `/* Inlined ${cf.name} */\n${cf.content}`)
        .join('\n\n');

      if (combinedCss.trim()) {
        if (raw.includes('</head>')) {
          raw = raw.replace('</head>', `<style>\n${combinedCss}\n</style></head>`);
        } else {
          raw = `<style>\n${combinedCss}\n</style>\n` + raw;
        }
      }
    }

    // Inject all JS files if external and not yet embedded
    if (jsFiles.length > 0) {
      const combinedJs = jsFiles
        .filter((jf) => !raw.includes(jf.content))
        .map((jf) => `/* Inlined ${jf.name} */\n${jf.content}`)
        .join('\n\n');

      if (combinedJs.trim()) {
        const scriptBlock = `<script>\n${combinedJs}\n// Auto-initialize icons if Lucide is loaded\nif (window.lucide && typeof window.lucide.createIcons === 'function') { try { window.lucide.createIcons(); } catch(e){} }\n</script>`;
        if (raw.includes('</body>')) {
          raw = raw.replace('</body>', `${scriptBlock}</body>`);
        } else {
          raw = raw + `\n${scriptBlock}`;
        }
      }
    }

    return raw;
  }

  // If there's JS or CSS without explicit HTML, build a clean modern HTML5 host wrapper
  if (jsFiles.length > 0 || cssFiles.length > 0) {
    const combinedCss = cssFiles.map((c) => c.content).join('\n\n');
    const combinedJs = jsFiles.map((j) => j.content).join('\n\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Muhammad 2000 AI - Live App Launch</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }
    ${combinedCss}
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8">
  <div id="root" class="max-w-5xl mx-auto"></div>
  <div id="app" class="max-w-5xl mx-auto"></div>
  <script>
try {
  ${combinedJs}
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
} catch (err) {
  console.error("Execution error:", err);
  document.body.innerHTML += '<div style="background:#450a0a;color:#fca5a5;padding:16px;margin:24px auto;max-width:650px;border-radius:12px;border:1px solid #dc2626;font-family:monospace;"><strong>Runtime Error:</strong> ' + err.message + '</div>';
}
  </script>
</body>
</html>`;
  }

  return null;
}

/**
 * Directly launches the runnable HTML into a new Google Chrome / browser window or tab.
 */
export function launchInNewBrowserTab(htmlContent: string, title: string = 'App Preview'): boolean {
  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      // Fallback via anchor click if popup was blocked
      const a = document.createElement('a');
      a.href = blobUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    return true;
  } catch (err) {
    console.error('Failed to launch in new tab:', err);
    return false;
  }
}

