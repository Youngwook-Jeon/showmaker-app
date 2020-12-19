package com.showmaker.showmaker.file;

import com.showmaker.showmaker.show.Show;
import lombok.Data;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import java.time.LocalDateTime;

@Data
@Entity
public class FileAttachment {

    @Id
    @GeneratedValue
    private long id;

    private LocalDateTime date;

    private String name;

    private String fileType;

    @OneToOne
    private Show show;

}
