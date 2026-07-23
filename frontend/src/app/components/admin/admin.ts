import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
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
  imports: [FormsModule],
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
  usersLoading = signal(false);
  postsLoading = signal(false);
  reportsLoading = signal(false);

  usersPage = 0;
  postsPage = 0;
  reportsPage = 0;

  usersLast = signal(false);
  postsLast = signal(false);
  reportsLast = signal(false);

  usersSearch = signal('');
  postsSearch = signal('');
  reportsSearch = signal('');

  private usersSearchSubject = new Subject<string>();
  private postsSearchSubject = new Subject<string>();
  private reportsSearchSubject = new Subject<string>();

  actionLoading = signal<number | null>(null);
  deleteLoading = signal<number | null>(null);
  confirmDialog = signal<ConfirmDialog | null>(null);

  ngOnInit() {
    this.loadStats();

    this.usersSearchSubject.pipe(debounceTime(1500)).subscribe(() => this.resetAndLoadUsers());
    this.postsSearchSubject.pipe(debounceTime(1500)).subscribe(() => this.resetAndLoadPosts());
    this.reportsSearchSubject.pipe(debounceTime(1500)).subscribe(() => this.resetAndLoadReports());
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
        if (this.users().length === 0) this.resetAndLoadUsers();
        break;
      case 'posts':
        if (this.posts().length === 0) this.resetAndLoadPosts();
        break;
      case 'reports':
        if (this.reports().length === 0) this.resetAndLoadReports();
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

  // ── Users ──────────────────────────────────────────────

  resetAndLoadUsers() {
    this.users.set([]);
    this.usersPage = 0;
    this.usersLast.set(false);
    this.loadUsersPage();
  }

  loadUsersPage() {
    if (this.usersLoading() || this.usersLast()) return;
    this.usersLoading.set(true);
    const search = this.usersSearch().trim() || undefined;
    this.adminService.getUsers(this.usersPage, search).subscribe({
      next: (page) => {
        this.users.update((list) => [...list, ...page.content]);
        this.usersLast.set(page.last);
        this.usersPage++;
        this.usersLoading.set(false);
      },
      error: () => this.usersLoading.set(false),
    });
  }

  loadMoreUsers() {
    if (this.activeTab() !== 'users') return;
    this.loadUsersPage();
  }

  onUsersSearchInput() {
    this.usersSearchSubject.next(this.usersSearch());
  }

  // ── Posts ──────────────────────────────────────────────

  resetAndLoadPosts() {
    this.posts.set([]);
    this.postsPage = 0;
    this.postsLast.set(false);
    this.loadPostsPage();
  }

  loadPostsPage() {
    if (this.postsLoading() || this.postsLast()) return;
    this.postsLoading.set(true);
    const search = this.postsSearch().trim() || undefined;
    this.adminService.getPosts(this.postsPage, search).subscribe({
      next: (page) => {
        this.posts.update((list) => [...list, ...page.content]);
        this.postsLast.set(page.last);
        this.postsPage++;
        this.postsLoading.set(false);
      },
      error: () => this.postsLoading.set(false),
    });
  }

  loadMorePosts() {
    if (this.activeTab() !== 'posts') return;
    this.loadPostsPage();
  }

  onPostsSearchInput() {
    this.postsSearchSubject.next(this.postsSearch());
  }

  // ── Reports ────────────────────────────────────────────

  resetAndLoadReports() {
    this.reports.set([]);
    this.reportsPage = 0;
    this.reportsLast.set(false);
    this.loadReportsPage();
  }

  loadReportsPage() {
    if (this.reportsLoading() || this.reportsLast()) return;
    this.reportsLoading.set(true);
    const search = this.reportsSearch().trim() || undefined;
    this.adminService.getReports(this.reportsPage, search).subscribe({
      next: (page) => {
        this.reports.update((list) => [...list, ...page.content]);
        this.reportsLast.set(page.last);
        this.reportsPage++;
        this.reportsLoading.set(false);
      },
      error: () => this.reportsLoading.set(false),
    });
  }

  loadMoreReports() {
    if (this.activeTab() !== 'reports') return;
    this.loadReportsPage();
  }

  onReportsSearchInput() {
    this.reportsSearchSubject.next(this.reportsSearch());
  }

  // ── Infinite scroll ────────────────────────────────────

  onTabScroll(event: Event) {
    const el = event.target as HTMLElement;
    if (!el) return;
    const pos = el.scrollTop + el.clientHeight;
    const max = el.scrollHeight;
    if (pos >= max - 300) {
      const tab = this.activeTab();
      if (tab === 'users') this.loadMoreUsers();
      else if (tab === 'posts') this.loadMorePosts();
      else if (tab === 'reports') this.loadMoreReports();
    }
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

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  refreshData(type: string) {
    switch (type) {
      case 'users':
        this.resetAndLoadUsers();
        break;
      case 'posts':
        this.resetAndLoadPosts();
        break;
      case 'reports':
        this.resetAndLoadReports();
        break;
    }
  }
}
