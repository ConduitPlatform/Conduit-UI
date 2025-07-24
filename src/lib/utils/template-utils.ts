import * as handlebars from 'handlebars';

/**
 * Extract Handlebars variables from HTML template
 */
export function extractHandlebarsVariables(html: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = html.match(regex);
  if (!matches) return [];

  return matches
    .map(match => match.replace(/\{\{|\}\}/g, '').trim())
    .filter(variable => {
      // Filter out Handlebars helpers and partials
      return (
        !variable.startsWith('#') &&
        !variable.startsWith('/') &&
        !variable.startsWith('>') &&
        !variable.startsWith('^') &&
        !variable.startsWith('else')
      );
    })
    .filter((variable, index, arr) => arr.indexOf(variable) === index); // Remove duplicates
}

/**
 * Validate Handlebars template syntax
 */
export function validateHandlebarsTemplate(html: string): {
  isValid: boolean;
  error?: string;
} {
  try {
    handlebars.compile(html);
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error ? error.message : 'Unknown Handlebars error',
    };
  }
}

/**
 * Compile Handlebars template with variables
 */
export function compileHandlebarsTemplate(
  html: string,
  variables: Record<string, any>
): string {
  try {
    const template = handlebars.compile(html);
    return template(variables);
  } catch (error) {
    console.error('Failed to compile Handlebars template:', error);
    return html; // Return original HTML if compilation fails
  }
}

/**
 * Create a minimal fallback design that's guaranteed to work
 */
export function createFallbackDesign(): any {
  return {
    body: {
      rows: [
        {
          cells: [
            {
              content: {
                blocks: [
                  {
                    type: 'text',
                    data: {
                      text: '<p>Template content</p>',
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    counters: {},
    metadata: {
      version: '1.0',
    },
  };
}

/**
 * Create a basic visual editor design from HTML
 */
export function createBasicVisualDesign(html: string) {
  // Ensure we have valid HTML content
  const safeHtml = html || '<p>Template content</p>';

  // Create a more robust design structure that the visual editor expects
  return {
    body: {
      rows: [
        {
          cells: [
            {
              content: {
                blocks: [
                  {
                    type: 'text',
                    data: {
                      text: safeHtml,
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
    counters: {},
    design: {
      body: {
        rows: [
          {
            cells: [
              {
                content: {
                  blocks: [
                    {
                      type: 'text',
                      data: {
                        text: safeHtml,
                      },
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    },
    // Add additional properties that the editor might expect
    metadata: {
      version: '1.0',
    },
    settings: {
      responsive: true,
    },
  };
}

/**
 * Process Handlebars variables for visual editor display
 */
export function processHandlebarsForVisualEditor(html: string): string {
  return html.replace(/\{\{([^}]+)\}\}/g, function (match, variable) {
    return `<span class="handlebars-variable" data-variable="${variable.trim()}" style="background-color: #e3f2fd; padding: 2px 4px; border-radius: 3px; font-family: monospace; color: #1976d2;">{{${variable.trim()}}}</span>`;
  });
}

/**
 * Restore Handlebars variables from visual editor format
 */
export function restoreHandlebarsFromVisualEditor(html: string): string {
  return html.replace(
    /<span class="handlebars-variable" data-variable="([^"]+)"[^>]*>\{\{([^}]+)\}\}<\/span>/g,
    '{{$1}}'
  );
}

/**
 * Generate sample data for template preview
 */
export function generateSampleData(
  variables: string[]
): Record<string, string> {
  const sampleData: Record<string, string> = {};

  variables.forEach(variable => {
    // Generate appropriate sample data based on variable name
    const lowerVar = variable.toLowerCase();

    if (lowerVar.includes('name') || lowerVar.includes('user')) {
      sampleData[variable] = 'John Doe';
    } else if (lowerVar.includes('email')) {
      sampleData[variable] = 'john.doe@example.com';
    } else if (
      lowerVar.includes('company') ||
      lowerVar.includes('organization')
    ) {
      sampleData[variable] = 'Acme Corporation';
    } else if (lowerVar.includes('date')) {
      sampleData[variable] = new Date().toLocaleDateString();
    } else if (lowerVar.includes('url') || lowerVar.includes('link')) {
      sampleData[variable] = 'https://example.com';
    } else if (lowerVar.includes('phone') || lowerVar.includes('tel')) {
      sampleData[variable] = '+1 (555) 123-4567';
    } else if (lowerVar.includes('address')) {
      sampleData[variable] = '123 Main St, City, State 12345';
    } else {
      sampleData[variable] = `[${variable}]`;
    }
  });

  return sampleData;
}

/**
 * Check if template can be edited in visual editor
 */
export function canUseVisualEditor(template: {
  jsonTemplate?: string;
  externalManaged?: boolean;
}): boolean {
  return !!template.jsonTemplate && !template.externalManaged;
}

/**
 * Check if template is externally managed
 */
export function isExternallyManaged(template: {
  externalManaged?: boolean;
}): boolean {
  return !!template.externalManaged;
}

/**
 * Sanitize variable name for safe usage
 */
export function sanitizeVariableName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_') // Replace invalid chars with underscore
    .replace(/^[0-9]/, '_$&') // Prefix with underscore if starts with number
    .toLowerCase();
}

/**
 * Validate variable name
 */
export function validateVariableName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name.trim()) {
    return { isValid: false, error: 'Variable name cannot be empty' };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      error: 'Variable name cannot exceed 50 characters',
    };
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
    return {
      isValid: false,
      error:
        'Variable name must start with a letter or underscore and contain only letters, numbers, and underscores',
    };
  }

  return { isValid: true };
}
