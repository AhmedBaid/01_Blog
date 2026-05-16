package Blog.config;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

@Component
public class jwtUtil {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final Pattern SUBJECT_PATTERN = Pattern.compile("\"sub\"\\s*:\\s*\"([^\"]+)\"");
    private static final Pattern EXPIRATION_PATTERN = Pattern.compile("\"exp\"\\s*:\\s*(\\d+)");
    private static final Pattern ROLES_PATTERN = Pattern.compile("\"roles\"\\s*:\\s*\\[(.*?)]");
    private static final Pattern STRING_VALUE_PATTERN = Pattern.compile("\"([^\"]+)\"");

    @Value("${app.jwt.secret:change-this-secret-key-before-production}")
    private String secret;

    @Value("${app.jwt.expiration-ms:86400000}")
    private long expirationMs;

    public String generateToken(String username) {
        return generateToken(username, List.of("USER"));
    }

    public String generateToken(String username, Collection<?> roles) {
        long expiresAt = Instant.now().toEpochMilli() + expirationMs;
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = "{\"sub\":\"" + escapeJson(username) + "\",\"roles\":" + rolesJson(roles)
                + ",\"exp\":" + expiresAt + "}";

        String encodedHeader = base64UrlEncode(header.getBytes(StandardCharsets.UTF_8));
        String encodedPayload = base64UrlEncode(payload.getBytes(StandardCharsets.UTF_8));
        String content = encodedHeader + "." + encodedPayload;

        return content + "." + sign(content);
    }

    public boolean validateToken(String token) {
        String[] parts = splitToken(token);
        String content = parts[0] + "." + parts[1];
        String expectedSignature = sign(content);

        return MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8))
                && !isTokenExpired(parts[1])
                && extractUsername(token) != null;
    }

    public String extractUsername(String token) {
        String payload = decodePayload(token);
        Matcher matcher = SUBJECT_PATTERN.matcher(payload);

        if (!matcher.find()) {
            return null;
        }

        return matcher.group(1);
    }

    public List<String> extractRoles(String token) {
        String payload = decodePayload(token);
        Matcher rolesMatcher = ROLES_PATTERN.matcher(payload);

        if (!rolesMatcher.find()) {
            return List.of("USER");
        }

        List<String> roles = new ArrayList<>();
        Matcher valueMatcher = STRING_VALUE_PATTERN.matcher(rolesMatcher.group(1));

        while (valueMatcher.find()) {
            roles.add(valueMatcher.group(1).replace("ROLE_", ""));
        }

        if (roles.isEmpty()) {
            return List.of("USER");
        }

        return roles;
    }

    private boolean isTokenExpired(String encodedPayload) {
        String payload = new String(Base64.getUrlDecoder().decode(encodedPayload), StandardCharsets.UTF_8);
        Matcher matcher = EXPIRATION_PATTERN.matcher(payload);

        if (!matcher.find()) {
            return true;
        }

        long expiration = Long.parseLong(matcher.group(1));
        return expiration < Instant.now().toEpochMilli();
    }

    private String decodePayload(String token) {
        String[] parts = splitToken(token);
        return new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
    }

    private String[] splitToken(String token) {
        if (token == null) {
            throw new IllegalArgumentException("JWT token is required");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new IllegalArgumentException("JWT token must have three parts");
        }

        return parts;
    }

    private String sign(String content) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(key);
            return base64UrlEncode(mac.doFinal(content.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Unable to sign JWT token", exception);
        }
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String rolesJson(Collection<?> roles) {
        StringBuilder builder = new StringBuilder("[");
        boolean first = true;

        for (Object role : roles) {
            String roleName = roleName(role);

            if (!first) {
                builder.append(",");
            }

            builder.append("\"").append(escapeJson(roleName.replace("ROLE_", ""))).append("\"");
            first = false;
        }

        if (first) {
            builder.append("\"USER\"");
        }

        builder.append("]");
        return builder.toString();
    }

    private String roleName(Object role) {
        if (role instanceof GrantedAuthority authority) {
            return authority.getAuthority();
        }

        return String.valueOf(role);
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
