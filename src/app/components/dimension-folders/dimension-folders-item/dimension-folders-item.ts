import { Component, inject, input, output, signal, computed } from '@angular/core';
import { DimensionNode, SPECIAL_DIM_FOLDERS } from '../../../features/dimensions/dimensions.model';
import { GlobalService } from '../../../features/global/global.service';

@Component({
  selector: 'app-dimension-folders-item',
  imports: [],
  templateUrl: './dimension-folders-item.html',
  styleUrl: './dimension-folders-item.scss',
})
export class DimensionFoldersItem {
  private globalService = inject(GlobalService);

  // ============ INPUTS ==================

  node = input.required<DimensionNode>();
  allNodes = input.required<DimensionNode[]>();
  selectedNodeId = input<string | null>(null);
  expandedNodeIds = input.required<Set<string>>();
  level = input<number>(0);

  // ============ OUTPUTS ==================

  nodeSelected = output<DimensionNode>();
  nodeToggled = output<string>();

  // ============ LOCAL STATE ==================

  isDragOver = signal(false);

  // ============ COMPUTED VALUES ==================

  // Get children of current node
  children = computed<DimensionNode[]>(() => {
    const currentNode = this.node();
    return this.allNodes().filter(n => n.parentId === currentNode.id);
  });

  isExpanded = computed(() => this.expandedNodeIds().has(this.node().id));
  isSelected = computed(() => this.selectedNodeId() === this.node().id);
  hasChildren = computed(() => this.children().length > 0);

  // Get icon based on node type
  nodeIcon = computed(() => {
    const node = this.node();

    if (node.type === 'special') {
      return node.id === SPECIAL_DIM_FOLDERS.UNASSIGNED ? 'folder_off' : 'folder_special';
    }

    if (node.type === 'collection' || node.type === 'franchise') {
      return this.isExpanded() ? 'folder_open' : 'folder';
    }

    // subcollection
    return 'label';
  });

  // ============ EVENT HANDLERS ==================

  onSelectNode(event: Event) {
    event.stopPropagation();

    const nodeType = this.node().type;

    // Franchise and collection: just expand/collapse on click
    if (nodeType === 'franchise' || nodeType === 'collection') {
      this.nodeToggled.emit(this.node().id);
      return;
    }

    // Don't allow selecting ALL folder
    if (this.node().id === SPECIAL_DIM_FOLDERS.ALL) {
      return;
    }

    this.nodeSelected.emit(this.node());
  }

  onToggleNode(event: Event) {
    event.stopPropagation();
    this.nodeToggled.emit(this.node().id);
  }

  // ============ DRAG AND DROP ==================

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Only allow drop on droppable nodes (subcollections and unassigned)
    if (!this.node().isDroppable) {
      return;
    }

    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    // Only process drops on droppable nodes
    if (!this.node().isDroppable) {
      return;
    }

    // Notify global service about the drop
    this.globalService.notifyFolderDrop(this.node().id);
  }
}
