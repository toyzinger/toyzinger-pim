import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidemenu } from './components/sidemenu/sidemenu';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidemenu],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('toyzinger-pim');
}
