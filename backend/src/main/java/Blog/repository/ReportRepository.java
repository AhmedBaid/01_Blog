package Blog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Blog.dto.ReportDTO;
import Blog.entity.Post;
import Blog.entity.Report;
import Blog.entity.User;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {

    @Query("SELECT new Blog.dto.ReportDTO(" +
            "r.reportId, r.reason, r.status, r.createdAt, " +
            "reporter.userId, reporter.username, reporter.firstname, reporter.lastname, reporter.avatar, " +
            "reported.userId, reported.username, reported.firstname, reported.lastname, reported.avatar, " +
            "COALESCE(p.postId, null), COALESCE(p.title, null)) " +
            "FROM Report r " +
            "JOIN r.reporter reporter " +
            "JOIN r.reportedUser reported " +
            "LEFT JOIN r.reportedPost p " +
            "ORDER BY r.createdAt DESC")
    List<ReportDTO> findAllReportsForAdmin();

    @Modifying
    @Query("DELETE FROM Report r WHERE r.reporter = :user OR r.reportedUser = :user")
    void deleteByReporterOrReportedUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM Report r WHERE r.reportedPost = :post")
    void deleteByReportedPost(@Param("post") Post post);
}
