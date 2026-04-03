// ============================================================
//  feed.component.ts  —  Life Events Memory Keeper
//  Contains: Component Logic + Inline Template + Inline Styles
// ============================================================

import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// ── Models ───────────────────────────────────────────────────
interface CountryEventCount {
  country: string;
  eventCount: number;
}

interface EventSummary {
  id: number;
  name: string;
  eventDate: string;
  ownerName: string;
}

// ── Component ────────────────────────────────────────────────
@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule],

  // ── TEMPLATE ──────────────────────────────────────────────
  template: `
    <!-- Country Filter Bar -->
    <div class="country-bar">
      <button
        *ngFor="let item of countryCounts; let i = index"
        class="country-chip"
        [class.active]="selectedCountry === item.country"
        [style.animation-delay]="i * 60 + 'ms'"
        (click)="onCountryClick(item.country, $event)">
        <span class="chip-country">{{ item.country }}</span>
        <span class="chip-count">{{ item.eventCount }} events</span>
      </button>
    </div>

    <!-- Backdrop -->
    <div class="backdrop" *ngIf="showPopup" (click)="closePopup()"></div>

    <!-- Events Popup -->
    <div
      class="events-popup"
      *ngIf="showPopup"
      [style.top.px]="popupPosition.top"
      [style.left.px]="popupPosition.left">

      <!-- Popup Header -->
      <div class="popup-header">
        <div class="popup-title">
          <span class="popup-pin">📍</span>
          <span>{{ selectedCountry }}</span>
          <span class="popup-badge">{{ countryEvents.length }}</span>
        </div>
        <button class="close-btn" (click)="closePopup()" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loadingEvents" class="loading-state">
        <div class="spinner"></div>
        <span>Loading events…</span>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loadingEvents && countryEvents.length === 0" class="empty-state">
        <span>🗂️</span>
        <p>No events found for {{ selectedCountry }}</p>
      </div>

      <!-- Event Cards -->
      <div class="event-list" *ngIf="!loadingEvents && countryEvents.length > 0">
        <div
          *ngFor="let ev of countryEvents; let i = index"
          class="event-card"
          [style.animation-delay]="i * 80 + 'ms'">

          <div class="event-index">{{ i + 1 }}</div>

          <div class="event-info">
            <div class="event-name">{{ ev.name }}</div>
            <div class="event-meta">
              <span class="meta-item">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M5 1v4M11 1v4M1 7h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ formatDate(ev.eventDate) }}
              </span>
              <span class="meta-item">
                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                {{ ev.ownerName }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  // ── STYLES ────────────────────────────────────────────────
  styles: [`
    /* ── CSS Variables ── */
    :host {
      --green-dark:   #0f3d24;
      --green-mid:    #1a5c3a;
      --green-light:  #2d7a52;
      --green-pale:   #e8f5ee;
      --gold:         #e8b84b;
      --gold-light:   #f5d98a;
      --white:        #ffffff;
      --text-dark:    #1a2a1f;
      --text-muted:   #5a7060;
      --shadow-soft:  0 4px 24px rgba(15,61,36,0.13);
      --shadow-popup: 0 12px 48px rgba(15,61,36,0.22), 0 2px 8px rgba(15,61,36,0.10);
      --radius-chip:  24px;
      --radius-popup: 16px;
      --radius-card:  10px;
      font-family: 'Georgia', 'Times New Roman', serif;
    }

    /* ── Country Bar ── */
    .country-bar {
      background: linear-gradient(135deg, var(--green-dark) 0%, var(--green-mid) 100%);
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 16px 28px;
      justify-content: center;
      box-shadow: 0 2px 12px rgba(15,61,36,0.18);
    }

    /* ── Country Chip ── */
    .country-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.12);
      color: var(--white);
      border: 1.5px solid rgba(255,255,255,0.22);
      border-radius: var(--radius-chip);
      padding: 8px 18px;
      font-family: inherit;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1);
      backdrop-filter: blur(4px);
      animation: chipFadeIn 0.4s ease both;
    }

    @keyframes chipFadeIn {
      from { opacity: 0; transform: translateY(10px) scale(0.95); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    .country-chip:hover {
      background: var(--gold);
      border-color: var(--gold);
      color: var(--green-dark);
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 6px 20px rgba(232,184,75,0.35);
    }

    .country-chip.active {
      background: var(--gold);
      border-color: var(--gold-light);
      color: var(--green-dark);
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 6px 20px rgba(232,184,75,0.4);
    }

    .chip-country {
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .chip-count {
      font-size: 0.78rem;
      opacity: 0.85;
      font-style: italic;
    }

    /* ── Backdrop ── */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 999;
      background: transparent;
    }

    /* ── Events Popup ── */
    .events-popup {
      position: absolute;
      z-index: 1000;
      background: var(--white);
      border-radius: var(--radius-popup);
      box-shadow: var(--shadow-popup);
      width: 320px;
      max-height: 400px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: popupIn 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
      border: 1px solid rgba(15,61,36,0.08);
    }

    @keyframes popupIn {
      from { opacity: 0; transform: translateY(-10px) scale(0.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    /* ── Popup Header ── */
    .popup-header {
      background: linear-gradient(135deg, var(--green-dark), var(--green-mid));
      color: var(--white);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      flex-shrink: 0;
    }

    .popup-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.03em;
    }

    .popup-pin {
      font-size: 1rem;
    }

    .popup-badge {
      background: var(--gold);
      color: var(--green-dark);
      border-radius: 50px;
      padding: 2px 8px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .close-btn {
      background: rgba(255,255,255,0.15);
      border: none;
      color: var(--white);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.18s;
      flex-shrink: 0;
    }

    .close-btn:hover {
      background: rgba(255,255,255,0.28);
    }

    /* ── Loading ── */
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 32px;
      color: var(--text-muted);
      font-size: 0.88rem;
      font-style: italic;
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--green-pale);
      border-top-color: var(--green-mid);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* ── Empty State ── */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 32px;
      color: var(--text-muted);
      font-size: 0.88rem;
    }

    .empty-state span {
      font-size: 2rem;
    }

    .empty-state p {
      margin: 0;
      text-align: center;
    }

    /* ── Event List ── */
    .event-list {
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .event-list::-webkit-scrollbar {
      width: 5px;
    }

    .event-list::-webkit-scrollbar-track {
      background: var(--green-pale);
    }

    .event-list::-webkit-scrollbar-thumb {
      background: var(--green-light);
      border-radius: 10px;
    }

    /* ── Event Card ── */
    .event-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      background: var(--green-pale);
      border-radius: var(--radius-card);
      padding: 12px 14px;
      border-left: 4px solid var(--green-mid);
      animation: cardSlideIn 0.3s ease both;
      transition: transform 0.18s, box-shadow 0.18s;
    }

    @keyframes cardSlideIn {
      from { opacity: 0; transform: translateX(-12px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .event-card:hover {
      transform: translateX(3px);
      box-shadow: 0 3px 12px rgba(15,61,36,0.10);
    }

    /* ── Event Index Number ── */
    .event-index {
      background: var(--green-mid);
      color: var(--white);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 800;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* ── Event Info ── */
    .event-info {
      flex: 1;
      min-width: 0;
    }

    .event-name {
      font-weight: 700;
      color: var(--text-dark);
      font-size: 0.93rem;
      line-height: 1.3;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .event-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .meta-item svg {
      flex-shrink: 0;
      color: var(--green-light);
    }
  `]
})
export class FeedComponent implements OnInit {

  // ── State ──────────────────────────────────────────────────
  countryCounts: CountryEventCount[] = [];
  selectedCountry: string | null = null;
  countryEvents: EventSummary[] = [];
  loadingEvents = false;
  showPopup = false;
  popupPosition = { top: 0, left: 0 };

  private readonly apiUrl = 'http://localhost:5000/api/events';

  constructor(private http: HttpClient) {}

  // ── Lifecycle ──────────────────────────────────────────────
  ngOnInit(): void {
    this.http
      .get<CountryEventCount[]>(`${this.apiUrl}/country-counts`)
      .subscribe({
        next: data => (this.countryCounts = data),
        error: err => console.error('Failed to load country counts', err)
      });
  }

  // ── Country Chip Click ─────────────────────────────────────
  onCountryClick(country: string, event: MouseEvent): void {
    const btn = event.currentTarget as HTMLElement;
    const rect = btn.getBoundingClientRect();
    const popupWidth = 320;

    // Position popup below chip, keep within viewport
    let left = rect.left + window.scrollX;
    if (left + popupWidth > window.innerWidth - 12) {
      left = window.innerWidth - popupWidth - 12;
    }

    this.popupPosition = {
      top: rect.bottom + window.scrollY + 10,
      left: Math.max(8, left)
    };

    // Toggle off if same country clicked
    if (this.selectedCountry === country && this.showPopup) {
      this.closePopup();
      return;
    }

    this.selectedCountry = country;
    this.showPopup = true;
    this.loadingEvents = true;
    this.countryEvents = [];

    this.http
      .get<EventSummary[]>(`${this.apiUrl}/by-country/${encodeURIComponent(country)}`)
      .subscribe({
        next: events => {
          this.countryEvents = events;
          this.loadingEvents = false;
        },
        error: err => {
          console.error('Failed to load events', err);
          this.loadingEvents = false;
        }
      });
  }

  // ── Close Popup ────────────────────────────────────────────
  closePopup(): void {
    this.showPopup = false;
    this.selectedCountry = null;
    this.countryEvents = [];
  }

  // ── Close on ESC ───────────────────────────────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closePopup();
  }

  // ── Format Date ────────────────────────────────────────────
  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
}