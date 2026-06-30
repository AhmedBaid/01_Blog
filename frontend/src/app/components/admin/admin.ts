import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';
import { PostAdmin, ReportAdmin, Stats, UserAdmin } from '../../models/models';

interface ConfirmDialog {
  type: 'ban' | 'unban' | 'deleteUser' | 'hide' | 'show' | 'deletePost' | 'review' | 'dismiss';
  item: UserAdmin | PostAdmin | ReportAdmin;
  title: string;
  message: string;
  actionLabel: string;
  actionClass: string;
  icon: string;
  iconBg: string;
}

@Component({
  selector: 'app-admin',
  imports: [],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
})
export class AdminComponent {
  private authService = inject(AuthService);
  private adminService = inject(AdminService);
  router = inject(Router);

  activeTab = signal<'dashboard' | 'users' | 'posts' | 'reports'>('dashboard');
  sidebarOpen = signal(false);

  stats = signal<Stats | null>(null);
  users = signal<UserAdmin[]>([]);
  posts = signal<PostAdmin[]>([]);
  reports = signal<ReportAdmin[]>([]);

  loading = signal(false);
  actionLoading = signal<number | null>(null);
  deleteLoading = signal<number | null>(null);
  confirmDialog = signal<ConfirmDialog | null>(null);

