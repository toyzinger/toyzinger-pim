import { Component, inject, signal, computed, effect, input } from '@angular/core';
import { DimensionNode, SPECIAL_DIM_FOLDERS } from '../../features/dimensions/dimensions.model';
import { DimensionFoldersService } from '../../features/dimensions/dimension-folders.service';
import { FranchiseService } from '../../features/dimensions/franchise/franchise.service';
import { CollectionService } from '../../features/dimensions/collection/collection.service';
import { SubCollectionService } from '../../features/dimensions/subcollection/subcollection.service';
import { ProductsService } from '../../features/products/products.service';
import { ImagesService } from '../../features/pimages/pimages.service';
import { DimensionFoldersItem } from './dimension-folders-item/dimension-folders-item';
import { ContextType } from '../../features/global/global.model';

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
  private productsService = inject(ProductsService);
  private imagesService = inject(ImagesService);

  // ============ INPUTS ==================

  /**
   * Mode to determine which counts to show
   * 'products' - Show product counts
   * 'images' - Show image counts
   */
  mode = input<ContextType>('products');

  // ============ UI STATE ==================

  loading = signal<boolean>(true);

  // Expose service signals for template
  selectedNodeId = this.dimensionFoldersService.selectedNodeId;
  expandedNodeIds = this.dimensionFoldersService.expandedNodeIds;

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

    // SubCollections (children of their collection) - sorted by order
    const sortedSubCollections = [...this.subCollectionService.subcollections()]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    for (const subcollection of sortedSubCollections) {
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

  // Map of node IDs to their item counts (products or images)
  nodeCounts = computed<Map<string, number>>(() => {
    const counts = new Map<string, number>();
    const currentMode = this.mode();

    if (currentMode === 'products') {
      const products = this.productsService.products();

      // Count unassigned products (no subcollection)
      const unassignedCount = products.filter(p => !p.subCollectionId).length;
      counts.set(SPECIAL_DIM_FOLDERS.UNASSIGNED, unassignedCount);

      // Count products per subcollection
      for (const product of products) {
        if (product.subCollectionId) {
          const count = counts.get(product.subCollectionId) || 0;
          counts.set(product.subCollectionId, count + 1);
        }
      }
    } else {
      const images = this.imagesService.images();

      // Count unassigned images (no subcollection)
      const unassignedCount = images.filter(img => !img.subcollectionId).length;
      counts.set(SPECIAL_DIM_FOLDERS.UNASSIGNED, unassignedCount);

      // Count images per subcollection
      for (const image of images) {
        if (image.subcollectionId) {
          const count = counts.get(image.subcollectionId) || 0;
          counts.set(image.subcollectionId, count + 1);
        }
      }
    }

    return counts;
  });

  constructor() {
    // Auto-expand active nodes (selected node path)
    effect(() => {
      const activeIds = this.activeNodeIds();
      if (activeIds.size > 0) {
        this.dimensionFoldersService.expandNodes(activeIds);
      }
    });
  }

  // ============ ACTIONS ==================

  selectNode(node: DimensionNode) {
    this.dimensionFoldersService.selectNode(node.id);
  }

  toggleNode(nodeId: string) {
    this.dimensionFoldersService.toggleNode(nodeId);
  }

  collapseAll() {
    this.dimensionFoldersService.collapseAll();
    this.dimensionFoldersService.selectNode(SPECIAL_DIM_FOLDERS.UNASSIGNED);
  }

  // ============ LIFECYCLE ==================

  async ngOnInit() {
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
