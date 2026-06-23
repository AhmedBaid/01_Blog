package Blog.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.NotifDTO;
import Blog.service.NotificationService;

@RestController
@RequestMapping("/api")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/notifications")
    public List<NotifDTO> getNotif(Principal principal) {
        String username = principal.getName();
        return notificationService.getNotif(username);
    }

    @PutMapping("/notifications/{notifId}/read")
    public void maekNotifAsRead(@PathVariable Long notifId,Principal principal) {
        String username = principal.getName();
        notificationService.maekNotifAsRead(notifId,username);
    }

}
