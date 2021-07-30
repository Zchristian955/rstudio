/*
 * modal.ts
 *
 * Copyright (C) 2021 by RStudio, PBC
 *
 * Unless you have received this program directly from RStudio pursuant
 * to the terms of a commercial license agreement with RStudio, then
 * this program is licensed to you under the terms of version 3 of the
 * GNU Affero General Public License. This program is distributed WITHOUT
 * ANY EXPRESS OR IMPLIED WARRANTY, INCLUDING THOSE OF NON-INFRINGEMENT,
 * MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE. Please refer to the
 * AGPL (http://www.gnu.org/licenses/agpl-3.0.txt) for more details.
 *
 */

import { BrowserWindow } from 'electron';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { err, Expected, ok } from '../core/expected';

export abstract class ModalWindow<T> extends BrowserWindow {

  abstract onShowModal(): Promise<T>;

  private readonly widgetDir: string;
  constructor(widgetDir: string) {
    
    super({
      show: false,
      webPreferences: {
        preload: path.join(widgetDir, 'preload.js'),
      }
    });

    // initialize instance variables
    this.widgetDir = widgetDir;

    // make this look and behave like a modal
    this.setMenu(null);
    this.setMinimizable(false);
    this.setMaximizable(false);
    this.setFullScreenable(false);

  }

  async showModal(): Promise<Expected<T>> {
    
    try {
      const result = await this.showModalImpl();
      return ok(result);
    } catch (error) {
      return err(error);
    }

  }

  async showModalImpl(): Promise<T> {

    // load the associated HTML
    await this.loadFile(path.join(this.widgetDir, 'ui.html'));

    // load any bundled CSS
    const cssStylesPath = path.join(this.widgetDir, 'styles.css');
    if (existsSync(cssStylesPath)) {
      const cssStylesContents = readFileSync(cssStylesPath, { encoding: 'utf-8' });
      this.webContents.send('css', cssStylesContents);
    }

    // load any bundled JavaScript
    const jsLoadPath = path.join(this.widgetDir, 'load.js');
    if (existsSync(jsLoadPath)) {
      const jsLoadContents = readFileSync(jsLoadPath, { encoding: 'utf-8' });
      await this.webContents.executeJavaScript(jsLoadContents);
    }

    // show the window after loading everything
    this.show();

    // delegate to subclass
    const result = await this.onShowModal();

    // return result
    return result;

  }

}