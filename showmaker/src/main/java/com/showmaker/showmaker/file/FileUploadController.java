package com.showmaker.showmaker.file;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/1.0")
public class FileUploadController {

    @PostMapping("/shows/upload")
    FileAttachment uploadForShow() {
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(LocalDateTime.now());
        String randomName = UUID.randomUUID().toString().replaceAll("-", "");
        fileAttachment.setName(randomName);
        return fileAttachment;
    }
}
