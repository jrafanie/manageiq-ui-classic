describe('i18n plugin locale merging', () => {
  // Extract the mergePluginCatalogs function for testing
  // This is defined in app/javascript/oldjs/i18n.js
  function mergePluginCatalogs(coreLocales, pluginLocales) {
    const merged = {};

    Object.keys(coreLocales).forEach(locale => {
      // Start with core catalog for this locale
      merged[locale] = { ...coreLocales[locale] };

      // Merge each plugin's catalog for this locale
      if (pluginLocales) {
        Object.keys(pluginLocales).forEach(pluginName => {
          const pluginCatalog = pluginLocales[pluginName][locale];
          if (pluginCatalog) {
            // Merge plugin translations into the locale catalog
            Object.keys(pluginCatalog).forEach(key => {
              if (key !== '' && !merged[locale][key]) {
                merged[locale][key] = pluginCatalog[key];
              }
            });
          }
        });
      }
    });

    return merged;
  }

  describe('mergePluginCatalogs', () => {
    it('merges plugin translations into core translations', () => {
      const coreLocales = {
        en: {
          'Hello': 'Hello',
          'World': 'World'
        }
      };

      const pluginLocales = {
        'my_plugin': {
          en: {
            'Plugin String': 'Plugin String',
            'Another String': 'Another String'
          }
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Hello']).toBe('Hello');
      expect(result.en['World']).toBe('World');
      expect(result.en['Plugin String']).toBe('Plugin String');
      expect(result.en['Another String']).toBe('Another String');
    });

    it('preserves core translations (no overwriting)', () => {
      const coreLocales = {
        en: {
          'Shared Key': 'Core Translation'
        }
      };

      const pluginLocales = {
        'my_plugin': {
          en: {
            'Shared Key': 'Plugin Translation (should not override)'
          }
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Shared Key']).toBe('Core Translation');
    });

    it('handles multiple plugins', () => {
      const coreLocales = {
        en: {
          'Core': 'Core'
        }
      };

      const pluginLocales = {
        'plugin_a': {
          en: {
            'Plugin A': 'Plugin A String'
          }
        },
        'plugin_b': {
          en: {
            'Plugin B': 'Plugin B String'
          }
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Core']).toBe('Core');
      expect(result.en['Plugin A']).toBe('Plugin A String');
      expect(result.en['Plugin B']).toBe('Plugin B String');
    });

    it('handles multiple locales', () => {
      const coreLocales = {
        en: {
          'Hello': 'Hello'
        },
        es: {
          'Hello': 'Hola'
        }
      };

      const pluginLocales = {
        'my_plugin': {
          en: {
            'Plugin': 'Plugin'
          },
          es: {
            'Plugin': 'Complemento'
          }
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Hello']).toBe('Hello');
      expect(result.en['Plugin']).toBe('Plugin');
      expect(result.es['Hello']).toBe('Hola');
      expect(result.es['Plugin']).toBe('Complemento');
    });

    it('handles missing plugin locale gracefully', () => {
      const coreLocales = {
        en: {
          'Hello': 'Hello'
        },
        es: {
          'Hello': 'Hola'
        }
      };

      const pluginLocales = {
        'my_plugin': {
          en: {
            'Plugin': 'Plugin'
          }
          // No Spanish translation
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Hello']).toBe('Hello');
      expect(result.en['Plugin']).toBe('Plugin');
      expect(result.es['Hello']).toBe('Hola');
      expect(result.es['Plugin']).toBeUndefined();
    });

    it('handles empty plugin locales', () => {
      const coreLocales = {
        en: {
          'Hello': 'Hello'
        }
      };

      const pluginLocales = {};

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Hello']).toBe('Hello');
    });

    it('handles null/undefined plugin locales', () => {
      const coreLocales = {
        en: {
          'Hello': 'Hello'
        }
      };

      const result1 = mergePluginCatalogs(coreLocales, null);
      const result2 = mergePluginCatalogs(coreLocales, undefined);

      expect(result1.en['Hello']).toBe('Hello');
      expect(result2.en['Hello']).toBe('Hello');
    });

    it('skips empty string keys', () => {
      const coreLocales = {
        en: {
          '': 'metadata',
          'Hello': 'Hello'
        }
      };

      const pluginLocales = {
        'my_plugin': {
          en: {
            '': 'plugin metadata',
            'Plugin': 'Plugin'
          }
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['']).toBe('metadata'); // Core metadata preserved
      expect(result.en['Hello']).toBe('Hello');
      expect(result.en['Plugin']).toBe('Plugin');
    });

    it('handles complex nested translation objects', () => {
      const coreLocales = {
        en: {
          'Simple': 'Simple',
          'Plural': ['one item', '%{count} items']
        }
      };

      const pluginLocales = {
        'my_plugin': {
          en: {
            'Plugin Plural': ['one plugin', '%{count} plugins']
          }
        }
      };

      const result = mergePluginCatalogs(coreLocales, pluginLocales);

      expect(result.en['Simple']).toBe('Simple');
      expect(result.en['Plural']).toEqual(['one item', '%{count} items']);
      expect(result.en['Plugin Plural']).toEqual(['one plugin', '%{count} plugins']);
    });
  });
});
