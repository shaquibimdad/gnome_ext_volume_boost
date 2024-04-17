/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

import GObject from "gi://GObject";
import Gio from "gi://Gio";
import * as Main from "resource:///org/gnome/shell/ui/main.js";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";
import {
  QuickToggle,
  SystemIndicator,
} from "resource:///org/gnome/shell/ui/quickSettings.js";

const VolumeBoostToggle = GObject.registerClass(
  class VolumeBoostToggle extends QuickToggle {
    constructor() {
      super({
        title: _("Boost Volume"),
        iconName: "org.gnome.Settings-sound-symbolic",
        toggleMode: true,
      });
      this._soundSettings = new Gio.Settings({
        schema_id: "org.gnome.desktop.sound",
      });
      this._soundSettings.bind(
        "allow-volume-above-100-percent",
        this,
        "checked",
        Gio.SettingsBindFlags.DEFAULT
      );
    }
  }
);

const Indicator = GObject.registerClass(
  class Indicator extends SystemIndicator {
    constructor() {
      super();
      const toggle = new VolumeBoostToggle();
      this.quickSettingsItems.push(toggle);
    }
  }
);

export default class QuickSettingsExampleExtension extends Extension {
  enable() {
    this._indicator = new Indicator();
    Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);
  }

  disable() {
    this._indicator.quickSettingsItems.forEach((item) => item.destroy());
    this._indicator.destroy();
    this._indicator = null;
  }
}
