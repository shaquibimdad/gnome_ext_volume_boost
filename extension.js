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

import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { QuickToggle, SystemIndicator } from 'resource:///org/gnome/shell/ui/quickSettings.js';

const VolumeBoostToggle = GObject.registerClass(
class VolumeBoostToggle extends QuickToggle {
    _init() {
        super._init({
            title: _('Volume Boost'),
            iconName: 'audio-volume-high-symbolic',
            toggleMode: true,
        });

        this._soundSettings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.sound',
        });

        this._soundSettings.bind(
            'allow-volume-above-100-percent',
            this,
            'checked',
            Gio.SettingsBindFlags.DEFAULT
        );
    }
});

const Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this._toggle = new VolumeBoostToggle();
        this.quickSettingsItems.push(this._toggle);
    }
});

export default class VolumeBoostExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.statusArea.quickSettings.addExternalIndicator(this._indicator);

        // Enable volume boost feature
        const soundSettings = new Gio.Settings({
            schema_id: 'org.gnome.desktop.sound',
        });
        soundSettings.set_boolean('allow-volume-above-100-percent', true);

        // Connect to PulseAudio
        this._pulseInterface = Gio.DBusProxy.makeProxyWrapper(`
            <node>
                <interface name="org.PulseAudio.Core1.Device">
                    <property name="Volume" type="d" access="readwrite"/>
                    <property name="BaseVolume" type="d" access="read"/>
                </interface>
            </node>
        `);

        this._pulseProxy = new Gio.DBusProxy({
            g_connection: Gio.DBus.session,
            g_interface_name: 'org.PulseAudio.Core1.Device',
            g_name: 'org.PulseAudio1',
            g_object_path: '/org/pulseaudio/core1/sink0',
            g_interface_info: null,
        });

        this._pulseProxy.init_async(0, null, null);
    }

    async disable() {
        // Don't force disable volume boost setting (keep user preference)
        // const soundSettings = new Gio.Settings({
        //     schema_id: 'org.gnome.desktop.sound',
        // });
        // soundSettings.set_boolean('allow-volume-above-100-percent', false);

        try {
            // Reset volume to 100% if needed
            await this._pulseProxy.init_async(0, null, null);
            const volume = await this._pulseProxy.get_volume();
            const baseVolume = await this._pulseProxy.get_base_volume();

            if (volume > baseVolume) {
                this._pulseProxy.set_volume(baseVolume);
            }
        } catch (e) {
            logError(e, 'Failed to reset volume');
        }

        // Clean up
        this._indicator.quickSettingsItems.forEach(item => item.destroy());
        this._indicator.destroy();
        this._indicator = null;
        this._pulseProxy = null;
    }
}