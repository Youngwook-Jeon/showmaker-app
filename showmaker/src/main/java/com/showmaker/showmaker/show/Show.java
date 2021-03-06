package com.showmaker.showmaker.show;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.showmaker.showmaker.file.FileAttachment;
import com.showmaker.showmaker.user.User;
import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;

@Data
@Entity
public class Show {

    @Id
    @GeneratedValue
    private long id;

    @NotNull
    @Size(min = 10, max = 5000)
    @Column(length = 5000)
    private String content;

    private LocalDateTime timestamp;

    @ManyToOne
    private User user;

    @OneToOne(mappedBy = "show", orphanRemoval = true)
    private FileAttachment attachment;
}
