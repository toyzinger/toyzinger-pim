import { Component, input, output, signal, effect } from '@angular/core';
import { Folder } from '../../../models/folder.model';
import { FormInput } from '../../form/form-input/form-input';

@Component({
  selector: 'app-foldersmenu-rename',
  imports: [FormInput],
  templateUrl: './foldersmenu-rename.html',
  styleUrl: './foldersmenu-rename.scss',
})
export class FoldersmenuRename {
  selectedFolder = input<Folder | null>(null);
  renameFolder = output<string>();
  cancel = output<void>();

  folderName = signal<string>('');

  constructor() {
    effect(() => {
      const folder = this.selectedFolder();
      if (folder) {
        this.folderName.set(folder.name);
      }
    });
  }

  onRenameFolder() {
    const name = this.folderName().trim();
    if (name && name !== this.selectedFolder()?.name) {
      this.renameFolder.emit(name);
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
