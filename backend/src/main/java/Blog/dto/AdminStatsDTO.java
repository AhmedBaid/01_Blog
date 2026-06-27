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

    public AdminStatsDTO(long totalUsers, long totalPosts, long totalAdmins, long totalReports) {
        this.totalUsers = totalUsers;
        this.totalPosts = totalPosts;
        this.totalAdmins = totalAdmins;
        this.totalReports = totalReports;
    }
}
