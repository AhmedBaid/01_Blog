package Blog.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Blog.dto.FollowDTO;
import Blog.dto.NotifDTO;
import Blog.entity.Notification;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.NotificationRepository;
import Blog.repository.UserRepository;

@Service
public class NotificationService {
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    public NotificationService(UserRepository userRepository,
            NotificationRepository notificationRepository) {
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

    @Transactional(readOnly = true)
    public List<NotifDTO> getNotif(String username) {
        return notificationRepository.findUnreadNotificationsByRecipientUsername(username);
    }

    @Transactional
    public void maekNotifAsRead(Long notifId, String username) {
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new GlobalException("notification not found", HttpStatus.NOT_FOUND));
        if (!currentUser.getUserId().equals(notif.getRecipient().getUserId())) {
            throw new GlobalException("its not your notification to turn it as read", HttpStatus.BAD_REQUEST);
        }
        if (notif.isRead()) {
            throw new GlobalException("you are already mark this notif as read", HttpStatus.BAD_REQUEST);
        }
        notif.setRead(true);
        notificationRepository.save(notif);
    }

}
