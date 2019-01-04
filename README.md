# EP Logger

A module for tera proxy that is logging EP data to log files.

## Commands

Activating/Deactivating module when entering command ``epl``, ``ep-log`` or ``ep-logger``.

## Subcommands
- **help**: Displays help text.
- **config**: Opens config window when started with proxy gui.

# Install

1. Create directory in tera ``.../tera proxy/mods/`` and name it e.g. ep-logger
2. Download [module.json][4] of ep-logger to the created folder
3. Start [Caali Tera Proxy][5] to auto install it

# Dependencies

**Note:** This module might only work with [Caali Tera Proxy][5]. Not tested with others.

It depends on [util-lib][3]. You don't need to install it manually (if using [Caali Tera Proxy][5]),
but if you like/need to:
1. Create a directory in tera ``.../tera proxy/mods/`` named "util-lib". Should be exactly the name. Otherwise the module won't detect it.
2. Auto update available? yes, then skip 3. Otherwise continue.
3. Download zip from [util-lib][7] and extract everything (but .gitignore, .eslint.rc, manifest.json) to the just created folder. Skip 4.
4. Download [module.json][6] of util-lib to the just created folder.
5. Start [Caali Tera Proxy][5] (to auto install it)

# Known Issues

- In help the status of EP-Logger is displayed as "activated" although it is deactivated.

# ToDo

- Fix displayed activated/deactivated.


[1]: #todo "~89% of the real soft cap"
[2]: #todo "source for ep exp like \"Island of Dawn\""
[3]: https://github.com/aurelius88/util-lib/
[4]: https://raw.githubusercontent.com/aurelius88/ep-logger/master/module.json
[5]: https://github.com/caali-hackerman/tera-proxy
[6]: https://raw.githubusercontent.com/aurelius88/util-lib/master/module.json
[7]: https://github.com/aurelius88/util-lib/archive/master.zip
