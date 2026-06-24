import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Post, User } from '../../models/models';

@Component({
  selector: 'app-report-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report.html',
  styleUrls: ['./report.css'],
})
export class ReportModalComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private notification = inject(NotificationService);
  private apiReport = 'http://localhost:8080/api/report';

  @Input() reportedUser: User | null = null;
  @Input() reportedPost: Post | null = null;
  @Input() targetName: String = '';
  @Output() close = new EventEmitter<void>();

  reportForm!: FormGroup;
  currentStep = signal<number>(1);
  isSubmitting = signal<boolean>(false);
  reasons: String[] = [];
  userReportReasons = ['Spam', 'Fake Account', 'Harassment', 'Hate Speech', 'Impersonation'];

  postReportReasons = [
    'Spam',
    'Misinformation',
    'Harassment',
    'Hate Speech',
    'Violence or Harmful Content',
  ];

  ngOnInit(): void {
    this.reportForm = this.fb.group({
      reason: ['', Validators.required],
    });
  }
  ngOnChanges() {
    this.reasons = this.reportedUser != null ? this.userReportReasons : this.postReportReasons;
  }

  nextStep(): void {
    if (this.reportForm.get('reason')?.invalid) {
      this.reportForm.get('reason')?.markAsTouched();
      return;
    }
    this.currentStep.set(2);
  }

  prevStep(): void {
    this.currentStep.set(1);
  }

  submitReport(): void {
    if (this.reportForm.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const formValues = this.reportForm.getRawValue();

    const bodyPayload = {
      reportedUserId: this.reportedUser?.userId || this.reportedUser?.userId,
      reportedPostId: this.reportedPost?.id,
      reason: formValues.reason,
    };

    this.http.post(`${this.apiReport}`, bodyPayload).subscribe({
      next: () => {
        this.notification.success('Report submitted successfully. Thank you!', 'Success');
        this.isSubmitting.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.log(err)
        this.notification.error(err.error?.message || 'Could not submit report', 'Error');
        this.isSubmitting.set(false);
      },
    });
  }

  closeModal(): void {
    this.currentStep.set(1);
    this.reportForm.reset();
    this.close.emit();
  }
}
