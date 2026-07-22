package Blog.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Blog.dto.ReportDTO;
import Blog.entity.Report;

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

    @Query("SELECT new Blog.dto.ReportDTO(" +
            "r.reportId, r.reason, r.status, r.createdAt, " +
            "reporter.userId, reporter.username, reporter.firstname, reporter.lastname, reporter.avatar, " +
            "reported.userId, reported.username, reported.firstname, reported.lastname, reported.avatar, " +
            "COALESCE(p.postId, null), COALESCE(p.title, null)) " +
            "FROM Report r " +
            "JOIN r.reporter reporter " +
            "JOIN r.reportedUser reported " +
            "LEFT JOIN r.reportedPost p " +
            "WHERE LOWER(r.reason) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(reporter.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(reporter.firstname) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(reporter.lastname) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(reported.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(reported.firstname) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "OR LOWER(reported.lastname) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "ORDER BY r.createdAt DESC")
    Page<ReportDTO> findAllReportsForAdmin(@Param("search") String search, Pageable pageable);

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
    Page<ReportDTO> findAllReportsForAdmin(Pageable pageable);
}
