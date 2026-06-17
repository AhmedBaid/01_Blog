package Blog.helpers;
import java.time.LocalDateTime;
import java.time.Duration;

public class FormatTimeUtil {

    public static String formatTimeAgo(LocalDateTime postDate) {
        LocalDateTime now = LocalDateTime.now();

        Duration duration = Duration.between(postDate, now);
        long secondsAgo = duration.getSeconds();

        if (secondsAgo < 60) {
            return secondsAgo <= 1 ? "1 second ago" : secondsAgo + " seconds ago";
        } 
        
        long minutesAgo = secondsAgo / 60;
        if (minutesAgo < 60) {
            return minutesAgo == 1 ? "1 minute ago" : minutesAgo + " minutes ago";
        } 
        
        long hoursAgo = minutesAgo / 60;
        if (hoursAgo < 24) {
            return hoursAgo == 1 ? "1 hour ago" : hoursAgo + " hours ago";
        } 
        
        long daysAgo = hoursAgo / 24;
        return daysAgo == 1 ? "1 day ago" : daysAgo + " days ago";
    }
}