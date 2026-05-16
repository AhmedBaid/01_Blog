package Blog.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class jwtFilter extends OncePerRequestFilter {

    private final jwtUtil jwtUtil;

    public jwtFilter(jwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String authorizationHeader = request.getHeader("Authorization");

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String token = authorizationHeader.substring(7);

            try {
                if (jwtUtil.validateToken(token) && SecurityContextHolder.getContext().getAuthentication() == null) {
                    String username = jwtUtil.extractUsername(token);
                    List<SimpleGrantedAuthority> authorities = jwtUtil.extractRoles(token)
                            .stream()
                            .map(this::toAuthority)
                            .toList();

                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (RuntimeException exception) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private SimpleGrantedAuthority toAuthority(String role) {
        if (role.startsWith("ROLE_")) {
            return new SimpleGrantedAuthority(role);
        }

        return new SimpleGrantedAuthority("ROLE_" + role);
    }
}
