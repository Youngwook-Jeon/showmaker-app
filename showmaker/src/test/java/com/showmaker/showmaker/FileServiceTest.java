package com.showmaker.showmaker;

import com.showmaker.showmaker.configuration.AppConfiguration;
import com.showmaker.showmaker.file.FileAttachment;
import com.showmaker.showmaker.file.FileAttachmentRepository;
import com.showmaker.showmaker.file.FileService;
import org.apache.commons.io.FileUtils;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

@RunWith(SpringRunner.class)
@ActiveProfiles("test")
public class FileServiceTest {

    FileService fileService;

    AppConfiguration appConfiguration;

    @MockBean
    FileAttachmentRepository fileAttachmentRepository;

    @Before
    public void init() {
        appConfiguration = new AppConfiguration();
        appConfiguration.setUploadPath("uploads-test");

        fileService = new FileService(appConfiguration, fileAttachmentRepository);

        new File(appConfiguration.getUploadPath()).mkdir();
        new File(appConfiguration.getFullProfileImagesPath()).mkdir();
        new File(appConfiguration.getFullAttachmentsPath()).mkdir();
    }

    @After
    public void cleanup() throws IOException {
        FileUtils.cleanDirectory(new File(appConfiguration.getFullProfileImagesPath()));
        FileUtils.cleanDirectory(new File(appConfiguration.getFullAttachmentsPath()));
    }

    @Test
    public void detectType_whenPngFileProvided_returnsImagePng() throws IOException {
        ClassPathResource resource = new ClassPathResource("test-png.png");
        byte[] fileArr = FileUtils.readFileToByteArray(resource.getFile());
        String fileType = fileService.detectType(fileArr);
        assertThat(fileType).isEqualToIgnoringCase("image/png");
    }

    @Test
    public void cleanupStorage_whenOldFilesExist_removesFilesFromStorage() throws IOException {
        String fileName = "random-file";
        String filePath = appConfiguration.getFullAttachmentsPath() + "/" + fileName;
        File source = new ClassPathResource("profile-icon.png").getFile();
        File target = new File(filePath);
        FileUtils.copyFile(source, target);

        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setId(5);
        fileAttachment.setName(fileName);

        Mockito.when(fileAttachmentRepository.findByDateBeforeAndShowIsNull(Mockito.any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(fileAttachment));
        fileService.cleanupStorage();
        File storedImage = new File(filePath);
        assertThat(storedImage.exists()).isFalse();

    }

    @Test
    public void cleanupStorage_whenOldFilesExist_removesFileAttachmentFromDB() throws IOException {
        String fileName = "random-file";
        String filePath = appConfiguration.getFullAttachmentsPath() + "/" + fileName;
        File source = new ClassPathResource("profile-icon.png").getFile();
        File target = new File(filePath);
        FileUtils.copyFile(source, target);

        FileAttachment fileAttachment = new FileAttachment();
        fileAttachment.setId(5);
        fileAttachment.setName(fileName);

        Mockito.when(fileAttachmentRepository.findByDateBeforeAndShowIsNull(Mockito.any(LocalDateTime.class)))
                .thenReturn(Arrays.asList(fileAttachment));
        fileService.cleanupStorage();
        Mockito.verify(fileAttachmentRepository).deleteById(5L);

    }
}
