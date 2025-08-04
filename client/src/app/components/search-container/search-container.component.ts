import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-search-container',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './search-container.component.html',
  styleUrls: ['./search-container.component.css'],
})
export class SearchContainerComponent {
  @ViewChild('searchContainer', { static: true }) searchContainer: ElementRef;
  @Output() closeSearch = new EventEmitter<void>();
  public showSearchContainer: boolean = false; // Assuming you want it shown initially or manage this from the parent component
  public searchQuery: string = '';
  public searchResults: any = {};
  private typingTimer: any;
  public searchDone: boolean = false;
  private globalClickListener: Function;

  constructor(private apiService: ApiService, private renderer: Renderer2) {}

  ngOnInit() {
    this.globalClickListener = this.renderer.listen(
      'window',
      'click',
      (event: MouseEvent) => {
        if (
          this.showSearchContainer &&
          !this.searchContainer.nativeElement.contains(event.target)
        ) {
          this.showSearchContainer = false; // Hide the search container
        }
      }
    );
  }

  search(event: KeyboardEvent) {
    if (event.key && event.key.length === 1) {
      // If yes, proceed with the search logic
      if (this.searchQuery.trim() === '') {
        this.searchResults = {};
        this.searchDone = true;
        this.showSearchContainer = false;
        return;
      }
      clearTimeout(this.typingTimer);
      this.searchDone = false;
      this.showSearchContainer = true;
      this.typingTimer = setTimeout(() => {
        this.apiService
          .get(`search?keyword=${this.searchQuery}`, false)
          .subscribe((data) => {
            this.searchResults = data;
            this.searchDone = true;
          });
      }, 1000);
    }
  }

  onFocus() {
    // If a search has been done and we have results, show the container
    if (this.searchDone && this.searchQuery.trim() !== '') {
      this.showSearchContainer = true;
    }
  }
  resetSearch() {
    this.showSearchContainer = false;
    this.searchDone = true;
    this.searchQuery = '';
  }
  ngOnDestroy() {
    this.globalClickListener();
  }
}
