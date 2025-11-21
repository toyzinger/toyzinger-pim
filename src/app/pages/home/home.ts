import { Component, inject, signal, OnInit } from '@angular/core';
import { ToastService } from '../../features/toast/toast.service';
import { FoldersDropdown } from '../../components/folders-dropdown/folders-dropdown';

@Component({
  selector: 'app-home',
  imports: [FoldersDropdown],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private toastService = inject(ToastService);

  // For testing folders dropdown
  selectedFolderId = signal<string>('');

  ngOnInit() {
    // Mostrar mensajes
    // this.toastService.success('Product saved!');
  }
}
