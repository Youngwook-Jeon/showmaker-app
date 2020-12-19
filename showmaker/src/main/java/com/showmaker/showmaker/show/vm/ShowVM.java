package com.showmaker.showmaker.show.vm;

import com.showmaker.showmaker.file.FileAttachmentVM;
import com.showmaker.showmaker.show.Show;
import com.showmaker.showmaker.user.vm.UserVM;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ShowVM {

    private long id;
    private String content;
    private LocalDateTime date;
    private UserVM user;
    private FileAttachmentVM attachment;

    public ShowVM(Show show) {
        this.setId(show.getId());
        this.setContent(show.getContent());
        this.setDate(show.getTimestamp());
        this.setUser(new UserVM(show.getUser()));
        if (show.getAttachment() != null) {
            this.setAttachment(new FileAttachmentVM(show.getAttachment()));
        }
    }
}
