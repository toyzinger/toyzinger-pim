import { Component, input, output, computed, signal } from '@angular/core';
import { Folder } from '../../../features/folders/folder.model';
import { FormInput } from '../../form/form-input/form-input';

@Component({
  selector: 'app-foldersmenu-new',
  imports: [FormInput],
  templateUrl: './foldersmenu-new.html',
  styleUrl: './foldersmenu-new.scss',
})
export class FoldersmenuNew {
  selectedFolder = input<Folder | null>(null);
  createFolder = output<string>();
  cancel = output<void>();

  newFolderName = signal<string>('');
  selectedFolderName = computed(() => this.selectedFolder()?.name || 'Root');

  onCreateFolder() {
    const name = this.newFolderName().trim();
    if (name) {
      this.createFolder.emit(name);
      this.newFolderName.set('');
    }
  }

  onCancel() {
    this.newFolderName.set('');
    this.cancel.emit();
  }
}
