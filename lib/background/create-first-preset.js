import request from 'superagent';

// Constants
import { XYBUTTONS_URL } from 'constants/config';

// Modules
import downloadPresets from 'lib/shared/presets/download';

/**
 * Creates an anonymous preset for users who aren't logged in and have no
 * presets created.
 * @module lib/background/create-first-preset
 */
export default function() {
  
  chrome.p.storage.local.get([
    'account', 'modkeys', 'presets'
  ])
  .then(result => {
    if (
      (!Array.isArray(result.presets) || !result.presets.length) &&
      (!result.account || result.account.uid == 0)
    ) {
      return new Promise((resolve, reject) => {
        request
          .post(XYBUTTONS_URL + 'api/presets')
          .send({
            name: 'My Preset', urlMatch: '.*', domains: '*', isListed: false,
            description: 'All buttons will work with this preset.', key: true
          })
          .end((err, res) => {
            if (!err && !res.body.error) {
              if (result.modkeys) {
                result.modkeys.presets[res.body.id] = res.body.modKey;
              }
              else {
                result.modkeys = {
                  buttons: {}, presets: { [res.body.id]: res.body.modKey }
                };
              }

              const next = () => chrome.p.storage.local.set({
                modkeys: result.modkeys
              });
              downloadPresets([{ id: res.body.id }]).then(next).catch(next);
            }
          });
      });
    }
  })
  .catch(err => {
    console.log('lib/background/create-first-preset:', err);
  });

}