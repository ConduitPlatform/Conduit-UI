import * as handlebars from 'handlebars';

export function extractHandlebarsVariables(html: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = html.match(regex);
  if (!matches) return [];

  return matches
    .map(match => match.replace(/\{\{|\}\}/g, '').trim())
    .filter(variable => {
      return (
        !variable.startsWith('#') &&
        !variable.startsWith('/') &&
        !variable.startsWith('>') &&
        !variable.startsWith('^') &&
        !variable.startsWith('else')
      );
    })
    .filter((variable, index, arr) => arr.indexOf(variable) === index);
}

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

export function compileHandlebarsTemplate(
  html: string,
  variables: Record<string, any>
): string {
  try {
    const template = handlebars.compile(html);
    return template(variables);
  } catch (error) {
    console.error('Failed to compile Handlebars template:', error);
    return html;
  }
}

export function generateSampleData(
  variables: string[]
): Record<string, string> {
  const sampleData: Record<string, string> = {};

  variables.forEach(variable => {
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

export function isExternallyManaged(template: {
  externalManaged?: boolean;
}): boolean {
  return !!template.externalManaged;
}

export function sanitizeVariableName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .replace(/^[0-9]/, '_$&')
    .toLowerCase();
}

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
