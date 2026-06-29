package Blog.repository;

import Blog.dto.NotifDTO;
import Blog.entity.Notification;
import Blog.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT new Blog.dto.NotifDTO(" +
            "n.notificationId, " +
            "n.sender.userId, " +
            "n.sender.firstname, " +
            "n.sender.lastname, " +
            "n.message, " +
            "n.sender.avatar, " +
            "n.postId) " +
            "FROM Notification n " +
            "WHERE n.recipient.username = :username AND n.isRead = false " +
            "ORDER BY n.createdAt DESC")
    List<NotifDTO> findUnreadNotificationsByRecipientUsername(@Param("username") String username);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.sender = :user OR n.recipient = :user")
    void deleteBySenderOrRecipient(@Param("user") User user);
}