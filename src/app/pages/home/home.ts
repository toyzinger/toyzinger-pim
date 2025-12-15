import { Component, OnInit } from '@angular/core';
import { TitlePage } from "../../components/title-page/title-page";
import { FormPimageSelector } from '../../components/form/form';

@Component({
  selector: 'app-home',
  imports: [TitlePage, FormPimageSelector],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {

  selectedImages: string[] = [];

  ngOnInit() {

  }
}
