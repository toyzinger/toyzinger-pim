import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { ToastContainer } from './components/toast-container/toast-container';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ToastContainer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('toyzinger-pim');
}
