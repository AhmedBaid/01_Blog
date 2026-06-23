package Blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Blog.entity.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

}
