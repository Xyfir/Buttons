/**
 * Updates the `presets` array in local storage to reflect the preset objects
 * in storage at `preset_[id]`.
 * @module lib/app/presets/update-array
 * @returns {Promise} A promise that always resolves.
 */
export default function() {

  return new Promise(resolve => {
    chrome.p.storage.local.get(null)
      .then(storage => {
        storage.presets = Object.keys(storage)
          .filter(key => key.indexOf('preset_') == 0)
          .map(key => {
            const p = storage[key];
            return { id: p.id, urlMatch: p.urlMatch, updated: p.updated };
          });

        return chrome.p.storage.local.set(storage);
      })
      .then(() => resolve());
  });

}