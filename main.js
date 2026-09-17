/*
 * Clean Clipper Pro - Obsidian Community Plugin
 * 100% Offline, Zero Cloud Dependency, Built-in Funding
 */
let obsidian;
try {
  obsidian = require('obsidian');
} catch (e) {
  // Local testing fallback mock
  obsidian = {
    Plugin: class {
      addCommand() {}
      addRibbonIcon() {}
    },
    Notice: class {
      constructor(msg) { this.msg = msg; }
    }
  };
}

function cleanHtmlToMarkdown(html) {
  if (!html) return '';
  let md = html;

  // Strip script, style, head, nav
  md = md.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  md = md.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  md = md.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, '');
  md = md.replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, '');
  md = md.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, '');

  // Convert headings
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');

  // Convert fenced code blocks FIRST before inline code
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '\n```\n$1\n```\n');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

  // Convert bold, italic, code
  md = md.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  md = md.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, '`$1`');

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

  // Convert lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n');
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md.replace(/&nbsp;/g, ' ')
         .replace(/&amp;/g, '&')
         .replace(/&lt;/g, '<')
         .replace(/&gt;/g, '>')
         .replace(/&quot;/g, '"');

  // Clean empty lines
  md = md.split('\n').map(l => l.trimEnd()).filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n');
  return md.trim();
}

class CleanClipperPlugin extends obsidian.Plugin {
  async onload() {
    console.log('Clean Clipper Pro loaded.');

    // Add ribbon icon
    this.addRibbonIcon('scissors', 'Clean Clipper: Paste Clean Markdown', async () => {
      await this.pasteCleanMarkdown();
    });

    // Add editor command
    this.addCommand({
      id: 'clean-clipper-paste',
      name: 'Paste Clipboard HTML as Clean Markdown',
      editorCallback: async (editor) => {
        try {
          const clipboardText = await navigator.clipboard.readText();
          const cleaned = cleanHtmlToMarkdown(clipboardText);
          editor.replaceSelection(cleaned);
          new obsidian.Notice('✅ Clipped clean Markdown pasted!');
        } catch (err) {
          new obsidian.Notice('⚠️ Clipboard access error');
        }
      }
    });
  }

  async pasteCleanMarkdown() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const cleaned = cleanHtmlToMarkdown(clipboardText);
      const activeLeaf = this.app.workspace.activeLeaf;
      if (activeLeaf && activeLeaf.view && activeLeaf.view.editor) {
        activeLeaf.view.editor.replaceSelection(cleaned);
        new obsidian.Notice('✅ Clean Markdown pasted!');
      }
    } catch (e) {
      // fallback
    }
  }

  onunload() {
    console.log('Clean Clipper Pro unloaded.');
  }
}

module.exports = CleanClipperPlugin;
module.exports.cleanHtmlToMarkdown = cleanHtmlToMarkdown;
