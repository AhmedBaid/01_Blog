package Blog.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class AdminStatsDTO {
    private long totalUsers;
    private long totalPosts;
    private long totalAdmins;
    private long totalReports;

    private long newUsersToday;
    private long newPostsToday;
    private long bannedUsersCount;
    private long hiddenPostsCount;

    public AdminStatsDTO(long totalUsers, long totalPosts, long totalAdmins, long totalReports, long newUsersToday,
            long newPostsToday, long bannedUsersCount, long hiddenPostsCount) {
        this.totalUsers = totalUsers;
        this.totalPosts = totalPosts;
        this.totalAdmins = totalAdmins;
        this.totalReports = totalReports;
        this.newUsersToday = newUsersToday;
        this.newPostsToday = newPostsToday;
        this.bannedUsersCount = bannedUsersCount;
        this.hiddenPostsCount = hiddenPostsCount;
    }
}
