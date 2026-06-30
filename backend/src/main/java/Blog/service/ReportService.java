package Blog.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Blog.entity.Post;
import Blog.entity.Report;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.PostRepository;
import Blog.repository.ReportRepository;
import Blog.repository.UserRepository;

@Service
public class ReportService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository,
            PostRepository postRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @Transactional
    public void makeReport(Long reportedUserId, Long reportedPostId, String reason, String username) {
        User reporter = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("Reporter not found", HttpStatus.NOT_FOUND));
        Report report = new Report();

        report.setReporter(reporter);
        report.setReason(reason);

        if (reportedPostId == null && reportedUserId == null) {
            throw new GlobalException("You must specify either a reported post ID or a reported user ID",
                    HttpStatus.BAD_REQUEST);
        }

        if (reportedPostId != null && reportedUserId != null) {
            throw new GlobalException("You must specify just one (reportedUserId or reportedPostId)",
                    HttpStatus.BAD_REQUEST);
        }

        if (reportedPostId != null) {
            Post post = postRepository.findById(reportedPostId)
                    .orElseThrow(() -> new GlobalException("Post not found", HttpStatus.NOT_FOUND));
            if (post.isHidden()) {
                throw new GlobalException("This post is hidden by admin", HttpStatus.FORBIDDEN);
            }

            report.setReportedPost(post);
            report.setReportedUser(post.getUser());
        } else {
            User reportedUser = userRepository.findByUserId(reportedUserId)
                    .orElseThrow(() -> new GlobalException("Reported user not found", HttpStatus.NOT_FOUND));

            report.setReportedUser(reportedUser);
            report.setReportedPost(null);
        }

        if (report.getReporter().getUserId().equals(report.getReportedUser().getUserId())) {
            throw new GlobalException("You cannot report yourself", HttpStatus.BAD_REQUEST);
        }

        reportRepository.save(report);
    }
}
