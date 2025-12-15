import { Component, OnInit } from '@angular/core';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-home',
  imports: [TitlePage],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  ngOnInit() {

  }
}
