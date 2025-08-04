import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get(route: string, withCredentials: boolean): Observable<any> {
    return this.http.get(`${this.apiUrl}/${route}`, {
      withCredentials: withCredentials,
    });
  }

  post(route: string, body: any, withCredentials: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/${route}`, body, {
      withCredentials: withCredentials,
    });
  }

  patch(route: string, body: any, withCredentials: boolean): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${route}`, body, {
      withCredentials: withCredentials,
    });
  }

  delete(route: string, withCredentials: boolean): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${route}`, {
      withCredentials: withCredentials,
    });
  }
}
