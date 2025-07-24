// Custom JavaScript for Email Editor to handle Handlebars variables
(function () {
  'use strict';

  // Store original methods
  const originalExportHtml = window.unlayer?.exportHtml;
  const originalLoadDesign = window.unlayer?.loadDesign;

  // Custom Handlebars variable handling
  function processHandlebarsVariables(html) {
    // Replace Handlebars variables with placeholder text for visual editing
    return html.replace(/\{\{([^}]+)\}\}/g, function (match, variable) {
      return `<span class="handlebars-variable" data-variable="${variable.trim()}" style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 3px; font-family: monospace; color: #1976d2;">{{${variable.trim()}}}</span>`;
    });
  }

  function restoreHandlebarsVariables(html) {
    // Restore Handlebars variables from placeholder spans
    return html.replace(
      /<span class="handlebars-variable" data-variable="([^"]+)"[^>]*>\{\{([^}]+)\}\}<\/span>/g,
      '{{$1}}'
    );
  }

  // Override exportHtml to handle Handlebars variables
  if (window.unlayer && originalExportHtml) {
    window.unlayer.exportHtml = function (callback) {
      originalExportHtml.call(this, function (data) {
        // Restore Handlebars variables in the exported HTML
        data.html = restoreHandlebarsVariables(data.html);
        callback(data);
      });
    };
  }

  // Override loadDesign to handle Handlebars variables
  if (window.unlayer && originalLoadDesign) {
    window.unlayer.loadDesign = function (design) {
      // Process Handlebars variables in the design before loading
      if (design && design.body) {
        const processContent = content => {
          if (content && content.blocks) {
            content.blocks.forEach(block => {
              if (block.data && block.data.text) {
                block.data.text = processHandlebarsVariables(block.data.text);
              }
            });
          }
        };

        const processRows = rows => {
          rows.forEach(row => {
            if (row.cells) {
              row.cells.forEach(cell => {
                if (cell.content) {
                  processContent(cell.content);
                }
              });
            }
          });
        };

        if (design.body.rows) {
          processRows(design.body.rows);
        }
      }

      return originalLoadDesign.call(this, design);
    };
  }

  // Add custom toolbar button for Handlebars variables
  function addHandlebarsButton() {
    const toolbar = document.querySelector('.unlayer-toolbar');
    if (toolbar && !document.querySelector('.handlebars-variable-btn')) {
      const button = document.createElement('button');
      button.className = 'handlebars-variable-btn unlayer-toolbar-button';
      button.innerHTML = '{{}}';
      button.title = 'Insert Handlebars Variable';
      button.style.cssText = `
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        padding: 8px 12px;
        margin: 0 4px;
        cursor: pointer;
        font-family: monospace;
        font-weight: bold;
      `;

      button.addEventListener('click', function () {
        const variableName = prompt('Enter variable name:');
        if (variableName) {
          const editor = window.unlayer?.editor;
          if (editor) {
            editor.insertText(`{{${variableName.trim()}}}`);
          }
        }
      });

      toolbar.appendChild(button);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addHandlebarsButton);
  } else {
    addHandlebarsButton();
  }

  // Also try to add button after a delay in case the toolbar loads later
  setTimeout(addHandlebarsButton, 1000);
  setTimeout(addHandlebarsButton, 2000);

  // Expose utility functions globally
  window.EmailEditorUtils = {
    processHandlebarsVariables,
    restoreHandlebarsVariables,
    addHandlebarsButton,
  };
})();
