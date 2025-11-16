import { Component, input, output, computed } from '@angular/core';
import { Folder } from '../../../models/folder.model';
import { FormInput } from '../../form/form-input/form-input';

@Component({
  selector: 'app-foldersmenu-delete',
  imports: [FormInput],
  templateUrl: './foldersmenu-delete.html',
  styleUrl: './foldersmenu-delete.scss',
})
export class FoldersmenuDelete {
  selectedFolder = input<Folder | null>(null);
  deleteFolder = output<void>();
  cancel = output<void>();

  folderName = computed(() => this.selectedFolder()?.name || '');

  onDeleteFolder() {
    this.deleteFolder.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
