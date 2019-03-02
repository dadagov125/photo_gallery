package com.example.demo.services;

import ch.qos.logback.core.util.FileUtil;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class FileStorageImpl implements FileStorage {

    @Value("${file.storage.path}")
    private String uploadsPath;

    @Override
    public Path getUploadsPath(String filename) {
        Path path = Paths.get(this.uploadsPath, filename);

        File parent = path.getParent().toFile();

        if (!parent.exists()) {
            parent.setWritable(true);
            parent.setReadable(true);
            parent.mkdirs();
        }
        return path;
    }

    @Override
    public InputStream download(String filename) throws IOException {

        return Files.newInputStream(getUploadsPath(filename));
    }

    @Override
    public void upload(InputStream inputStream, String filename) throws IOException {
        Files.copy(inputStream, getUploadsPath(filename), StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public void reSort(Map<String, String> filenames) {

        filenames.forEach((key, oldFilename) -> {


            String newFilename = String.format("%s.%s", key, FilenameUtils.getExtension(oldFilename));

            if(oldFilename.equals(newFilename)){
                return;
            }

            File oldFile = getFile(oldFilename);

            if(!oldFile.exists()){
                return;
            }

            oldFile.renameTo(new File(FilenameUtils.concat(uploadsPath, "temp_"+newFilename)));

        });

        File[] files = Paths.get(uploadsPath).toFile().listFiles();

        for(File file: files){
            String name = file.getName();
            if(name.contains("temp_")){
                String newFilename=name.replace("temp_","");

                file.renameTo(new File(FilenameUtils.concat(uploadsPath, newFilename)));
            }
        }

    }

    @Override
    public boolean exist(String filename) {
        File file= getUploadsPath(filename).toFile();

       return file.exists();
    }

    @Override
    public void delete(String filename) {
        if (exist(filename)) {

            getUploadsPath(filename).toFile().delete();

        }
    }

    @Override
    public File getFile(String filename) {
        return getUploadsPath(filename).toFile();
    }

    @Override
    public List<String> fileList() {
        List<String> list = Arrays.asList(Paths.get(this.uploadsPath).toFile().list());

        Collections.sort(list);



        return list;
    }



}
