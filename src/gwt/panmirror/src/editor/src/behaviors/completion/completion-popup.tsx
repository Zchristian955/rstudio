/*
 * completion-popup.tsx
 *
 * Copyright (C) 2020 by RStudio, PBC
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

import React from 'react';

import { WidgetProps } from "../../api/widgets/react";
import { Popup } from '../../api/widgets/popup';

import { FixedSizeList, ListChildComponentProps } from "react-window";

interface CompletionPopupProps extends WidgetProps {
  completions: any[];
  listItemComponent: React.FC<ListChildComponentProps>;
  rowHeight?: number;
  height?: number;
}
const kCompletionPopupWidth = 200;

export const CompletionPopup: React.FC<CompletionPopupProps> = props => {
  const { rowHeight = 25, height = 200 } = props;

  return (
    <Popup 
      style={props.style}
      classes={props.classes}
    >
      <FixedSizeList
        itemCount={props.completions.length}
        itemSize={rowHeight}
        height={height}
        width={kCompletionPopupWidth}
        itemData={props.completions}>
        {props.listItemComponent}
      </FixedSizeList>   
    </Popup>
  );
};