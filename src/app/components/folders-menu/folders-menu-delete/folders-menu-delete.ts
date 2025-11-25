import { Component, input, output, computed, inject } from '@angular/core';
import { Folder } from '../../../features/folders/folders.model';
import { FormInput } from '../../form/form-input/form-input';
import { FoldersService } from '../../../features/folders/folders.service';

@Component({
  selector: 'app-folders-menu-delete',
  imports: [FormInput],
  templateUrl: './folders-menu-delete.html',
  styleUrl: './folders-menu-delete.scss',
})
export class FoldersmenuDelete {
  private foldersStore = inject(FoldersService);

  deleteFolder = output<void>();
  cancel = output<void>();

  selectedFolder = this.foldersStore.selectedFolder;
  folderName = computed(() => this.selectedFolder()?.name || '');
  loading = this.foldersStore.loading;

  onDeleteFolder() {
    if (!this.loading()) {
      this.deleteFolder.emit();
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
