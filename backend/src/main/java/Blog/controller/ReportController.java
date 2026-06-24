package Blog.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.ReportRequestDTO;
import Blog.dto.ResponseDTO;
import Blog.service.ReportService;

@RestController
@RequestMapping("/api")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/report")
    public ResponseEntity<ResponseDTO> makeReport(@RequestBody ReportRequestDTO reporDTO, Principal principal) {
        String username = principal.getName();
        reportService.makeReport(reporDTO.getReportedUserId(), reporDTO.getReportedPostId(), reporDTO.getReason(),
                username);
        return ResponseEntity.ok(new ResponseDTO("Report submitted successfully"));
    }
}
