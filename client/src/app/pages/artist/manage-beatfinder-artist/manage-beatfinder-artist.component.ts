import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { IArtist } from '@models/artist.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { ArtistPageService } from '@services/artist/artist.service';
import { PopularGenresList } from 'app/utils/genres';

@Component({
  selector: 'app-manage-beatfinder-artist',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './manage-beatfinder-artist.component.html',
  styleUrls: ['./manage-beatfinder-artist.component.css'],
})
export class ManageBeatfinderArtistComponent implements OnInit {
  public popularGenres = PopularGenresList;
  artistForm: FormGroup;
  selectedImage: File | null = null;
  selectedGenres: string[] = [];
  tempGenres: string[] = [];
  errorMessage: string = '';

  private artistId: string;
  public artistData: IArtist;

  constructor(
    private formBuilder: FormBuilder,
    private artistService: ArtistPageService,
    private route: ActivatedRoute
  ) {
    // this.artistForm = this.formBuilder.group({
    //   name: [{ value: '', disabled: true }, Validators.required],
    //   profileImage: [''],
    //   genres: [[]],
    //   about: [''],
    //   instagram: [''],
    //   itunes: [''],
    //   youtube: [''],
    // });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.artistId = params['id'];
      if (this.artistId) {
        this.artistService.getArtist(this.artistId).subscribe((artistData) => {
          console.log(artistData);
          this.artistData = artistData.artist;
          this.artistForm = this.formBuilder.group({
            name: [this.artistData.name],
            about: [this.artistData.about],
            genres: [[this.artistData.genres]],
            instagram: [this.artistData.externalLinks?.instagram],
            itunes: [this.artistData.externalLinks?.itunes],
            youtube: [this.artistData.externalLinks?.youtube],
          });
        });
      } else {
        this.artistService.me().subscribe((artist) => {
          this.artistData = artist;
        });
      }
    });
  }

  onGenresChange(): void {
    this.selectedGenres.forEach((genre) => {
      if (!this.tempGenres.includes(genre)) {
        this.tempGenres.push(genre);
      }
    });
    this.selectedGenres = []; // Clear the selected genres after adding to tempGenres
  }

  removeGenre(genre: string): void {
    this.tempGenres = this.tempGenres.filter((g) => g !== genre);
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
    } else {
      this.errorMessage = 'Please fill out all required fields.';
    }
  }
  selectImage($event: any) {
    if ($event.target.files && $event.target.files[0]) {
      this.selectedImage = $event.target.files[0];
    }
  }
}
