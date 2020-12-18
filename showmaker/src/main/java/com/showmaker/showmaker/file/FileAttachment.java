package com.showmaker.showmaker.file;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FileAttachment {

    private LocalDateTime date;

    private String name;
}
