import { Component, OnInit } from '@angular/core';
import { ToastService } from '../../features/toast/toast.service';
import { inject } from '@angular/core';

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
    console.log('Home loaded');
    this.toastService.success('Home loaded');
    this.toastService.error('Home loaded');
    this.toastService.info('Home loaded');
    this.toastService.warning('Home loaded');
  }
}
