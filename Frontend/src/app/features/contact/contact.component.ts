import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="contact-hero">
      <div class="container">
        <h1>Contact Us</h1>
        <p>Have a question or feedback? We'd love to hear from you.</p>
      </div>
    </section>

    <div class="container contact-container">

      <form #contactForm="ngForm" (ngSubmit)="submit(contactForm)" class="contact-form" novalidate>

        <!-- NAME -->
        <div class="form-group">
          <label>Name *</label>
          <input
            type="text"
            [(ngModel)]="name"
            name="name"
            #nameInput="ngModel"
            placeholder="Your name"
            required
            minlength="2"
            maxlength="50"
            [class.invalid]="nameInput.invalid && (nameInput.dirty || nameInput.touched || formSubmitted)"
          />
          @if (nameInput.invalid && (nameInput.dirty || nameInput.touched || formSubmitted)) {
            <div class="validation-error">
              @if (nameInput.errors?.['required']) {
                <small>Name is required.</small>
              }
              @if (nameInput.errors?.['minlength']) {
                <small>Name must be at least 2 characters
                  ({{ nameInput.errors?.['minlength'].actualLength }}/2).
                </small>
              }
              @if (nameInput.errors?.['maxlength']) {
                <small>Name cannot exceed 50 characters.</small>
              }
            </div>
          }
          <div class="field-hint">
            <span class="char-count" [class.over]="name.length > 50">
              {{ name.length }}/50
            </span>
          </div>
        </div>

        <!-- EMAIL -->
        <div class="form-group">
          <label>Email *</label>
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            #emailInput="ngModel"
            placeholder="your@email.com"
            required
            minlength="5"
            maxlength="100"
            pattern="^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
            [class.invalid]="emailInput.invalid && (emailInput.dirty || emailInput.touched || formSubmitted)"
          />
          @if (emailInput.invalid && (emailInput.dirty || emailInput.touched || formSubmitted)) {
            <div class="validation-error">
              @if (emailInput.errors?.['required']) {
                <small>Email is required.</small>
              }
              @if (emailInput.errors?.['minlength']) {
                <small>Email must be at least 5 characters.</small>
              }
              @if (emailInput.errors?.['maxlength']) {
                <small>Email cannot exceed 100 characters.</small>
              }
              @if (emailInput.errors?.['pattern']) {
                <small>Please enter a valid email address.</small>
              }
            </div>
          }
          <div class="field-hint">
            <span class="char-count" [class.over]="email.length > 100">
              {{ email.length }}/100
            </span>
          </div>
        </div>

        <!-- SUBJECT -->
        <div class="form-group">
          <label>Subject</label>
          <input
            type="text"
            [(ngModel)]="subject"
            name="subject"
            #subjectInput="ngModel"
            placeholder="What's this about?"
            maxlength="100"
            [class.invalid]="subjectInput.invalid && (subjectInput.dirty || subjectInput.touched || formSubmitted)"
          />
          @if (subjectInput.invalid && (subjectInput.dirty || subjectInput.touched || formSubmitted)) {
            <div class="validation-error">
              @if (subjectInput.errors?.['maxlength']) {
                <small>Subject cannot exceed 100 characters.</small>
              }
            </div>
          }
          <div class="field-hint">
            <span class="char-count" [class.over]="subject.length > 100">
              {{ subject.length }}/100
            </span>
          </div>
        </div>

        <!-- MESSAGE -->
        <div class="form-group">
          <label>Message *</label>
          <textarea
            [(ngModel)]="message"
            name="message"
            #messageInput="ngModel"
            placeholder="Your message..."
            required
            minlength="10"
            maxlength="1000"
            rows="5"
            [class.invalid]="messageInput.invalid && (messageInput.dirty || messageInput.touched || formSubmitted)"
          ></textarea>
          @if (messageInput.invalid && (messageInput.dirty || messageInput.touched || formSubmitted)) {
            <div class="validation-error">
              @if (messageInput.errors?.['required']) {
                <small>Message is required.</small>
              }
              @if (messageInput.errors?.['minlength']) {
                <small>Message must be at least 10 characters
                  ({{ messageInput.errors?.['minlength'].actualLength }}/10).
                </small>
              }
              @if (messageInput.errors?.['maxlength']) {
                <small>Message cannot exceed 1000 characters.</small>
              }
            </div>
          }
          <div class="field-hint">
            <span class="char-count" [class.over]="message.length > 1000">
              {{ message.length }}/1000
            </span>
          </div>
        </div>

        @if (success()) {
          <div class="success-msg">✓ Thank you! Your message has been sent. We'll get back to you soon.</div>
        }
        @if (error()) {
          <div class="error-msg">{{ error() }}</div>
        }

        <button type="submit" class="btn btn-primary btn-lg" [disabled]="sending()">
          {{ sending() ? 'Sending...' : 'Send Message' }}
        </button>

      </form>

      <div class="contact-info">
        <h3>Get in Touch</h3>
        <p>Life Events Hub is here to help you share and preserve life's meaningful moments.</p>
      </div>

    </div>
  `,
  styles: [`
    .contact-hero {
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
      color: white;
      padding: 3rem 1.5rem;
      text-align: center;
    }
    .contact-hero h1 { color: white; margin-bottom: 0.5rem; }
    .contact-hero p { opacity: 0.9; margin: 0; }

    .contact-container {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      display: grid;
      gap: 2rem;
    }
    .contact-form {
      background: white;
      padding: 2rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .form-group { margin-bottom: 1.25rem; }

    /* ✅ RED border - triggered by [class.invalid] binding */
    input.invalid,
    textarea.invalid {
      border-color: #c53030 !important;
      outline-color: #c53030 !important;
      box-shadow: 0 0 0 2px rgba(197, 48, 48, 0.15);
    }

    /* ✅ Angular built-in ng-classes */
    input.ng-invalid.ng-touched,
    textarea.ng-invalid.ng-touched {
      border-color: #c53030 !important;
    }

    input.ng-valid.ng-touched,
    textarea.ng-valid.ng-touched {
      border-color: #28a745 !important;
    }

    .validation-error { margin-top: 4px; }
    .validation-error small {
      display: block;
      font-size: 0.78rem;
      color: #c53030;
      margin-bottom: 2px;
    }

    .field-hint {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-top: 4px;
      min-height: 18px;
    }
    .char-count {
      font-size: 0.75rem;
      color: #9ca3af;
    }
    .char-count.over {
      color: #c53030;
      font-weight: 600;
    }

    .success-msg {
      background: #f0fdf4;
      color: #166534;
      padding: 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
    }
    .error-msg {
      background: #fef2f2;
      color: #c53030;
      padding: 1rem;
      border-radius: var(--radius);
      margin-bottom: 1rem;
    }

    button[disabled] { opacity: 0.6; cursor: not-allowed; }
    .btn-lg { padding: 1rem 2rem; font-size: 1.05rem; margin-top: 0.5rem; }
    .contact-info {
      text-align: center;
      color: var(--text-muted);
      padding: 2rem;
    }
    .contact-info h3 { color: var(--text); margin-bottom: 0.5rem; }
  `]
})
export class ContactComponent {
  name = '';
  email = '';
  subject = '';
  message = '';
  sending = signal(false);
  success = signal(false);
  error = signal('');

  // ✅ KEY: tracks whether user has attempted to submit
  formSubmitted = false;

  constructor(private api: ApiService) {}

  submit(form: NgForm): void {
    // ✅ Step 1: flip flag → all @if conditions now include formSubmitted = true
    this.formSubmitted = true;

    // ✅ Step 2: mark every field touched → Angular ng-invalid.ng-touched CSS fires too
    form.control.markAllAsTouched();

    if (form.invalid) {
      this.error.set('Please fix the errors above before submitting.');
      return;
    }

    this.sending.set(true);
    this.success.set(false);
    this.error.set('');

    this.api.submitContact(this.name, this.email, this.subject, this.message).subscribe({
      next: () => {
        this.sending.set(false);
        this.success.set(true);
        form.resetForm();        // resets touched/dirty state
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
        this.formSubmitted = false; // ✅ clear flag after successful send
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to send message. Please try again.');
        this.sending.set(false);
      }
    });
  }
}