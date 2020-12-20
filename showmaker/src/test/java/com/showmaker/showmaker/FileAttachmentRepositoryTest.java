package com.showmaker.showmaker;

import com.showmaker.showmaker.file.FileAttachment;
import com.showmaker.showmaker.file.FileAttachmentRepository;
import com.showmaker.showmaker.show.Show;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@DataJpaTest
@ActiveProfiles("test")
public class FileAttachmentRepositoryTest {

    @Autowired
    TestEntityManager testEntityManager;

    @Autowired
    FileAttachmentRepository fileAttachmentRepository;

    @Test
    public void findByDateBeforeAndShowIsNull_whenAttachmentsDateOlderThanOneHour_returnsAll() {
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getOneHourOldFileAttachment());
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndShowIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(3);
    }

    @Test
    public void findByDateBeforeAndShowIsNull_whenAttachmentsDateOlderThanOneHourButHaveShow_returnsNone() {
        Show show1 = testEntityManager.persist(TestUtil.createValidShow());
        Show show2 = testEntityManager.persist(TestUtil.createValidShow());
        Show show3 = testEntityManager.persist(TestUtil.createValidShow());

        testEntityManager.persist(getOldFileAttachmentWithShow(show1));
        testEntityManager.persist(getOldFileAttachmentWithShow(show2));
        testEntityManager.persist(getOldFileAttachmentWithShow(show3));
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndShowIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(0);
    }

    @Test
    public void findByDateBeforeAndShowIsNull_whenAttachmentsDateWithinOneHour_returnsNone() {
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndShowIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(0);
    }

    @Test
    public void findByDateBeforeAndShowIsNull_whenSomeAttachmentsOldSomeNewAndSomeWithShow_returnsAttachmentsWithOlderAndNoShowAssigned() {
        Show show1 = testEntityManager.persist(TestUtil.createValidShow());
        testEntityManager.persist(getOldFileAttachmentWithShow(show1));
        testEntityManager.persist(getOneHourOldFileAttachment());
        testEntityManager.persist(getFileAttachmentWithinOneHour());
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        List<FileAttachment> attachments = fileAttachmentRepository.findByDateBeforeAndShowIsNull(oneHourAgo);
        assertThat(attachments.size()).isEqualTo(1);
    }

    private FileAttachment getOneHourOldFileAttachment() {
        LocalDateTime date = LocalDateTime.now().minusHours(1).minusSeconds(1);
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(date);
        return fileAttachment;
    }

    private FileAttachment getFileAttachmentWithinOneHour() {
        LocalDateTime date = LocalDateTime.now().minusMinutes(1);
        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setDate(date);
        return fileAttachment;
    }

    private FileAttachment getOldFileAttachmentWithShow(Show show) {
        FileAttachment fileAttachment = getOneHourOldFileAttachment();
        fileAttachment.setShow(show);
        return fileAttachment;
    }
}
