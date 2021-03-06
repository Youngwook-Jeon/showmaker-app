package com.showmaker.showmaker.user;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonView;
import com.showmaker.showmaker.show.Show;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.util.Collection;
import java.util.List;

@Data
@Entity
public class User implements UserDetails {

    private static final long serialVersionUID = 7986389567594716265L;

    @Id
    @GeneratedValue
    private long id;

    @NotNull(message = "{showmaker.constraints.username.NotNull.message}")
    @Size(min = 4, max = 255)
    @UniqueUsername
    private String username;

    @NotNull
    @Size(min = 4, max = 255)
    private String displayName;

    @NotNull
    @Size(min = 8, max = 255)
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).*$",
            message = "{showmaker.constraints.password.Pattern.message}")
    private String password;

    private String image;

    @OneToMany(mappedBy = "user")
    private List<Show> shows;

    @Override
    @java.beans.Transient
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return AuthorityUtils.createAuthorityList("Role_USER");
    }

    @Override
    @java.beans.Transient
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @java.beans.Transient
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    @java.beans.Transient
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    @java.beans.Transient
    public boolean isEnabled() {
        return true;
    }
}
