import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventItem {
  eventName: string;
  eventMembers: number;
}

export interface CountryEvent {
  country: string;
  eventCount: number;
  events: EventItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private baseUrl = 'https://localhost:5001/api/countries';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getCountryEvents(country: string): Observable<CountryEvent> {
    return this.http.get<CountryEvent>(`${this.baseUrl}/${country}`);
  }
}