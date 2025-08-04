import { Component, OnInit } from '@angular/core';
import {
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArtistPageService } from '@services/artist/artist.service';
import { IArtist } from '@models/artist.model';
import { Router } from '@angular/router';
import { PopularGenresList } from 'app/utils/genres';

@Component({
  selector: 'app-become-an-artist',
  standalone: true,
  imports: [ReactiveFormsModule, NgSelectModule, FormsModule],
  templateUrl: './become-an-artist.component.html',
  styleUrls: ['./become-an-artist.component.css'],
})
export class BecomeAnArtistComponent implements OnInit {
  public popularGenres = PopularGenresList;
  errorMessage: string = '';
  artistForm: FormGroup;
  selectedImage: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private artistService: ArtistPageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.artistForm = this.formBuilder.group({
      name: ['', Validators.required],
      profileImage: [''],
      genres: [[], Validators.required],
      about: [''],
      instagram: [''],
      itunes: [''],
      youtube: [''],
    });
  }

  onSubmit() {
    if (this.artistForm.valid) {
      const formData = new FormData();
      Object.keys(this.artistForm.value).forEach((key) => {
        formData.append(key, this.artistForm.value[key]);
      });

      if (this.selectedImage) {
        formData.append(
          'profileImage',
          this.selectedImage,
          this.selectedImage.name
        );
      }
      formData.forEach((value, key) => {
        console.log(key + ' ' + value);
      });
      this.artistService.createArtist(formData).subscribe({
        next: (data) => this.router.navigateByUrl('/a/' + data._id),
        error: (err) =>
          (this.errorMessage = 'An error occurred while creating the artist.'),
      });
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }

  selectImage($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      this.selectedImage = $event.target.files[0];
      console.log(this.selectedImage);
    }
  }
}
