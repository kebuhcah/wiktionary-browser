export type RelationshipType =
  | 'derives_from'
  | 'borrowed_from'
  | 'inherited_from'
  | 'cognate_with';

export interface EtymologyWord {
  id: string;
  word: string;
  language: string;
  languageDisplay: string;
  definition?: string;
  partOfSpeech?: string;
  ipa?: string;
}

export interface EtymologyRelationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  notes?: string;
}

export interface EtymologyData {
  words: EtymologyWord[];
  relationships: EtymologyRelationship[];
}

export interface GraphState {
  expandedNodeIds: Set<string>;
  selectedNodeId: string | null;
}
