require('./locale/');
require('gettext_i18n_rails_js/vendor/assets/javascripts/gettext/jed.js');
require('gettext_i18n_rails_js/lib/assets/javascripts/gettext/all.js');
require('./miq_global.js');

// Merge plugin catalogs into core catalog
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

$(function() {
  // Merge core and plugin locales
  const allLocales = mergePluginCatalogs(
    window.locales || {},
    window.pluginLocales || {}
  );

  // Set locale with merged catalogs
  const locale = (ManageIQ && ManageIQ.i18n && ManageIQ.i18n.locale) || 'en';
  if (allLocales[locale]) {
    // Update window.locales with merged catalogs for i18n to use
    window.locales = allLocales;
  }

  // set in layouts/i18n_js
  if (ManageIQ && ManageIQ.i18n && ManageIQ.i18n.mark_translated_strings) {
    window.__ = function() {
      return '\u00BB' + i18n.gettext.apply(i18n, arguments) + '\u00AB';
    };
    window.n__ = function() {
      return '\u00BB' + i18n.ngettext.apply(i18n, arguments) + '\u00AB';
    };
  }
});
