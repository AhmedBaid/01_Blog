package Blog.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import Blog.dto.FollowDTO;
import Blog.entity.Notification;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.FollowRepository;
import Blog.repository.NotificationRepository;
import Blog.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class NotificationService {
    public final FollowRepository followRepository;
    public final UserRepository userRepository;
    public final NotificationRepository notificationRepository;

    public NotificationService(FollowRepository followRepository, UserRepository userRepository,
            NotificationRepository notificationRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
    }

    @Async
    @Transactional
    public void saveNotif(Long senderId, List<FollowDTO> followers) {
        if (followers == null || followers.isEmpty())
            return;

        User sender = userRepository.findByUserId(senderId)
                .orElseThrow(() -> new GlobalException("Sender not found", HttpStatus.NOT_FOUND));

        List<Notification> notificationList = new ArrayList<>();

        for (FollowDTO followerDto : followers) {
            Notification notif = new Notification();
            notif.setMessage("created a new post");
            notif.setRead(false);
            notif.setSender(sender);

            User recipient = new User();
            recipient.setUserId(followerDto.getUserId());

            notif.setRecipient(recipient);
            notificationList.add(notif);
        }

        notificationRepository.saveAll(notificationList);
    }
}
