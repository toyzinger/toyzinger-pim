import { Component, input, output, computed, signal, inject } from '@angular/core';
import { Folder } from '../../../features/folders/folders.model';
import { FormInput } from '../../form/form-input/form-input';
import { FoldersService } from '../../../features/folders/folders.service';

@Component({
  selector: 'app-folders-menu-new',
  imports: [FormInput],
  templateUrl: './folders-menu-new.html',
  styleUrl: './folders-menu-new.scss',
})
export class FoldersmenuNew {
  private foldersStore = inject(FoldersService);

  createFolder = output<string>();
  cancel = output<void>();

  newFolderName = signal<string>('');
  selectedFolder = this.foldersStore.selectedFolder;
  selectedFolderName = computed(() => this.selectedFolder()?.name || 'Root');
  loading = this.foldersStore.loading;

  onCreateFolder() {
    const name = this.newFolderName().trim();
    if (name && !this.loading()) {
      this.createFolder.emit(name);
      this.newFolderName.set('');
    }
  }

  onCancel() {
    this.newFolderName.set('');
    this.cancel.emit();
  }
}
