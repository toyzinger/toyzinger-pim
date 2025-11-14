import { Component, inject, OnInit } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private toastService = inject(ToastService);

  ngOnInit() {
    // Mostrar mensajes
    this.toastService.success('Product saved!');
  }
}
