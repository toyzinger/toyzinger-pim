import { Component } from '@angular/core';
import { UploadImages } from '../../components/upload-images/upload-images';
import { TitlePage } from "../../components/title-page/title-page";

@Component({
  selector: 'app-new-images',
  imports: [UploadImages, TitlePage],
  templateUrl: './new-images.html',
  styleUrl: './new-images.scss',
})
export class NewImages { }
