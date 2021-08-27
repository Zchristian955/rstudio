/*
 * FileCommandToolbar.java
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
package org.rstudio.studio.client.workbench.views.files.ui;

import com.google.inject.Inject;

import org.rstudio.core.client.ElementIds;
import org.rstudio.core.client.resources.ImageResource2x;
import org.rstudio.core.client.theme.res.ThemeStyles;
import org.rstudio.core.client.widget.Toolbar;
import org.rstudio.core.client.widget.ToolbarButton;
import org.rstudio.core.client.widget.ToolbarMenuButton;
import org.rstudio.core.client.widget.ToolbarPopupMenu;
import org.rstudio.core.client.widget.UserPrefMenuItem;
import org.rstudio.studio.client.common.icons.StandardIcons;
import org.rstudio.studio.client.workbench.commands.Commands;
import org.rstudio.studio.client.workbench.prefs.model.UserPrefs;

public class FileCommandToolbar extends Toolbar
{
   @Inject
   public FileCommandToolbar(Commands commands, UserPrefs prefs)
   {
      super("File Commands");
      StandardIcons icons = StandardIcons.INSTANCE;

      addLeftWidget(commands.newFolder().createToolbarButton());
      addLeftSeparator();
      
      // New File Menu
      ToolbarPopupMenu newFileMenu = new ToolbarPopupMenu();
      newFileMenu.addItem(commands.touchSourceDoc().createMenuItem(false));
      newFileMenu.addSeparator();
      newFileMenu.addItem(commands.touchRNotebook().createMenuItem(false));
      newFileMenu.addItem(commands.touchRMarkdownDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchQuartoDoc().createMenuItem(false));
      newFileMenu.addSeparator();
      // these two commands will automatically set up files and folders,
      // so they do not need touch commands
      newFileMenu.addItem(commands.newRShinyApp().createMenuItem(false));
      newFileMenu.addItem(commands.newRPlumberDoc().createMenuItem(false));
      newFileMenu.addSeparator();
      newFileMenu.addItem(commands.touchTextDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchCppDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchPythonDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchSqlDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchStanDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchD3Doc().createMenuItem(false));
      newFileMenu.addSeparator();
      newFileMenu.addItem(commands.touchSweaveDoc().createMenuItem(false));
      newFileMenu.addItem(commands.touchRHTMLDoc().createMenuItem(false));

      ToolbarMenuButton newFileButton = new ToolbarMenuButton(
            "Create New File",
            "Create and open a new empty file",
            new ImageResource2x(icons.stock_new2x()),
            newFileMenu);
      ElementIds.assignElementId(newFileButton, ElementIds.MB_FILES_TOUCH_FILE);
      addLeftWidget(newFileButton);
      addLeftSeparator();
      
      addLeftWidget(commands.uploadFile().createToolbarButton());
      addLeftSeparator();
      addLeftWidget(commands.deleteFiles().createToolbarButton());
      addLeftWidget(commands.renameFile().createToolbarButton());
      addLeftSeparator();

      // More
      ToolbarPopupMenu moreMenu = new ToolbarPopupMenu();
      moreMenu.addItem(commands.copyFile().createMenuItem(false));
      moreMenu.addItem(commands.copyFileTo().createMenuItem(false));
      moreMenu.addItem(commands.moveFiles().createMenuItem(false));
      moreMenu.addItem(commands.copyFilesPaneCurrentDirectory().createMenuItem(false));
      moreMenu.addSeparator();
      moreMenu.addItem(commands.exportFiles().createMenuItem(false));
      moreMenu.addSeparator();
      moreMenu.addItem(commands.setAsWorkingDir().createMenuItem(false));
      moreMenu.addItem(commands.goToWorkingDir().createMenuItem(false));
      moreMenu.addItem(new UserPrefMenuItem<>(prefs.syncFilesPaneWorkingDir(), true,
         "Synchronize Working Directory", prefs));
      moreMenu.addSeparator();
      moreMenu.addItem(commands.openNewTerminalAtFilePaneLocation().createMenuItem(false));
      moreMenu.addSeparator();
      moreMenu.addItem(commands.showFolder().createMenuItem(false));
      moreMenu.addSeparator();
      moreMenu.addItem(new UserPrefMenuItem<>(prefs.showHiddenFiles(), true, "Show Hidden Files", prefs));

      ToolbarMenuButton moreButton = new ToolbarMenuButton(
            "More",
            "More file commands",
            new ImageResource2x(icons.more_actions2x()),
            moreMenu);
      ElementIds.assignElementId(moreButton, ElementIds.MB_FILES_MORE);
      addLeftWidget(moreButton);

      // Refresh
      ToolbarButton refreshButton = commands.refreshFiles().createToolbarButton();
      refreshButton.addStyleName(ThemeStyles.INSTANCE.refreshToolbarButton());
      addRightWidget(refreshButton);
   }
}