  ngOnInit() {
    this.loadStats();
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  setActiveTab(tab: 'dashboard' | 'users' | 'posts' | 'reports') {
    this.activeTab.set(tab);
    this.sidebarOpen.set(false);
    switch (tab) {
      case 'dashboard':
        this.loadStats();
        break;
      case 'users':
        this.loadUsers();
        break;
      case 'posts':
        this.loadPosts();
        break;
      case 'reports':
        this.loadReports();
        break;
    }
  }

  loadStats() {
    this.loading.set(true);
    this.adminService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private refreshStatsSilent() {
    this.adminService.getStats().subscribe({
      next: (data) => this.stats.set(data),
    });
  }

  loadUsers() {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadPosts() {
    this.loading.set(true);
    this.adminService.getPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loadReports() {
    this.loading.set(true);
    this.adminService.getReports().subscribe({
      next: (data) => {
        this.reports.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openConfirmDialog(
    type: ConfirmDialog['type'],
    item: UserAdmin | PostAdmin | ReportAdmin,
    title: string,
    message: string,
    actionLabel: string,
    actionClass: string,
    icon: string,
    iconBg: string,
  ) {
    this.confirmDialog.set({ type, item, title, message, actionLabel, actionClass, icon, iconBg });
  }

  closeConfirmDialog() {
    this.confirmDialog.set(null);
  }

  performConfirmedAction() {
    const dialog = this.confirmDialog();
    if (!dialog) return;

    switch (dialog.type) {
      case 'ban':
      case 'unban':
        this.executeToggleBan(dialog.item as UserAdmin);
        break;
      case 'deleteUser':
        this.executeDeleteUser(dialog.item as UserAdmin);
        break;
      case 'hide':
      case 'show':
        this.executeToggleHide(dialog.item as PostAdmin);
        break;
      case 'deletePost':
        this.executeDeletePost(dialog.item as PostAdmin);
        break;
      case 'review':
        this.executeReviewReport(dialog.item as ReportAdmin);
        break;
      case 'dismiss':
        this.executeDismissReport(dialog.item as ReportAdmin);
        break;
    }
    this.confirmDialog.set(null);
  }

  requestToggleBan(user: UserAdmin) {
    if (user.admin) return;
    const action = user.status ? 'unban' : 'ban';
    const label = user.status ? 'Unban' : 'Ban';
    this.openConfirmDialog(
      action,
      user,
      `${label} User`,
      `Are you sure you want to ${action} "${user.firstname} ${user.lastname}"?`,
      label,
      user.status ? 'confirm-action-success' : 'confirm-action-warning',
      user.status ? 'fa-circle-check' : 'fa-ban',
      user.status ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
    );
  }

  requestDeleteUser(user: UserAdmin) {
    if (user.admin) return;
    this.openConfirmDialog(
      'deleteUser',
      user,
      'Delete User',
      `Are you sure you want to permanently delete "${user.firstname} ${user.lastname}"? This action cannot be undone and all their posts will be removed.`,
      'Delete',
      'confirm-action-danger',
      'fa-trash',
      'rgba(255,68,0,0.12)',
    );
  }

  private executeToggleBan(user: UserAdmin) {
    this.actionLoading.set(user.userId);
    this.adminService.toggleBanUser(user.userId).subscribe({
      next: () => {
        this.users.update((list) =>
          list.map((u) => (u.userId === user.userId ? { ...u, status: !u.status } : u)),
        );
        this.actionLoading.set(null);
        this.refreshStatsSilent();
      },
      error: () => this.actionLoading.set(null),
    });
  }

  private executeDeleteUser(user: UserAdmin) {
    this.deleteLoading.set(user.userId);
    this.adminService.deleteUser(user.userId).subscribe({
      next: () => {
        this.users.update((list) => list.filter((u) => u.userId !== user.userId));
        this.deleteLoading.set(null);
        this.refreshStatsSilent();
      },
      error: () => this.deleteLoading.set(null),
    });
  }

  requestToggleHide(post: PostAdmin) {
    const action = post.hidden ? 'show' : 'hide';
    const label = post.hidden ? 'Show' : 'Hide';
    this.openConfirmDialog(
      action,
      post,
      `${label} Post`,
      `Are you sure you want to ${action} "${post.content}"?`,
      label,
      post.hidden ? 'confirm-action-success' : 'confirm-action-warning',
      post.hidden ? 'fa-eye' : 'fa-eye-slash',
      post.hidden ? 'rgba(34,197,94,0.12)' : 'rgba(251,191,36,0.12)',
    );
  }

  requestDeletePost(post: PostAdmin) {
    this.openConfirmDialog(
      'deletePost',
      post,
      'Delete Post',
      `Are you sure you want to permanently delete "${post.content}" by ${post.firstname} ${post.lastname}? This action cannot be undone.`,
      'Delete',
      'confirm-action-danger',
      'fa-trash',
      'rgba(255,68,0,0.12)',
    );
  }

  private executeToggleHide(post: PostAdmin) {
    this.actionLoading.set(post.postId);
    this.adminService.toggleHidePost(post.postId).subscribe({
      next: () => {
        this.posts.update((list) =>
          list.map((p) => (p.postId === post.postId ? { ...p, hidden: !p.hidden } : p)),
        );
        this.actionLoading.set(null);
        this.refreshStatsSilent();
      },
      error: () => this.actionLoading.set(null),
    });
  }

  private executeDeletePost(post: PostAdmin) {
    this.deleteLoading.set(post.postId);
    this.adminService.deletePost(post.postId).subscribe({
      next: () => {
        this.posts.update((list) => list.filter((p) => p.postId !== post.postId));
        this.deleteLoading.set(null);
        this.refreshStatsSilent();
      },
      error: () => this.deleteLoading.set(null),
    });
  }

  requestReviewReport(report: ReportAdmin) {
    this.openConfirmDialog(
      'review',
      report,
      'Review Report',
      `Mark this report by "${report.reporterUsername}" as reviewed? The report will be resolved.`,
      'Review',
      'confirm-action-success',
      'fa-circle-check',
      'rgba(34,197,94,0.12)',
    );
  }

  requestDismissReport(report: ReportAdmin) {
    this.openConfirmDialog(
      'dismiss',
      report,
      'Dismiss Report',
      `Dismiss this report by "${report.reporterUsername}"? The report will be discarded.`,
      'Dismiss',
      'confirm-action-danger',
      'fa-xmark',
      'rgba(255,68,0,0.12)',
    );
  }

  private executeReviewReport(report: ReportAdmin) {
    this.actionLoading.set(report.reportId);
    this.adminService.reviewReport(report.reportId).subscribe({
      next: () => {
        this.reports.update((list) =>
          list.map((r) => (r.reportId === report.reportId ? { ...r, status: 'REVIEWED' } : r)),
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  private executeDismissReport(report: ReportAdmin) {
    this.actionLoading.set(report.reportId);
    this.adminService.dismissReport(report.reportId).subscribe({
      next: () => {
        this.reports.update((list) =>
          list.map((r) => (r.reportId === report.reportId ? { ...r, status: 'DISMISSED' } : r)),
        );
        this.actionLoading.set(null);
      },
      error: () => this.actionLoading.set(null),
    });
  }

  get activePercentage(): number {
    const s = this.stats();
    if (!s || s.totalPosts === 0) return 0;
    return Math.round(((s.totalPosts - s.hiddenPostsCount) / s.totalPosts) * 100);
  }

  get hiddenPercentage(): number {
    const s = this.stats();
    if (!s || s.totalPosts === 0) return 0;
    return Math.round((s.hiddenPostsCount / s.totalPosts) * 100);
  }

  get reportedPercentage(): number {
    const s = this.stats();
    if (!s || s.totalPosts === 0) return 0;
    return Math.round((s.totalReports / s.totalPosts) * 100);
  }

  get newUsersPercentage(): number {
    const s = this.stats();
    if (!s || s.totalUsers === 0) return 0;
    return Math.min(100, Math.round((s.newUsersToday / s.totalUsers) * 100));
  }

  get newPostsPercentage(): number {
    const s = this.stats();
    if (!s || s.totalPosts === 0) return 0;
    return Math.min(100, Math.round((s.newPostsToday / s.totalPosts) * 100));
  }

  get activeUsersPercentage(): number {
    const s = this.stats();
    if (!s || s.totalUsers === 0) return 100;
    return Math.round(((s.totalUsers - s.bannedUsersCount) / s.totalUsers) * 100);
  }

  get bannedUsersPercentage(): number {
    const s = this.stats();
    if (!s || s.totalUsers === 0) return 0;
    return Math.round((s.bannedUsersCount / s.totalUsers) * 100);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'badge-pending';
      case 'REVIEWED':
        return 'badge-reviewed';
      case 'DISMISSED':
        return 'badge-dismissed';
      default:
        return '';
    }
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }
}
