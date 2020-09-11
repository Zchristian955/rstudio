/*
 * insert_citation-source-panel-crossref.tsx
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


import React from "react";

import { EditorUI } from "../../../api/ui";
import { suggestCiteId, formatAuthors, formatIssuedDate } from "../../../api/cite";
import { sanitizeForCiteproc, CSL } from "../../../api/csl";

import { CitationSourcePanelProps, CitationSourcePanelProvider, CitationListEntry } from "../insert_citation-panel";
import { CitationSourceLatentSearchPanel } from "./insert_citation-source-panel-latent-search";
import { CrossrefWork, imageForCrossrefType, CrossrefServer } from "../../../api/crossref";
import { CitationSourceListStatus } from "./insert_citation-source-panel-list";
import { DOIServer } from "../../../api/doi";

export function crossrefSourcePanel(ui: EditorUI, server: CrossrefServer): CitationSourcePanelProvider {

  const kCrossrefType = 'Crossref';
  return {
    key: 'E38370AA-78AE-450B-BBE8-878E1C817C04',
    panel: CrossRefSourcePanel,
    treeNode: () => {
      return {
        key: 'CrossRef',
        name: ui.context.translateText('Crossref'),
        image: ui.images.citations?.crossref,
        type: kCrossrefType,
        children: [],
        expanded: true
      };
    }
  };
}

export const CrossRefSourcePanel = React.forwardRef<HTMLDivElement, CitationSourcePanelProps>((props: CitationSourcePanelProps, ref) => {
  const [citations, setCitations] = React.useState<CitationListEntry[]>([]);
  const [status, setStatus] = React.useState<CitationSourceListStatus>(CitationSourceListStatus.default);

  // Track whether we are mounted to allow a latent search that returns after the 
  // component unmounts to nmot mutate state further
  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const doSearch = (search: string) => {
    const performSearch = async () => {
      if (isMounted.current) {
        setStatus(CitationSourceListStatus.loading);
      }
      const works = await props.server.crossref.works(search);

      // Get the list of ids already in the bibliography
      const existingIds = props.bibliographyManager.localSources().map(src => src.id);

      const citationEntries = works.items.map(work => {
        const citationEntry = toCitationEntry(work, existingIds, props.ui, props.server.doi);
        if (citationEntry) {
          // Add this id to the list of existing Ids so future ids will de-duplicate against this one
          existingIds.push(citationEntry.id);
        }
        return citationEntry;
      });

      if (isMounted.current) {
        setCitations(citationEntries);
        setStatus(citationEntries.length > 0 ? CitationSourceListStatus.default : CitationSourceListStatus.noResults);
      }
    };

    // Either do the search, or if the search is empty, clear the results
    if (search.length > 0) {
      performSearch();
    } else {
      setCitations([]);
    }
  };

  return (
    <CitationSourceLatentSearchPanel
      height={props.height}
      citations={citations}
      citationsToAdd={props.citationsToAdd}
      addCitation={props.addCitation}
      removeCitation={props.removeCitation}
      selectedCitation={props.selectedCitation}
      doSearch={doSearch}
      confirm={props.confirm}
      status={status}
      defaultText={props.ui.context.translateText('Enter terms to search Crossref')}
      placeholderText={props.ui.context.translateText('Search Crossref for Citations')}
      ui={props.ui}
      ref={ref}
    />
  );
});

function toCitationEntry(crossrefWork: CrossrefWork, existingIds: string[], ui: EditorUI, doiServer: DOIServer): CitationListEntry {

  const coercedCSL = sanitizeForCiteproc(crossrefWork as unknown as CSL);
  const id = suggestCiteId(existingIds, coercedCSL);
  const providerKey = 'crossref';
  return {
    id,
    title: crossrefWorkTitle(crossrefWork, ui),
    providerKey,
    authors: (length: number) => {
      return formatAuthors(coercedCSL.author, length);
    },
    date: formatIssuedDate(crossrefWork.issued),
    journal: '',
    image: imageForCrossrefType(ui, crossrefWork.type)[0],
    toBibliographySource: async () => {

      // Generate CSL using the DOI
      return doiServer.fetchCSL(crossrefWork.DOI, 1000).then(doiResult => {
        const csl = doiResult.message as CSL;
        return { id, providerKey, ...csl };
      });
    }
  };
}


function crossrefWorkTitle(work: CrossrefWork, ui: EditorUI) {
  if (work.title) {
    return work.title[0];
  } else if (work["container-title"]) {
    return work["container-title"][0];
  } else if (work["short-container-title"]) {
    return work["short-container-title"];
  } else {
    return ui.context.translateText('(Untitled)');
  }
}
