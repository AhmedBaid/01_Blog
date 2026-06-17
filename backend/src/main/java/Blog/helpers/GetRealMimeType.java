package Blog.helpers;

import org.apache.tika.Tika;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public class GetRealMimeType {

    public static String getRealMimeType(MultipartFile file) {
        try {
            Tika tika = new Tika();

            String realMimeType = tika.detect(file.getInputStream());

            System.out.println("Fake Content Type: " + file.getContentType());
            System.out.println("Real Content Type: " + realMimeType);
            return realMimeType;

        } catch (IOException e) {
            System.out.println("Failed to read file");
            return null;
        }
    }
}