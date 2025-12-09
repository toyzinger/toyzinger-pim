import { Component, inject, signal, computed, effect } from '@angular/core';
import { DimensionNode, SPECIAL_DIM_FOLDERS } from '../../features/dimensions/dimensions.model';
import { DimensionFoldersService } from '../../features/dimensions/dimension-folders.service';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { DimensionFoldersItem } from './dimension-folders-item/dimension-folders-item';

@Component({
  selector: 'app-dimension-folders',
  imports: [DimensionFoldersItem],
  templateUrl: './dimension-folders.html',
  styleUrl: './dimension-folders.scss',
})
export class DimensionFolders {
  private dimensionFoldersService = inject(DimensionFoldersService);
  private franchiseService = inject(FranchiseService);
  private collectionService = inject(CollectionService);
  private subCollectionService = inject(SubCollectionService);

  // ============ UI STATE ==================

  loading = signal<boolean>(false);
  expandedNodeIds = signal<Set<string>>(new Set());

  // Expose service signal for template
  selectedNodeId = this.dimensionFoldersService.selectedNodeId;

  // ============ COMPUTED VALUES ==================

  // Build the flat list of all nodes
  allNodes = computed<DimensionNode[]>(() => {
    const nodes: DimensionNode[] = [];

    // Special folder - Unassigned at the top
    nodes.push({
      id: SPECIAL_DIM_FOLDERS.UNASSIGNED,
      name: 'Unassigned',
      type: 'special',
      isDroppable: true,
    });

    // Franchises (root level) - sorted alphabetically
    const sortedFranchises = [...this.franchiseService.franchises()]
      .sort((a, b) => {
        const nameA = a.name?.en || a.name?.es || '';
        const nameB = b.name?.en || b.name?.es || '';
        return nameA.localeCompare(nameB);
      });

    for (const franchise of sortedFranchises) {
      nodes.push({
        id: franchise.id!,
        name: franchise.name?.en || franchise.name?.es || 'Unnamed Franchise',
        type: 'franchise',
        isDroppable: false,
      });
    }

    // Collections (children of their franchise)
    for (const collection of this.collectionService.collections()) {
      nodes.push({
        id: collection.id!,
        name: collection.name?.en || collection.name?.es || 'Unnamed Collection',
        type: 'collection',
        parentId: collection.franchiseId,
        isDroppable: false,
        years: collection.years,
      });
    }

    // SubCollections (children of their collection)
    for (const subcollection of this.subCollectionService.subcollections()) {
      nodes.push({
        id: subcollection.id!,
        name: subcollection.name?.en || subcollection.name?.es || 'Unnamed SubCollection',
        type: 'subcollection',
        parentId: subcollection.collectionId,
        isDroppable: true,
      });
    }

    return nodes;
  });

  // Root nodes (no parentId)
  rootNodes = computed<DimensionNode[]>(() => {
    return this.allNodes().filter(n => !n.parentId);
  });

  // Set of active node IDs (selected node + ancestors)
  activeNodeIds = computed<Set<string>>(() => {
    const selectedId = this.selectedNodeId();
    const activeIds = new Set<string>();

    if (!selectedId) return activeIds;

    // Add selected node
    activeIds.add(selectedId);

    // Build map for easy lookup
    const nodeMap = new Map<string, DimensionNode>();
    for (const node of this.allNodes()) {
      nodeMap.set(node.id, node);
    }

    // Traverse up to find ancestors
    let currentNode = nodeMap.get(selectedId);
    while (currentNode && currentNode.parentId) {
      activeIds.add(currentNode.parentId);
      currentNode = nodeMap.get(currentNode.parentId);
    }

    return activeIds;
  });

  constructor() {
    // Auto-expand active nodes (selected node path)
    effect(() => {
      const activeIds = this.activeNodeIds();
      if (activeIds.size > 0) {
        this.expandedNodeIds.update(current => {
          const next = new Set(current);
          activeIds.forEach(id => next.add(id));
          return next;
        });
      }
    });
  }

  // ============ ACTIONS ==================

  selectNode(node: DimensionNode) {
    this.dimensionFoldersService.selectNode(node.id);
  }

  toggleNode(nodeId: string) {
    this.expandedNodeIds.update(set => {
      const newSet = new Set(set);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }

  collapseAll() {
    this.expandedNodeIds.set(new Set());
  }

  // ============ LIFECYCLE ==================

  async ngOnInit() {
    this.loading.set(true);
    try {
      await Promise.all([
        this.franchiseService.ensureFranchisesLoaded(),
        this.collectionService.ensureCollectionsLoaded(),
        this.subCollectionService.ensureSubCollectionsLoaded(),
      ]);
    } finally {
      this.loading.set(false);
    }
  }
}
